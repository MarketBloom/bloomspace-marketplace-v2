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
import { Switch } from "@/components/ui/switch";
import { useEffect } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { useToast } from '@/components/ui/use-toast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog.tsx';

const businessHoursSchema = z.object({
  days: z.array(
    z.object({
      day: z.string(),
      is_open: z.boolean(),
      open_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Please enter a valid time in 24-hour format (HH:MM)",
      }),
      close_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Please enter a valid time in 24-hour format (HH:MM)",
      }),
    })
  ),
});

type BusinessHoursValues = z.infer<typeof businessHoursSchema>;

const defaultValues: BusinessHoursValues = {
  days: [
    { day: "monday", is_open: true, open_time: "09:00", close_time: "17:00" },
    { day: "tuesday", is_open: true, open_time: "09:00", close_time: "17:00" },
    { day: "wednesday", is_open: true, open_time: "09:00", close_time: "17:00" },
    { day: "thursday", is_open: true, open_time: "09:00", close_time: "17:00" },
    { day: "friday", is_open: true, open_time: "09:00", close_time: "17:00" },
    { day: "saturday", is_open: true, open_time: "10:00", close_time: "16:00" },
    { day: "sunday", is_open: false, open_time: "10:00", close_time: "16:00" },
  ],
};

interface BusinessHoursFormProps {
  onSubmit: (values: BusinessHoursValues) => Promise<void>;
  initialValues?: BusinessHoursValues;
}

export function BusinessHoursForm({
  onSubmit,
  initialValues = defaultValues,
}: BusinessHoursFormProps) {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const form = useForm<BusinessHoursValues>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: initialValues,
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

  const validateTimeRange = (day: string) => {
    const values = formValues[day];
    if (!values.is_open) return true;
    
    const open_time = values.open_time;
    const close_time = values.close_time;
    
    if (!open_time || !close_time) return false;
    
    const openTime = new Date(`2025-01-24T${open_time}`);
    const closeTime = new Date(`2025-01-24T${close_time}`);
    
    return closeTime > openTime;
  };

  const handleReset = async () => {
    if (!form.formState.isDirty) return;
    
    const confirmed = await confirm("Are you sure you want to reset all business hours? This will discard all your changes.");

    if (confirmed) {
      form.reset(initialValues);
    }
  };

  const handleFormSubmit = async (values: BusinessHoursValues) => {
    try {
      // Validate time ranges
      const invalidDays = values.days.filter(day => !validateTimeRange(day.day));
      if (invalidDays.length > 0) {
        toast({
          title: "Invalid Hours",
          description: `Please check the opening and closing times for: ${invalidDays.map(day => day.day).join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      await onSubmit(values);
      toast({
        title: "Success",
        description: "Business hours updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update business hours: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      // Don't re-throw the error, just handle it here
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="space-y-4">
          {form.watch("days").map((day, index) => (
            <div
              key={day.day}
              className="flex flex-col space-y-4 p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium capitalize">{day.day}</h3>
                <FormField
                  control={form.control}
                  name={`days.${index}.is_open`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch(`days.${index}.is_open`) && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`days.${index}.open_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`days.${index}.close_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-4 pt-4">
          <LoadingButton
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!form.formState.isDirty}
          >
            Reset Hours
          </LoadingButton>
          
          <LoadingButton
            type="submit"
            isLoading={form.formState.isSubmitting}
            loadingText="Saving..."
            disabled={!form.formState.isDirty}
          >
            Save Business Hours
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
