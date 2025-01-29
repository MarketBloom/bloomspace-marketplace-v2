import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductHeader } from "@/components/product-detail/ProductHeader";
import { ProductImages } from "@/components/product-detail/ProductImages";
import { ProductPrice } from "@/components/product-detail/ProductPrice";
import { ProductDescription } from "@/components/product-detail/ProductDescription";
import { ProductSizeSelector } from "@/components/product-detail/ProductSizeSelector";
import { ProductActions } from "@/components/product-detail/ProductActions";
import { FloristInfo } from "@/components/product-detail/FloristInfo";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const selectedSizeId = searchParams.get('size');

  // Fetch product details including florist profile
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          florist_profiles!inner (
            id,
            store_name,
            street_address,
            suburb,
            state,
            postcode,
            about_text
          ),
          product_sizes (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
            <Button onClick={() => navigate("/search")}>
              Back to Search
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImages images={product.images} title={product.title} />
          
          <div className="space-y-6">
            <ProductHeader 
              title={product.title}
              floristName={product.florist_profiles.store_name}
            />
            
            <ProductDescription description={product.description} />
            
            <div className="space-y-4">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.title,
                  price: product.price,
                  image: product.images?.[0],
                  floristId: product.florist_id,
                  floristName: product.florist_profiles.store_name,
                  sizes: product.product_sizes,
                }}
                size="lg"
                className="w-full"
              />
              
              <FloristInfo
                florist={{
                  id: product.florist_profiles.id,
                  name: product.florist_profiles.store_name,
                  address: {
                    street: product.florist_profiles.street_address,
                    suburb: product.florist_profiles.suburb,
                    state: product.florist_profiles.state,
                    postcode: product.florist_profiles.postcode,
                  },
                  about: product.florist_profiles.about_text,
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}