import { useState } from "react";
import { StoreSettingsForm } from "@/components/store-management/StoreSettingsForm";
import { useToast } from "@/hooks/use-toast";
import { useFloristProfile } from "@/hooks/useFloristProfile";

export const FloristManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    floristProfile,
    isLoading: isLoadingProfile,
    error,
    updateProfile,
  } = useFloristProfile(undefined); // Admin view might need a different approach for fetching profiles

  const handleProfileUpdate = async () => {
    if (!floristProfile) return;
    
    setLoading(true);
    try {
      await updateProfile.mutateAsync(floristProfile);
      toast({
        title: "Success",
        description: "Store settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast({
        title: "Error",
        description: "Failed to update store settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load florist profile",
      variant: "destructive",
    });
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Store Management</h1>
      <div className="bg-white shadow-sm rounded-lg p-6">
        <StoreSettingsForm 
          initialData={floristProfile}
          onSubmit={handleProfileUpdate}
          loading={loading || isLoadingProfile}
        />
      </div>
    </div>
  );
};

export default FloristManagement;