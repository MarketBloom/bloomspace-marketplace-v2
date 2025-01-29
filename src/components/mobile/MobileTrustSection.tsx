import { Shield, Truck, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const MobileTrustSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-[#F5F5F7] md:hidden">
      <div className="container px-4">
        <div className="space-y-6">
          <img 
            src="/lovable-uploads/c7fd657a-4ba4-4d9b-bb36-f03266f5cdc0.png"
            alt="Local florist creating an arrangement"
            className="w-full h-48 object-cover rounded-2xl shadow-lg"
          />
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Support Local Artisan Florists</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Every arrangement is crafted with care by passionate local florists in your area. 
              Get fresh, beautiful flowers delivered right to your door.
            </p>
            <Button 
              onClick={() => navigate('/search')}
              className="w-full"
            >
              Find Your Local Florist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};