import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MobileFeaturedProductsProps {
  products: any[];
  isLoading: boolean;
}

export const MobileFeaturedProducts = ({ products, isLoading }: MobileFeaturedProductsProps) => {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-[#F5F5F7] md:hidden">
      <div className="container px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Featured Arrangements</h2>
          <p className="text-base text-muted-foreground mt-1">Fresh picks from local artisans</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {products?.slice(0, 4).map((product) => (
                <div key={product.id}>
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    displayPrice={product.displayPrice || product.price}
                    description={product.description}
                    images={product.images}
                    floristName={product.florist_profiles?.store_name}
                    floristId={product.florist_id}
                    displaySize={product.displaySize}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button 
                variant="secondary"
                onClick={() => navigate('/search')}
                className="shadow-apple hover:shadow-apple-hover transition-shadow duration-300"
              >
                View All
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};