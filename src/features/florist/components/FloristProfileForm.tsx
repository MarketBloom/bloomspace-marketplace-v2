import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFlorist } from '@/hooks/useFlorist';
import { AddressInput } from '@/components/address/AddressInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { floristProfileSchema } from '@/utils/validation';
import type { FloristProfileFormData } from '@/types/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface FloristProfileFormProps {
  userId: string;
}

export function FloristProfileForm({ userId }: FloristProfileFormProps) {
  const { profile, updateProfile, isLoading } = useFlorist(userId);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const form = useForm<FloristProfileFormData>({
    resolver: zodResolver(floristProfileSchema),
    defaultValues: {
      store_name: profile?.store_name || '',
      store_status: profile?.store_status || 'pending',
      about_text: profile?.about_text || '',
      contact_email: profile?.contact_email || '',
      contact_phone: profile?.contact_phone || '',
      website_url: profile?.website_url || '',
      address: profile?.address || {
        street_number: '',
        street_name: '',
        suburb: '',
        state: '',
        postcode: '',
      },
      business_settings: profile?.business_settings || {
        delivery: {
          radius_km: 10,
          fee: 0,
          minimum_order: 0,
          same_day_cutoff: '14:00',
        },
        hours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: { open: '09:00', close: '17:00' },
          sunday: { open: '09:00', close: '17:00' },
        },
      },
    },
  });

  const onSubmit = async (data: FloristProfileFormData) => {
    try {
      setSaving(true);
      await updateProfile(data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>
              Enter your store information and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Store Name */}
            <FormField
              control={form.control}
              name="store_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your store name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* About Text */}
            <FormField
              control={form.control}
              name="about_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Your Store</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tell customers about your store..."
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="your@email.com"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Phone */}
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="0400 000 000"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website URL */}
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://your-website.com"
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card>
          <CardHeader>
            <CardTitle>Store Address</CardTitle>
            <CardDescription>
              Enter your store's physical address. This will be used for delivery calculations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <AddressInput
                    value={field.value}
                    onChange={field.onChange}
                    onValidationError={(error) => {
                      form.setError('address', { message: error });
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={saving}
          >
            Reset
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
