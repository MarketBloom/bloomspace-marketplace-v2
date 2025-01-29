import { ProductGrid } from "../ProductGrid";
import { FloristGrid } from "../FloristGrid";
import { SearchResultsHeader } from "../SearchResultsHeader";

interface MobileSearchResultsProps {
  viewMode: 'products' | 'florists';
  products: any[];
  florists: any[];
  isLoadingProducts: boolean;
  isLoadingFlorists: boolean;
}

export const MobileSearchResults = ({ 
  viewMode, 
  products, 
  florists,
  isLoadingProducts,
  isLoadingFlorists 
}: MobileSearchResultsProps) => {
  if (viewMode === 'products') {
    return (
      <div className="space-y-3">
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
    <div className="space-y-3">
      <SearchResultsHeader 
        isLoading={isLoadingFlorists}
        count={florists.length}
        type="florists"
      />
      <FloristGrid florists={florists} />
    </div>
  );
};