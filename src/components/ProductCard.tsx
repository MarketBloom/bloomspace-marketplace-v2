import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  price: number;
  sale_price?: number | null;
  images: string[];
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  florist: {
    id: string;
    store_name: string;
  };
}

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square overflow-hidden rounded-t-2xl">
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
        />
        {product.sale_price && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
              Sale
            </span>
          </div>
        )}
        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-medium px-4 py-2 bg-black/40 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-medium text-gray-900 line-clamp-1">
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          By{" "}
          <a
            href={`/florist/${product.florist.id}`}
            className="hover:text-pink-600 transition-colors font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {product.florist.store_name}
          </a>
        </p>
        <div className="mt-3">
          {product.sale_price ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-pink-600">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        {product.stock_status === 'low_stock' && (
          <p className="mt-2 text-sm font-medium text-pink-600 flex items-center">
            <span className="w-1.5 h-1.5 bg-pink-600 rounded-full mr-1.5" />
            Low stock
          </p>
        )}
      </div>
    </div>
  );
} 