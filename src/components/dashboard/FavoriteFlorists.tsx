import { Button } from "@/components/ui/button";
import { FloristCard } from "./FloristCard";

interface Florist {
  id: string;
  name: string;
  image: string;
  rating: number;
  totalReviews: number;
  location: string;
  isOpen: boolean;
  distance?: string;
}

interface FavoriteFloristsProps {
  florists: Florist[];
  isLoading?: boolean;
  onRemoveFavorite?: (id: string) => void;
}

export function FavoriteFlorists({
  florists,
  isLoading,
  onRemoveFavorite,
}: FavoriteFloristsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Favorite Florists</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (florists.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Favorite Florists</h2>
        </div>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">You haven't saved any florists yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.href = "/search"}
          >
            Browse Florists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Favorite Florists</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = "/favorites"}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {florists.map((florist) => (
          <FloristCard
            key={florist.id}
            {...florist}
            isFavorite={true}
            onFavorite={
              onRemoveFavorite ? () => onRemoveFavorite(florist.id) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}