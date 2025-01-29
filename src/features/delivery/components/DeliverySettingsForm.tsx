import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '@/components/ui/loading-button';
import { useToast } from '@/components/ui/use-toast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog.tsx';
import type { DeliverySettingsJson } from '@/types/florist';
import { Button } from '@/components/ui/button';
import { calculateDistance } from '@/utils/hereApi';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { AddressAutocomplete } from '@/components/address/AddressAutocomplete';
import type { AddressWithCoordinates } from '@/types/address';

const deliverySettingsSchema = z.object({
  address: z.object({
    placeId: z.string(),
    description: z.string(),
    formattedAddress: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    addressComponents: z.object({
      streetNumber: z.string().optional(),
      route: z.string().optional(),
      locality: z.string().optional(),
      area: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }),
  }),
  deliveryRadius: z.number().min(1, 'Delivery radius must be at least 1km').max(50, 'Maximum delivery radius is 50km'),
  minimumOrder: z.number().min(0, 'Minimum order amount cannot be negative'),
  deliveryFee: z.number().min(0, 'Delivery fee cannot be negative'),
});

type DeliverySettingsFormData = z.infer<typeof deliverySettingsSchema>;

interface DeliverySettingsFormProps {
  initialData?: Partial<DeliverySettingsFormData>;
  onSubmit: (data: DeliverySettingsFormData) => void;
  formData: DeliverySettingsJson;
  setFormData: React.Dispatch<React.SetStateAction<DeliverySettingsJson>>;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const DEFAULT_SETTINGS: DeliverySettingsJson = {
  distance_type: 'driving',
  max_distance_km: 10,
  same_day_cutoff: '14:00',
  next_day_cutoff_enabled: true,
  next_day_cutoff: '18:00',
  minimum_order: 50,
  delivery_fee: 10,
};

export function DeliverySettingsForm({ initialData = DEFAULT_SETTINGS, onSubmit, formData, setFormData, onNext, onBack, isLoading }: DeliverySettingsFormProps) {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const form = useForm<DeliverySettingsFormData>({
    resolver: zodResolver(deliverySettingsSchema),
    defaultValues: {
      address: initialData.address || {
        placeId: '',
        description: '',
        formattedAddress: '',
        coordinates: { lat: 0, lng: 0 },
        addressComponents: {},
      },
      deliveryRadius: initialData.deliveryRadius || 10,
      minimumOrder: initialData.minimumOrder || 0,
      deliveryFee: initialData.deliveryFee || 0,
    },
  });

  // Watch form values for unsaved changes warning
  const formValues = form.watch();
  
  useEffect(() => {
    // Setup beforeunload handler for unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  const handleReset = async () => {
    if (!form.formState.isDirty) return;
    
    const confirmed = await confirm({
      title: "Reset Delivery Settings?",
      description: "Are you sure you want to reset all delivery settings? This will discard all your changes.",
      confirmText: "Reset Settings",
      cancelText: "Keep Editing",
      variant: "destructive"
    });

    if (confirmed) {
      form.reset(initialData);
    }
  };

  const handleFormSubmit = async (data: DeliverySettingsFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Delivery settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update delivery settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      throw error; // Re-throw to let react-hook-form handle the error state
    }
  };

  const [calculating, setCalculating] = useState(false);

  const handleAddressSelected = (address: AddressWithCoordinates) => {
    form.setValue('address', address, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="address"
          render={() => (
            <FormItem>
              <FormLabel>Delivery Address</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  onAddressSelected={handleAddressSelected}
                  initialValue={form.getValues('address')?.formattedAddress}
                  placeholder="Search for your delivery address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryRadius"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Radius (km)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={1}
                    max={50}
                    step={1}
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {field.value}km
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minimumOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order Amount ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Enter minimum order amount"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Fee ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Enter delivery fee"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4 pt-4">
          <LoadingButton
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!form.formState.isDirty || isLoading}
          >
            Reset Settings
          </LoadingButton>
          
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Saving..."
            disabled={!form.formState.isDirty}
          >
            Save Settings
          </LoadingButton>
        </div>

        {form.formState.isDirty && (
          <p className="text-sm text-muted-foreground mt-2">
            You have unsaved changes
          </p>
        )}

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline">Back</Button>
          <Button onClick={onNext}>Next</Button>
        </div>
      </form>
    </Form>
  );
}
