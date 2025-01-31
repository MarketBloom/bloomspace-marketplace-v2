import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/format";

interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number;
  images: string[];
  florist: {
    id: string;
    store_name: string;
  };
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  rating?: number;
  total_reviews?: number;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onFavorite?: (productId: string) => void;
  favorites?: Set<string>;
}

export function ProductGrid({ products, loading, onFavorite, favorites = new Set() }: ProductGridProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200" />
            <div className="mt-4 h-4 bg-gray-200 rounded w-3/4" />
            <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
            <div className="mt-2 h-4 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="group relative">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
            <img
              src={product.images[0]}
              alt={product.title}
              className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
            />
            {product.sale_price && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-red-800">
                  Sale
                </span>
              </div>
            )}
            {onFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(product.id);
                }}
              >
                <Heart
                  className={favorites.has(product.id) ? "fill-red-500 stroke-red-500" : ""}
                />
              </Button>
            )}
            {product.stock_status === 'out_of_stock' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                <a onClick={() => navigate(`/product/${product.id}`)}>
                  <span aria-hidden="true" className="absolute inset-0" />
                  {product.title}
                </a>
              </h3>
              <p className="mt-1 text-sm text-gray-500">By {product.florist.store_name}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                {product.sale_price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {product.rating && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.rating)
                            ? "text-yellow-400"
                            : "text-gray-200"
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
                  {product.total_reviews && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({product.total_reviews})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 