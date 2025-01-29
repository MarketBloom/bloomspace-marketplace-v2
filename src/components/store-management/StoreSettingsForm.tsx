import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StructuredAddressInput } from "@/components/address/StructuredAddressInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FloristProfile, AddressDetails, DeliverySettings } from "@/types/florist";
import { Loader2, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DeliverySlotConfig } from "./DeliverySlotConfig";

interface StoreSettingsFormProps {
  initialData?: Partial<FloristProfile>;
  onSubmit?: (data: Partial<FloristProfile>) => Promise<void>;
  loading?: boolean;
}

export const StoreSettingsForm = ({ initialData, onSubmit, loading: externalLoading }: StoreSettingsFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    store_name: initialData?.store_name || "",
    about_text: initialData?.about_text || "",
    address_details: initialData?.address_details || {
      street_number: "",
      street_name: "",
      unit_number: "",
      suburb: "",
      state: "",
      postcode: "",
    },
    delivery_settings: initialData?.delivery_settings || {
      distance_type: "radius" as const,
      max_distance_km: 5,
      same_day_cutoff: "14:00",
      next_day_cutoff_enabled: false,
      next_day_cutoff: null,
      minimum_order: 0,
      delivery_fee: 0,
    },
    delivery_slots: initialData?.delivery_slots || {
      weekdays: {
        slots: [
          { name: "Morning", start: "09:00", end: "12:00", enabled: true },
          { name: "Afternoon", start: "12:00", end: "15:00", enabled: true },
        ]
      },
      weekends: {
        slots: [
          { name: "Morning", start: "10:00", end: "13:00", enabled: true },
        ]
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliverySettingChange = (name: keyof DeliverySettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      delivery_settings: {
        ...prev.delivery_settings,
        [name]: value
      }
    }));
  };

  const handleAddressChange = (address: {
    street_number: string;
    street_name: string;
    unit_number?: string;
    suburb: string;
    state: string;
    postcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }) => {
    console.log('Address changed:', address);
    setFormData(prev => ({
      ...prev,
      address_details: {
        street_number: address.street_number,
        street_name: address.street_name,
        unit_number: address.unit_number || "",
        suburb: address.suburb,
        state: address.state,
        postcode: address.postcode,
      },
      location: {
        type: "Point",
        coordinates: [address.coordinates.lng, address.coordinates.lat]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveSuccess(false);
    
    try {
      console.log('Submitting form data:', formData);
      
      // Validate required fields
      if (!formData.store_name || !formData.address_details.street_number || !formData.address_details.street_name) {
        console.log('Missing required fields:', {
          store_name: !formData.store_name,
          street_number: !formData.address_details.street_number,
          street_name: !formData.address_details.street_name,
        });
        
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const updateData: Partial<FloristProfile> = {
        ...formData,
        delivery_settings: {
          ...formData.delivery_settings,
          max_distance_km: parseFloat(formData.delivery_settings.max_distance_km),
          delivery_fee: parseFloat(formData.delivery_settings.delivery_fee),
          minimum_order: parseFloat(formData.delivery_settings.minimum_order),
        },
      };
      
      console.log('Sending update with data:', updateData);

      if (onSubmit) {
        await onSubmit(updateData);
      }

      setSaveSuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating store settings:', error);
      toast({
        title: "Error",
        description: "Failed to update store settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="store_name">Store Name</Label>
        <Input
          id="store_name"
          name="store_name"
          value={formData.store_name}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Store Address</Label>
        <StructuredAddressInput
          value={{
            street_number: formData.address_details.street_number,
            street_name: formData.address_details.street_name,
            unit_number: formData.address_details.unit_number,
            suburb: formData.address_details.suburb,
            state: formData.address_details.state,
            postcode: formData.address_details.postcode,
          }}
          onChange={handleAddressChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="about_text">About Your Store</Label>
        <Textarea
          id="about_text"
          name="about_text"
          value={formData.about_text || ""}
          onChange={handleInputChange}
          rows={4}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Delivery Settings</h3>
        
        <div className="flex items-center space-x-4">
          <Label>Distance Type</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.delivery_settings.distance_type === "driving"}
              onCheckedChange={(checked) => 
                handleDeliverySettingChange("distance_type", checked ? "driving" : "radius")
              }
            />
            <span>{formData.delivery_settings.distance_type === "driving" ? "Driving Distance" : "Radius"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_distance">Maximum Distance (km)</Label>
            <Input
              id="max_distance"
              name="max_distance_km"
              type="number"
              value={formData.delivery_settings.max_distance_km}
              onChange={(e) => handleDeliverySettingChange("max_distance_km", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="same_day_cutoff">Same Day Cutoff Time</Label>
            <Input
              id="same_day_cutoff"
              name="same_day_cutoff"
              type="time"
              value={formData.delivery_settings.same_day_cutoff}
              onChange={(e) => handleDeliverySettingChange("same_day_cutoff", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Delivery Fee ($)</Label>
            <Input
              id="delivery_fee"
              name="delivery_fee"
              type="number"
              value={formData.delivery_settings.delivery_fee}
              onChange={(e) => handleDeliverySettingChange("delivery_fee", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum_order">Minimum Order ($)</Label>
            <Input
              id="minimum_order"
              name="minimum_order"
              type="number"
              value={formData.delivery_settings.minimum_order}
              onChange={(e) => handleDeliverySettingChange("minimum_order", parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Label>Enable Next Day Cutoff</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.delivery_settings.next_day_cutoff_enabled}
              onCheckedChange={(checked) => 
                handleDeliverySettingChange("next_day_cutoff_enabled", checked)
              }
            />
          </div>
        </div>

        {formData.delivery_settings.next_day_cutoff_enabled && (
          <div className="space-y-2">
            <Label htmlFor="next_day_cutoff">Next Day Cutoff Time</Label>
            <Input
              id="next_day_cutoff"
              name="next_day_cutoff"
              type="time"
              value={formData.delivery_settings.next_day_cutoff || ""}
              onChange={(e) => handleDeliverySettingChange("next_day_cutoff", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Delivery Slots</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure your delivery time slots for weekdays and weekends. You can add up to 3 slots per day type.
        </p>
        
        <DeliverySlotConfig
          value={formData.delivery_slots}
          onChange={(slots) => setFormData(prev => ({ ...prev, delivery_slots: slots }))}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || externalLoading}
        className="w-full relative"
      >
        {isLoading || externalLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Changes
          </>
        ) : saveSuccess ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Saved Successfully
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  );
};