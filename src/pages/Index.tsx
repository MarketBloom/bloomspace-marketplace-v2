import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { ErrorBoundary } from "../components/ui/error-boundary";
import { useToast } from "../hooks/use-toast";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { FeaturedFlorists } from "../components/FeaturedFlorists";
import { Testimonials } from "../components/Testimonials";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { MobileLayout } from "../layouts/MobileLayout";
import { MobileHero } from "../components/MobileHero";

export default function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: florists } = useQuery({
    queryKey: ["featured-florists"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("florist_profiles")
          .select(`
            id,
            store_name,
            about_text,
            address_details,
            logo_url,
            banner_url,
            delivery_settings
          `)
          .eq("store_status", "active")
          .limit(4);

        if (error) throw error;
        return data;
      } catch (error) {
        if (toast.error) {
          toast.error("Error loading florists", error instanceof Error ? error.message : "An error occurred");
        }
        return [];
      }
    },
  });

  const handleSearch = async (searchParams: {
    location: string;
    date?: Date;
    budget?: [number, number];
    deliveryType: "delivery" | "pickup";
  }) => {
    // Navigate to search page with parameters
    const params = new URLSearchParams();
    params.set("location", searchParams.location);
    if (searchParams.date) {
      params.set("date", searchParams.date.toISOString());
    }
    if (searchParams.budget) {
      params.set("minPrice", searchParams.budget[0].toString());
      params.set("maxPrice", searchParams.budget[1].toString());
    }
    params.set("deliveryType", searchParams.deliveryType);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileLayout>
          <MobileHero onSearch={handleSearch} />
        </MobileLayout>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <ErrorBoundary>
          <main className="bg-[#E8E3DD]">
            <Hero onSearch={handleSearch} />
            <HowItWorks />
            <FeaturedFlorists florists={florists || []} />
            <Testimonials />
          </main>
          <Footer />
        </ErrorBoundary>
      </div>
    </>
  );
}