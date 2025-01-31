import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
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
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link 
      to={`/product/${product.id}`}
      className={cn(
        "block aspect-[4/5] w-full relative group",
        className
      )}
    >
      <div className="h-full bg-[#EED2D8] border border-[#4A4F41]/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image Section */}
        <div className="h-[70%] md:h-[80%] relative overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.sale_price && (
              <span className="bg-[#E8E3DD]/90 backdrop-blur-sm text-[#4A4F41] text-[10px] px-2 py-0.5 rounded-full">
                Sale
              </span>
            )}
            {product.stock_status === 'low_stock' && (
              <span className="bg-[#E8E3DD]/90 backdrop-blur-sm text-[#4A4F41] text-[10px] px-2 py-0.5 rounded-full">
                Low Stock
              </span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="h-[30%] md:h-[20%] p-3 md:p-4">
          <h3 className="text-[11px] md:text-[15px] font-semibold text-[#4A4F41] line-clamp-1">
            {product.title}
          </h3>
          <p className="text-[10px] md:text-[12px] text-[#4A4F41]/70 line-clamp-1">
            {product.florist.store_name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              {product.sale_price ? (
                <>
                  <span className="text-[10px] md:text-[12px] font-medium text-[#4A4F41]/50 line-through">
                    ${product.price}
                  </span>
                  <span className="text-[10px] md:text-[12px] font-medium text-[#B37B54]">
                    ${product.sale_price}
                  </span>
                </>
              ) : (
                <span className="text-[10px] md:text-[12px] font-medium text-[#4A4F41]">
                  ${product.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 