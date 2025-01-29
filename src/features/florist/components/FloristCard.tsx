import { Link } from "react-router-dom";
import { MapPin, Clock, DollarSign, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatAddressLine } from "@/utils/format";
import type { FloristProfile } from "@/types/florist";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FloristBanner } from "./florist-card/FloristBanner";
import { FloristInfo } from "./florist-card/FloristInfo";
import { SocialLinks } from "./florist-card/SocialLinks";

interface FloristCardProps {
  id: string;
  storeName: string;
  streetNumber: string;
  streetName: string;
  unitNumber?: string;
  suburb: string;
  state: string;
  postcode: string;
  aboutText?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  deliveryFee?: number | null;
  deliveryRadius?: number | null;
  minimumOrderAmount?: number | null;
  operatingHours?: Record<string, any> | null;
  socialLinks?: Record<string, string> | null;
  coordinates?: { lat: number; lng: number } | null;
  deliveryDistanceKm?: number | null;
}

export function FloristCard({
  id,
  storeName,
  streetNumber,
  streetName,
  unitNumber,
  suburb,
  state,
  postcode,
  aboutText,
  bannerUrl,
  logoUrl,
  deliveryFee,
  deliveryRadius,
  minimumOrderAmount,
  operatingHours,
  coordinates,
  socialLinks,
  deliveryDistanceKm,
}: FloristCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Format the full address
  const formattedAddress = formatAddressLine({
    streetNumber,
    streetName,
    unitNumber,
    suburb,
    state,
    postcode
  });

  const getMapUrl = () => {
    if (!coordinates) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${storeName} ${formattedAddress}`
    )}`;
  };

  const isWithinDeliveryRadius = deliveryRadius && deliveryDistanceKm 
    ? deliveryDistanceKm <= deliveryRadius
    : null;

  const { data: favorite, isLoading: checkingFavorite } = useQuery({
    queryKey: ["favorite", user?.id, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorite_florists")
        .select("id")
        .eq("customer_id", user?.id)
        .eq("florist_id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("favorite_florists")
        .insert({
          customer_id: user?.id,
          florist_id: id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite", user?.id, id] });
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast({
        title: "Added to favorites",
        description: `${storeName} has been added to your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("favorite_florists")
        .delete()
        .eq("customer_id", user?.id)
        .eq("florist_id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite", user?.id, id] });
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast({
        title: "Removed from favorites",
        description: `${storeName} has been removed from your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add florists to your favorites",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (favorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  return (
    <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <FloristBanner
        storeName={storeName}
        bannerUrl={bannerUrl}
        logoUrl={logoUrl}
        isFavorite={!!favorite}
        isLoading={checkingFavorite}
        onToggleFavorite={handleToggleFavorite}
      />

      <div className="p-4">
        <FloristInfo
          storeName={storeName}
          address={formattedAddress}
          mapUrl={getMapUrl()}
          aboutText={aboutText}
          deliveryFee={deliveryFee}
          deliveryRadius={deliveryRadius}
          minimumOrderAmount={minimumOrderAmount}
          deliveryDistanceKm={deliveryDistanceKm}
          isWithinDeliveryRadius={isWithinDeliveryRadius}
          operatingHours={operatingHours}
        />

        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <SocialLinks links={socialLinks} />
        )}

        <div className="mt-4 flex justify-end">
          <Link
            to={`/florist/${id}`}
            className="text-primary hover:text-primary/80 font-medium"
          >
            View Store →
          </Link>
        </div>
      </div>
    </Card>
  );
}