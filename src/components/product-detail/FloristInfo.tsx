import { MapPin, Clock, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloristInfoProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalReviews: number;
  location: string;
  isOpen: boolean;
  description?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function FloristInfo({
  id,
  name,
  image,
  rating,
  totalReviews,
  location,
  isOpen,
  description,
  deliveryFee,
  minimumOrder,
  onFavorite,
  isFavorite,
}: FloristInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  ({totalReviews} reviews)
                </span>
              </div>
            </div>
            {onFavorite && (
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"
                }`}
                onClick={onFavorite}
              >
                <Star className={isFavorite ? "fill-current" : ""} />
              </Button>
            )}
          </div>

          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>

          <div className="mt-1 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span
              className={`text-sm ${
                isOpen ? "text-green-600" : "text-red-600"
              }`}
            >
              {isOpen ? "Open Now" : "Closed"}
            </span>
          </div>

          {description && (
            <p className="mt-3 text-sm text-gray-600">{description}</p>
          )}

          {(deliveryFee !== undefined || minimumOrder !== undefined) && (
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              {deliveryFee !== undefined && (
                <p>Delivery Fee: ${deliveryFee.toFixed(2)}</p>
              )}
              {minimumOrder !== undefined && (
                <p>Minimum Order: ${minimumOrder.toFixed(2)}</p>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.location.href = `/florist/${id}`}
            >
              View Store
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 