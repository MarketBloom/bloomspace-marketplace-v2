import { useFloristSearch } from '@/hooks/useFloristSearch';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { FloristProfile } from '@/types/florist';

interface FloristGridProps {
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  searchQuery?: string;
  location?: string;
  budget?: number;
  categories?: string[];
  occasions?: string[];
  fulfillmentMethod?: 'delivery' | 'pickup';
  deliveryDate?: string;
  deliveryTime?: string;
}

export function FloristGrid({
  latitude,
  longitude,
  maxDistance = 10,
  searchQuery = '',
  location,
  budget,
  categories,
  occasions,
  fulfillmentMethod,
  deliveryDate,
  deliveryTime,
}: FloristGridProps) {
  const debouncedQuery = useDebounce(searchQuery, 500);

  const {
    data: florists,
    isLoading,
    error,
  } = useFloristSearch({
    location: location || searchQuery,
    budget,
    categories,
    occasions,
    fulfillmentMethod,
    userCoordinates: latitude && longitude ? { lat: latitude, lng: longitude } : null,
    maxDistance,
    deliveryDate,
    deliveryTime,
  });

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading florists. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  if (!florists?.length) {
    return (
      <div className="text-center text-gray-500 p-8">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-12 w-12 text-gray-400" />
          <h3 className="font-semibold text-lg">No Florists Available</h3>
          <p className="text-sm text-gray-500">
            {deliveryDate && deliveryTime
              ? "No florists are available for delivery at the selected time."
              : "No florists found matching your criteria."}
          </p>
          {fulfillmentMethod === 'delivery' && (
            <p className="text-sm text-gray-500">
              Try expanding your search radius or selecting a different delivery time.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {florists.map((florist) => (
        <Link
          key={florist.id}
          to={`/florist/${florist.id}`}
          className="block hover:no-underline"
        >
          <Card className="p-4 h-full hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
              {florist.banner_url ? (
                <img
                  src={florist.banner_url}
                  alt={florist.store_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{florist.store_name}</h3>
              
              {florist.address_details && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                  <span>
                    {florist.address_details.suburb}, {florist.address_details.state}
                  </span>
                </div>
              )}

              {florist.distance !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {florist.distance.toFixed(1)}km away
                  </Badge>
                  {fulfillmentMethod === 'delivery' && florist.delivery_settings && (
                    <Badge variant="outline">
                      {florist.delivery_settings.fee === 0 
                        ? 'Free Delivery'
                        : `$${florist.delivery_settings.fee.toFixed(2)} Delivery`}
                    </Badge>
                  )}
                </div>
              )}

              {florist.availability && !florist.availability.available && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span>{florist.availability.reason}</span>
                </div>
              )}

              {fulfillmentMethod === 'delivery' && florist.delivery_settings && (
                <div className="text-sm text-gray-500">
                  Min. order: ${florist.delivery_settings.minimum_order.toFixed(2)}
                </div>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}