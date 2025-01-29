import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FeaturedProductsProps {
  products: any[];
  isLoading: boolean;
  navigate: (path: string) => void;
}

export const FeaturedProducts = ({ products, isLoading, navigate }: FeaturedProductsProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.product-card');
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { 
            opacity: 0,
            y: 50
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top bottom-=100",
              end: "top center",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [products]);

  return (
    <section ref={sectionRef} className="py-8 bg-[#F5F5F7]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Featured Arrangements</h2>
            <p className="text-base text-muted-foreground mt-1">Fresh picks from local artisan florists</p>
          </div>
          <Button 
            variant="secondary"
            onClick={() => navigate('/search')}
            className="hidden md:flex shadow-apple hover:shadow-apple-hover transition-shadow duration-300"
          >
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-3">
              {products?.map((product) => (
                <div key={product.id} className="product-card" data-speed={1 + Math.random()}>
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
                className="md:hidden shadow-apple hover:shadow-apple-hover transition-shadow duration-300"
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