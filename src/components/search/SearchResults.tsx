import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { ProductGrid } from "./ProductGrid";
import { FloristGrid } from "./FloristGrid";
import { SearchResultsHeader } from "./SearchResultsHeader";

gsap.registerPlugin(ScrollTrigger);

interface SearchResultsProps {
  viewMode: 'products' | 'florists';
  products: any[];
  florists: any[];
  isLoadingProducts: boolean;
  isLoadingFlorists: boolean;
}

export const SearchResults = ({ 
  viewMode, 
  products, 
  florists,
  isLoadingProducts,
  isLoadingFlorists 
}: SearchResultsProps) => {
  useEffect(() => {
    // Only apply scroll animations if there are at least 7 items
    const items = viewMode === 'products' ? products : florists;
    if (items.length < 7) return;

    // Create scroll animations for each product card
    const cards = document.querySelectorAll('.product-card-animate');
    
    cards.forEach((card, index) => {
      // Alternate between different scroll speeds
      const speed = [0.8, 1.2, 2.0][index % 3];
      card.setAttribute('data-speed', speed.toString());

      gsap.timeline({
        scrollTrigger: {
          scrub: 1,
          trigger: card,
          start: "top 90%",
          end: "bottom 30%",
        }
      }).fromTo(card, 
        { 
          y: 50,
        },
        { 
          y: 0,
          duration: 1,
          ease: "power2.out"
        }
      );
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [products, florists, viewMode]);

  if (viewMode === 'products') {
    return (
      <div className="space-y-4 px-2 lg:px-0">
        <SearchResultsHeader 
          isLoading={isLoadingProducts}
          count={products.length}
          type="products"
        />
        <ProductGrid products={products} />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 lg:px-0">
      <SearchResultsHeader 
        isLoading={isLoadingFlorists}
        count={florists.length}
        type="florists"
      />
      <FloristGrid florists={florists} />
    </div>
  );
};