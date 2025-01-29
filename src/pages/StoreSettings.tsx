import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const StoreSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { data: floristProfile, refetch } = useQuery({
    queryKey: ["floristProfile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("florist_profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    store_name: floristProfile?.store_name || "",
    street_address: floristProfile?.street_address || "",
    suburb: floristProfile?.suburb || "",
    state: floristProfile?.state || "",
    postcode: floristProfile?.postcode || "",
    about_text: floristProfile?.about_text || "",
    delivery_fee: floristProfile?.delivery_fee || 0,
    delivery_radius: floristProfile?.delivery_radius || 5,
    minimum_order_amount: floristProfile?.minimum_order_amount || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("florist_profiles")
        .update(formData)
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Store settings updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating store settings:", error);
      toast.error("Failed to update store settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Store Settings</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store Name</label>
              <Input
                value={formData.store_name}
                onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Street Address</label>
              <Input
                value={formData.street_address}
                onChange={(e) => setFormData(prev => ({ ...prev, street_address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Suburb</label>
              <Input
                value={formData.suburb}
                onChange={(e) => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Postcode</label>
              <Input
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">About</label>
              <Textarea
                value={formData.about_text}
                onChange={(e) => setFormData(prev => ({ ...prev, about_text: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Fee ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.delivery_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Radius (km)</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={formData.delivery_radius}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_radius: parseFloat(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Order Amount ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.minimum_order_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_amount: parseFloat(e.target.value) }))}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StoreSettings;
