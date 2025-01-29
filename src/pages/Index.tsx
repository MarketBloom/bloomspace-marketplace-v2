import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustSection } from "@/components/TrustSection";
import { Testimonials } from "@/components/Testimonials";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Database } from "@/types/database";

type Product = Database['public']['Tables']['products']['Row'];

const Index = () => {
  const { toast } = useToast();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            title,
            description,
            price,
            images,
            active,
            florist_id,
            created_at,
            updated_at
          `)
          .eq('active', true)
          .limit(8)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }

        if (!data) {
          return [];
        }

        // Transform the data to handle image paths
        return data.map((item: Product) => ({
          ...item,
          images: item.images?.length > 0 
            ? item.images.map((img: string) => img.startsWith('http') ? img : `/images/products/${img}`)
            : ['/images/placeholder.jpg']
        }));
      } catch (err) {
        console.error('Error in products query:', err);
        throw err;
      }
    },
    retry: 1
  });

  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      toast({
        title: "Error",
        description: "Failed to load featured products. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <Categories />
      <ErrorBoundary>
        <FeaturedProducts products={products || []} isLoading={isLoading} />
      </ErrorBoundary>
      <HowItWorks />
      <TrustSection />
      <Testimonials />
    </div>
  );
};

export default Index;