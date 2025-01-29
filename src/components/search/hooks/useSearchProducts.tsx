import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO } from "date-fns";
import { filterFloristsByDrivingDistance } from "@/utils/distance";

interface UseSearchProductsProps {
  fulfillmentType: "pickup" | "delivery";
  searchParams: URLSearchParams;
  userCoordinates: [number, number] | null;
}

export const useSearchProducts = ({ fulfillmentType, searchParams, userCoordinates }: UseSearchProductsProps) => {
  return useQuery({
    queryKey: ['products', fulfillmentType, searchParams.toString(), userCoordinates],
    queryFn: async () => {
      console.log('Fetching products with params:', {
        fulfillmentType,
        searchParams: Object.fromEntries(searchParams.entries()),
        userCoordinates
      });

      const budgetStr = searchParams.get('budget');
      const maxBudget = budgetStr ? parseInt(budgetStr) : undefined;
      const location = searchParams.get('location');
      const dateStr = searchParams.get('date');
      const selectedCategories = searchParams.getAll('categories');
      const selectedOccasions = searchParams.getAll('occasions');

      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          sale_price,
          images,
          category,
          categories,
          occasion,
          tags,
          status,
          stock_status,
          stock_quantity,
          florist_id,
          metadata,
          florist_profiles!inner (
            id,
            store_name,
            address_details,
            business_settings
          ),
          product_sizes (
            id,
            name,
            price_adjustment,
            images,
            is_default,
            stock_quantity
          )
        `)
        .eq('status', 'published')
        .eq('stock_status', 'in_stock');

      if (maxBudget) {
        query = query.lte('price', maxBudget);
      }

      if (selectedCategories.length > 0) {
        query = query.contains('categories', selectedCategories);
      }

      if (selectedOccasions.length > 0) {
        query = query.contains('occasion', selectedOccasions);
      }

      const { data: productsData, error } = await query;
      if (error) throw error;

      const now = new Date();
      const currentTime = format(now, 'HH:mm:ss');
      const searchDate = dateStr ? parseISO(dateStr) : null;
      const dayOfWeek = searchDate ? format(searchDate, 'EEEE').toLowerCase() : null;

      // Filter products based on location and driving distance
      let filteredProducts = productsData;
      
      if (location && userCoordinates) {
        // Prepare florists data for distance calculation
        const floristsMap = new Map();
        const floristsForDistance = productsData
          .map(product => {
            const florist = product.florist_profiles;
            const coordinates = florist.address_details?.coordinates;
            if (!coordinates) return null;
            
            try {
              if (!floristsMap.has(florist.id)) {
                floristsMap.set(florist.id, {
                  coordinates: [coordinates.lng, coordinates.lat],
                  delivery_distance_km: florist.business_settings?.delivery?.radius_km || 5
                });
              }
              return floristsMap.get(florist.id);
            } catch (e) {
              console.error('Error parsing coordinates for florist:', florist.store_name, e);
              return null;
            }
          })
          .filter(Boolean);

        // Calculate which florists are within driving distance
        const withinDistance = await filterFloristsByDrivingDistance(
          userCoordinates,
          Array.from(floristsMap.values())
        );

        // Create a set of florist IDs within distance
        const floristIdsWithinDistance = new Set(
          Array.from(floristsMap.keys()).filter((_, index) => withinDistance[index])
        );

        // Filter products based on florist distance
        filteredProducts = productsData.filter(product => 
          floristIdsWithinDistance.has(product.florist_profiles.id)
        );
      }

      // Create product variants and apply other filters
      const productsWithVariants = filteredProducts.flatMap(product => {
        const settings = product.florist_profiles?.business_settings;
        
        // Check if florist delivers on the selected day
        if (dayOfWeek && fulfillmentType === "delivery" && 
            settings?.delivery?.days && 
            !settings.delivery.days.includes(dayOfWeek)) {
          return [];
        }

        // For same-day delivery, check cutoff time
        const isSameDay = searchDate && isToday(searchDate);
        const cutoffTime = settings?.delivery?.same_day_cutoff;
        
        if (isSameDay && cutoffTime && currentTime > cutoffTime) {
          return [];
        }

        if (!product.product_sizes || product.product_sizes.length === 0) {
          return [{
            ...product,
            displaySize: null,
            displayPrice: product.sale_price || product.price,
            sizeId: null,
            floristName: product.florist_profiles?.store_name,
            isDeliveryAvailable: fulfillmentType === "delivery" && 
              (!isSameDay || (cutoffTime && currentTime < cutoffTime)),
            isPickupAvailable: fulfillmentType === "pickup" && 
              settings?.hours?.[dayOfWeek || 'monday']?.open,
            deliveryCutoff: settings?.delivery?.same_day_cutoff,
            pickupCutoff: settings?.hours?.[dayOfWeek || 'monday']?.close
          }];
        }

        return product.product_sizes.map(size => ({
          ...product,
          displaySize: size.name,
          displayPrice: (product.sale_price || product.price) + (size.price_adjustment || 0),
          sizeId: size.id,
          floristName: product.florist_profiles?.store_name,
          isDeliveryAvailable: fulfillmentType === "delivery" && 
            (!isSameDay || (cutoffTime && currentTime < cutoffTime)),
          isPickupAvailable: fulfillmentType === "pickup" && 
            settings?.hours?.[dayOfWeek || 'monday']?.open,
          deliveryCutoff: settings?.delivery?.same_day_cutoff,
          pickupCutoff: settings?.hours?.[dayOfWeek || 'monday']?.close,
          images: size.images?.length ? size.images : product.images
        }));
      });

      return productsWithVariants;
    },
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};