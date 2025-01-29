import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FloristBannerProps {
  storeName: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  isFavorite: boolean;
  isLoading: boolean;
  onToggleFavorite: () => void;
}

export function FloristBanner({
  storeName,
  bannerUrl,
  logoUrl,
  isFavorite,
  isLoading,
  onToggleFavorite,
}: FloristBannerProps) {
  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-48 bg-gradient-to-r from-pink-100 to-rose-100">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt={`${storeName} banner`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Logo */}
      {logoUrl && (
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden">
            <img
              src={logoUrl}
              alt={`${storeName} logo`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-4 right-4">
        {isLoading ? (
          <Skeleton className="h-8 w-8 rounded-full" />
        ) : (
          <Button
            size="icon"
            variant={isFavorite ? "default" : "secondary"}
            onClick={onToggleFavorite}
            className={`rounded-full ${
              isFavorite ? "bg-primary text-white" : "bg-white/90 text-gray-600"
            } hover:scale-105 transition-transform`}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        )}
      </div>
    </div>
  );
}