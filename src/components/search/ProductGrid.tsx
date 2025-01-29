import { ProductCard } from "@/components/ProductCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductGridProps {
  products: any[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  const isMobile = useIsMobile();

  const getGridClassName = () => {
    if (isMobile) {
      return "grid grid-cols-2 gap-3";
    }
    return "grid grid-cols-3 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 gap-3";
  };

  return (
    <div className={getGridClassName()}>
      {products.map((product, index) => (
        <div 
          key={`${product.id}-${product.sizeId || 'default'}`}
          className="product-card-animate"
        >
          <ProductCard {...product} />
        </div>
      ))}
    </div>
  );
};