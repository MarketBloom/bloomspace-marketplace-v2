import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/format";

interface ProductHeaderProps {
  title: string;
  price: number;
  sale_price?: number;
  rating?: number;
  total_reviews?: number;
  florist: {
    id: string;
    store_name: string;
  };
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export function ProductHeader({
  title,
  price,
  sale_price,
  rating,
  total_reviews,
  florist,
  stock_status,
  onFavorite,
  isFavorited,
}: ProductHeaderProps) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        url: window.location.href,
      });
    } catch (error) {
      // Handle share error or fallback
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          <div className="mt-2">
            <h2 className="sr-only">Product information</h2>
            <div className="flex items-center">
              {sale_price ? (
                <div className="flex items-center gap-2">
                  <p className="text-3xl tracking-tight text-gray-900">
                    {formatPrice(sale_price)}
                  </p>
                  <p className="text-lg text-gray-500 line-through">
                    {formatPrice(price)}
                  </p>
                </div>
              ) : (
                <p className="text-3xl tracking-tight text-gray-900">
                  {formatPrice(price)}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          {rating && (
            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(rating) ? "text-yellow-400" : "text-gray-200"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 15.585l-6.327 3.89 1.42-7.897L.18 6.74l7.862-1.088L10 0l2.958 5.652 7.862 1.088-4.913 4.838 1.42 7.897L10 15.585z"
                      />
                    </svg>
                  ))}
                </div>
                {total_reviews && (
                  <p className="ml-2 text-sm text-gray-500">
                    {total_reviews} reviews
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Florist */}
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              By{" "}
              <a
                href={`/florist/${florist.id}`}
                className="font-medium text-primary hover:text-primary/80"
              >
                {florist.store_name}
              </a>
            </p>
          </div>

          {/* Stock Status */}
          {stock_status && (
            <div className="mt-4">
              <p
                className={`text-sm ${
                  stock_status === "out_of_stock"
                    ? "text-red-600"
                    : stock_status === "low_stock"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {stock_status === "out_of_stock"
                  ? "Out of Stock"
                  : stock_status === "low_stock"
                  ? "Low Stock"
                  : "In Stock"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-4">
            {onFavorite && (
              <Button
                variant="outline"
                size="icon"
                onClick={onFavorite}
                className="relative"
              >
                <Heart
                  className={isFavorited ? "fill-red-500 stroke-red-500" : ""}
                />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="relative"
            >
              <Share2 />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 