import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';
import { StructuredAddressInput } from '@/components/address/StructuredAddressInput';
import type { FloristProfile } from '@/types/florist';
import { useToast } from '@/components/ui/use-toast';
import { AddressAutocomplete } from '@/components/address/AddressAutocomplete';
import type { AddressDetails } from '@/types/address';
import { useEffect } from 'react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const profileSchema = z.object({
  store_name: z.string().min(2, "Store name must be at least 2 characters"),
  contact_name: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postal_code: z.string().min(4, "Postal code must be at least 4 characters"),
  about: z.string().min(20, "Tell us a bit more about your business (min 20 characters)"),
  logo_url: z.string().url("Please enter a valid URL").optional(),
  banner_url: z.string().url("Please enter a valid URL").optional(),
  address_details: z.object({
    formatted_address: z.string(),
    city: z.string(),
    state: z.string(),
    postcode: z.string()
  }).optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  store_name: "",
  contact_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  about: "",
  logo_url: "",
  banner_url: "",
};

interface ProfileDetailsFormProps {
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  initialValues?: Partial<ProfileFormValues>;
}

export function ProfileDetailsForm({
  onSubmit,
  initialValues,
}: ProfileDetailsFormProps) {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });

  // Watch form values for unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  const handleFormSubmit = async (values: ProfileFormValues) => {
    try {
      await onSubmit(values);
      
      toast({
        title: 'Success',
        description: 'Profile details updated successfully',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleReset = async () => {
    if (!form.formState.isDirty) return;
    
    const confirmed = await confirm("Are you sure you want to reset the form? This will discard all your changes.");

    if (confirmed) {
      form.reset(initialValues);
    }
  };

  const handleAddressSelect = (address: AddressDetails) => {
    form.setValue('address', address.formatted_address, { shouldDirty: true });
    form.setValue('city', address.city, { shouldDirty: true });
    form.setValue('state', address.state, { shouldDirty: true });
    form.setValue('postal_code', address.postcode, { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <FormField
                control={form.control}
                name="store_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your flower shop name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Your Business</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience, specialties, and what makes your flower shop unique..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be shown on your store profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/your-logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your store logo (recommended size: 200x200px)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="banner_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/your-banner.png"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your store banner (recommended size: 1200x400px)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                defaultValue={form.getValues('address')}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!form.formState.isDirty}
          >
            Reset Form
          </Button>
          <LoadingButton 
            type="submit"
            isLoading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
          </LoadingButton>
        </div>

        {form.formState.isDirty && (
          <p className="text-sm text-muted-foreground mt-2">
            You have unsaved changes
          </p>
        )}
      </form>
    </Form>
  );
}
