import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { useState, useEffect } from "react";
import { SearchHeader } from "@/components/search/SearchHeader";
import { MobileSearchResults } from "@/components/search/mobile/MobileSearchResults";
import { MobileFilterButton } from "@/components/search/MobileFilterButton";
import { MobileDeliveryInfo } from "@/components/search/mobile/MobileDeliveryInfo";
import { useSearchParams } from "react-router-dom";
import { useSearchProducts } from "@/components/search/hooks/useSearchProducts";
import { useSearchFlorists } from "@/components/search/hooks/useSearchFlorists";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { useScreenSize } from "../hooks/use-screen-size";

const MobileSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'products' | 'florists'>('products');
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("delivery");
  const screenSize = useScreenSize();

  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    const fulfillment = searchParams.get('fulfillment');
    if (fulfillment === 'pickup' || fulfillment === 'delivery') {
      setFulfillmentType(fulfillment);
    }
  }, [searchParams]);

  const { data: products, isLoading: isLoadingProducts } = useSearchProducts({
    fulfillmentType,
    searchParams,
    userCoordinates: null
  });

  const { data: florists, isLoading: isLoadingFlorists } = useSearchFlorists({
    searchParams,
    userCoordinates: null
  });

  return (
    <div className="min-h-screen bg-[#eed2d8]">
      <div className="absolute inset-0 pointer-events-none z-50">
        <PixelTrail
          pixelSize={48}
          fadeDuration={200}
          delay={50}
          className="h-full w-full"
          pixelClassName="rounded-full bg-[#FFD700] opacity-70"
        />
      </div>
      
      <div className="relative z-30">
        <Header />
        
        <div className="relative">
          <div className="relative z-10 px-4 pt-[72px]">
            <MobileDeliveryInfo />
            <MobileFilterButton />

            <div className="mt-3">
              <SearchHeader viewMode={viewMode} setViewMode={setViewMode} />
              <MobileSearchResults 
                viewMode={viewMode}
                products={products || []}
                florists={florists || []}
                isLoadingProducts={isLoadingProducts}
                isLoadingFlorists={isLoadingFlorists}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSearch;