import { Header } from "@/components/Header";
import { MobileHero } from "@/components/MobileHero";
import { MobileHowItWorks } from "@/components/MobileHowItWorks";
import { MobileCategories } from "@/components/mobile/MobileCategories";
import { MobileFeaturedProducts } from "@/components/mobile/MobileFeaturedProducts";
import { MobileTrustSection } from "@/components/mobile/MobileTrustSection";
import { MobileTestimonials } from "@/components/mobile/MobileTestimonials";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MobileIndex = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          florist_profiles (
            store_name
          )
        `)
        .eq('in_stock', true)
        .eq('is_hidden', false)
        .limit(6);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    },
    retry: 1,
    retryDelay: 1000,
    meta: {
      onError: () => {
        console.error('Query error:', error);
        toast.error("Failed to load featured products. Please try again later.");
      }
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[60px]">
        <MobileHero />
        <MobileHowItWorks />
        <MobileCategories />
        <MobileFeaturedProducts 
          products={products || []} 
          isLoading={isLoading} 
        />
        <MobileTrustSection />
        <MobileTestimonials />
      </main>
    </div>
  );
};

export default MobileIndex;