import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFlorist } from '@/hooks/useFlorist';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { businessSettingsSchema } from '@/utils/validation';
import type { BusinessSettings } from '@/types/schema';
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

interface BusinessSettingsFormProps {
  userId: string;
}

export function BusinessSettingsForm({ userId }: BusinessSettingsFormProps) {
  const { profile, updateBusinessSettings, isLoading } = useFlorist(userId);
  const { toast } = useToast();

  const form = useForm<BusinessSettings>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: profile?.business_settings || {
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
  });

  const onSubmit = async (data: BusinessSettings) => {
    try {
      await updateBusinessSettings(data);
      toast({
        title: 'Settings Updated',
        description: 'Your business settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      });
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
        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
            <CardDescription>
              Configure your delivery radius and fees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Radius */}
            <FormField
              control={form.control}
              name="delivery.radius_km"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Radius (km)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum distance you're willing to deliver
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Fee */}
            <FormField
              control={form.control}
              name="delivery.fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Fee ($)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Minimum Order */}
            <FormField
              control={form.control}
              name="delivery.minimum_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order ($)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Same Day Cutoff */}
            <FormField
              control={form.control}
              name="delivery.same_day_cutoff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Same Day Cutoff Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                    />
                  </FormControl>
                  <FormDescription>
                    Last time to accept same-day delivery orders
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>
              Set your store's operating hours for each day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                <div key={day} className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Label className="capitalize">{day}</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name={`hours.${day}.open`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`hours.${day}.close`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
