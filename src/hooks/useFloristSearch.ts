import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FloristProfile } from '@/types/florist';
import { calculateDistance, isWithinDeliveryRadius, filterFloristsByDistance } from '@/utils/distance';
import { validateFloristCoordinates } from '@/utils/coordinates';
import { format, isToday, parseISO, isBefore, parse } from 'date-fns';

interface UseFloristSearchParams {
  location?: string;
  budget?: number;
  categories?: string[];
  occasions?: string[];
  fulfillmentMethod?: 'delivery' | 'pickup';
  userCoordinates?: { lat: number; lng: number } | null;
  searchQuery?: string;
  maxDistance?: number;
  deliveryDate?: string; // YYYY-MM-DD format
  deliveryTime?: string; // HH:mm format
}

function isTimeWithinRange(time: string, start: string, end: string): boolean {
  const [timeHour, timeMin] = time.split(':').map(Number);
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const timeValue = timeHour * 60 + timeMin;
  const startValue = startHour * 60 + startMin;
  const endValue = endHour * 60 + endMin;

  return timeValue >= startValue && timeValue <= endValue;
}

function isFloristAvailable(
  florist: FloristProfile,
  deliveryDate?: string,
  deliveryTime?: string
): { available: boolean; reason?: string } {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  
  // If no date specified, assume it's for today
  const targetDate = deliveryDate ? parseISO(deliveryDate) : now;
  const dayOfWeek = format(targetDate, 'EEEE').toLowerCase();
  
  // Check if florist operates on this day
  const dayHours = florist.operating_hours?.[dayOfWeek];
  if (!dayHours || dayHours.closed) {
    return { available: false, reason: `Closed on ${format(targetDate, 'EEEE')}` };
  }

  // Check if it's same-day delivery
  const isSameDayDelivery = isToday(targetDate);
  
  if (isSameDayDelivery) {
    const cutoffTime = florist.delivery_settings?.same_day_cutoff;
    if (!cutoffTime) {
      return { available: false, reason: 'Same-day delivery not available' };
    }
    
    if (currentTime > cutoffTime) {
      return { available: false, reason: `Past same-day delivery cutoff (${cutoffTime})` };
    }
  }

  // If specific delivery time is requested
  if (deliveryTime) {
    // Check if time is within operating hours
    if (!isTimeWithinRange(deliveryTime, dayHours.open, dayHours.close)) {
      return { 
        available: false, 
        reason: `Delivery time outside operating hours (${dayHours.open}-${dayHours.close})` 
      };
    }
  }

  return { available: true };
}

export function useFloristSearch(params: UseFloristSearchParams) {
  const {
    location,
    budget,
    categories,
    occasions,
    fulfillmentMethod,
    userCoordinates,
    searchQuery,
    maxDistance = 50, // Default to 50km
    deliveryDate,
    deliveryTime
  } = params;

  return useQuery({
    queryKey: ['floristSearch', params],
    queryFn: async () => {
      try {
        // Base query for active florists
        let query = supabase
          .from('florist_profiles')
          .select(`
            id,
            user_id,
            store_name,
            store_status,
            about_text,
            contact_email,
            contact_phone,
            website_url,
            address_details,
            banner_url,
            logo_url,
            social_links,
            location,
            delivery_settings,
            operating_hours,
            delivery_slots,
            products (
              id,
              title,
              price,
              sale_price,
              images,
              category,
              categories,
              occasion,
              tags,
              status,
              stock_status
            )
          `)
          .eq('store_status', 'active');

        // Handle location search
        if (location) {
          const searchTerms = location.toLowerCase().split(/[\s,]+/);
          const { data: locationResults, error: locationError } = await supabase
            .rpc('search_florists_by_location', { search_terms: searchTerms });

          if (locationError) {
            console.error('Error searching by location:', locationError);
            throw locationError;
          }

          if (locationResults) {
            query = query.in('id', locationResults.map(f => f.id));
          }
        }

        // Handle store name search
        if (searchQuery) {
          query = query.ilike('store_name', `%${searchQuery}%`);
        }

        // Filter by budget (look at product prices)
        if (budget) {
          query = query.lt('products.price', budget);
        }

        // Filter by categories
        if (categories?.length) {
          query = query.contains('products.categories', categories);
        }

        // Filter by occasions
        if (occasions?.length) {
          query = query.contains('products.occasion', occasions);
        }

        // Filter by fulfillment method
        if (fulfillmentMethod === 'delivery') {
          query = query.not('delivery_settings', 'is', null);
        }

        console.log('Executing search with params:', params);
        const { data, error } = await query;

        if (error) {
          console.error('Error searching florists:', error);
          throw error;
        }

        let florists = data as FloristProfile[];

        // Post-process the results
        if (userCoordinates) {
          // Filter and sort by distance
          const floristsWithDistance = await filterFloristsByDistance(
            userCoordinates,
            florists,
            fulfillmentMethod === 'delivery' // Use driving distance for delivery, direct for pickup
          );

          // Filter by max distance and availability
          florists = floristsWithDistance
            .filter(florist => {
              // Check max distance
              if (florist.distance > maxDistance) return false;

              // Check time-based availability
              const availability = isFloristAvailable(florist, deliveryDate, deliveryTime);
              if (!availability.available) return false;

              return true;
            })
            .map(florist => ({
              ...florist,
              availability: isFloristAvailable(florist, deliveryDate, deliveryTime)
            }))
            .sort((a, b) => a.distance - b.distance);
        } else if (location) {
          // Sort by location relevance if no coordinates
          const locationLower = location.toLowerCase();
          florists = florists
            .map(florist => {
              // Check time-based availability
              const availability = isFloristAvailable(florist, deliveryDate, deliveryTime);
              if (!availability.available) return null;

              return {
                ...florist,
                availability
              };
            })
            .filter((f): f is FloristProfile & {
              availability: { available: boolean; reason?: string; }
            } => f !== null)
            .sort((a, b) => {
              const aMatch = (a.address_details?.suburb + ' ' + a.address_details?.state)
                .toLowerCase().includes(locationLower);
              const bMatch = (b.address_details?.suburb + ' ' + b.address_details?.state)
                .toLowerCase().includes(locationLower);
              return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
            });
        }

        return florists;
      } catch (error) {
        console.error('Error in useFloristSearch:', error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
