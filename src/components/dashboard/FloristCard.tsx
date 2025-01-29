import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloristCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalReviews: number;
  location: string;
  isOpen: boolean;
  distance?: string;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function FloristCard({
  id,
  name,
  image,
  rating,
  totalReviews,
  location,
  isOpen,
  distance,
  onFavorite,
  isFavorite,
}: FloristCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-start gap-4">
        <img
          src={image}
          alt={name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{name}</h3>
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
                  ({totalReviews})
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
            {distance && <span className="ml-1">({distance})</span>}
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
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => window.location.href = `/florist/${id}`}
          >
            View Store
          </Button>
        </div>
      </div>
    </div>
  );
} 