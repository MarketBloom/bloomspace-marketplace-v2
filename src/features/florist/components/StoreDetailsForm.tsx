import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AddressAutocomplete } from '@/components/address/AddressAutocomplete';
import type { AddressWithCoordinates } from '@/types/address';

const storeDetailsSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().url().optional(),
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
});

type StoreDetailsFormData = z.infer<typeof storeDetailsSchema>;

interface StoreDetailsFormProps {
  onSubmit: (data: StoreDetailsFormData) => void;
  initialData?: Partial<StoreDetailsFormData>;
  isLoading?: boolean;
}

export function StoreDetailsForm({ onSubmit, initialData, isLoading }: StoreDetailsFormProps) {
  const form = useForm<StoreDetailsFormData>({
    resolver: zodResolver(storeDetailsSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      website: initialData?.website || '',
      address: initialData?.address || {
        placeId: '',
        description: '',
        formattedAddress: '',
        coordinates: { lat: 0, lng: 0 },
        addressComponents: {},
      },
    },
  });

  const handleAddressSelected = (address: AddressWithCoordinates) => {
    form.setValue('address', address, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your store name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell customers about your store..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Enter store phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter store email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="Enter store website" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={() => (
            <FormItem>
              <FormLabel>Store Address</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  onAddressSelected={handleAddressSelected}
                  initialValue={form.getValues('address')?.formattedAddress}
                  placeholder="Search for your store address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Store Details'}
        </Button>
      </form>
    </Form>
  );
}