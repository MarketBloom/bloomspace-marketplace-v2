import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AddressAutocomplete } from '@/components/address/AddressAutocomplete';

// Verified this matches our database schema
interface StoreSettings {
  id: string;
  store_name: string;
  street_address: string;
  about_text: string | null;
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  delivery_cutoff: string | null;
  delivery_start_time: string;
  delivery_end_time: string;
  delivery_slot_duration: string;
  delivery_fee: number;
  delivery_radius: number;
  minimum_order_amount: number;
  delivery_days: string[];
  delivery_time_frames: {
    morning: boolean;
    midday: boolean;
    afternoon: boolean;
  };
  same_day_enabled: boolean;
  coordinates: any;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
}

export function StoreSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    if (user) {
      loadStoreSettings();
    }
  }, [user]);

  const loadStoreSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('florist_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load store settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (section: keyof StoreSettings, values: any) => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (section === 'store_name' && !values.store_name) {
        throw new Error('Store name is required');
      }

      const { error } = await supabase
        .from('florist_profiles')
        .update({ [section]: values })
        .eq('id', user?.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, [section]: values } : null);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  if (!settings) {
    return <div>No settings found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Store Settings</h2>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="hours">Operating Hours</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium mb-4">Store Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <Input
                  value={settings.store_name}
                  onChange={(e) => setSettings(prev => prev ? {
                    ...prev,
                    store_name: e.target.value
                  } : null)}
                  onBlur={() => saveSettings('store_name', settings.store_name)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Store Address</label>
                <AddressAutocomplete
                  onAddressSelect={(address) => {
                    const addressData = {
                      street_address: address.formatted_address,
                      suburb: address.suburb,
                      state: address.state,
                      postcode: address.postcode,
                      coordinates: address.location
                    };
                    saveSettings('street_address', addressData);
                  }}
                  defaultValue={settings.street_address}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">About</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  value={settings.about_text || ''}
                  onChange={(e) => setSettings(prev => prev ? {
                    ...prev,
                    about_text: e.target.value
                  } : null)}
                  onBlur={() => saveSettings('about_text', settings.about_text)}
                  rows={4}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-medium mb-4">Delivery Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Radius (km)</label>
                  <Input
                    type="number"
                    value={settings.delivery_radius}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      delivery_radius: parseFloat(e.target.value)
                    } : null)}
                    onBlur={() => saveSettings('delivery_radius', settings.delivery_radius)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Fee ($)</label>
                  <Input
                    type="number"
                    value={settings.delivery_fee}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      delivery_fee: parseFloat(e.target.value)
                    } : null)}
                    onBlur={() => saveSettings('delivery_fee', settings.delivery_fee)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order Amount ($)</label>
                <Input
                  type="number"
                  value={settings.minimum_order_amount}
                  onChange={(e) => setSettings(prev => prev ? {
                    ...prev,
                    minimum_order_amount: parseFloat(e.target.value)
                  } : null)}
                  onBlur={() => saveSettings('minimum_order_amount', settings.minimum_order_amount)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          {/* Operating Hours Component here */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 