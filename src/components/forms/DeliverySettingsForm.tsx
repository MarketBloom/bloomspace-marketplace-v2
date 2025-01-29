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
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useEffect } from "react";
import { LoadingButton } from "@/components/ui/loading-button";

const deliverySettingsSchema = z.object({
  delivery_radius: z.number().min(0, "Delivery radius must be positive"),
  base_delivery_fee: z.number().min(0, "Base delivery fee must be positive"),
  min_order_amount: z.number().min(0, "Minimum order amount must be positive"),
  free_delivery_threshold: z.number().min(0, "Free delivery threshold must be positive"),
  is_delivery_enabled: z.boolean(),
  per_km_fee: z.number().min(0, "Per kilometer fee must be positive"),
  max_daily_deliveries: z.number().int().min(1, "Maximum daily deliveries must be at least 1"),
});

type DeliverySettingsValues = z.infer<typeof deliverySettingsSchema>;

const defaultValues: DeliverySettingsValues = {
  delivery_radius: 10,
  base_delivery_fee: 5,
  min_order_amount: 30,
  free_delivery_threshold: 100,
  is_delivery_enabled: true,
  per_km_fee: 1,
  max_daily_deliveries: 20,
};

interface DeliverySettingsFormProps {
  onSubmit: (values: DeliverySettingsValues) => Promise<void>;
  initialValues?: Partial<DeliverySettingsValues>;
}

export function DeliverySettingsForm({
  onSubmit,
  initialValues,
}: DeliverySettingsFormProps) {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const form = useForm<DeliverySettingsValues>({
    resolver: zodResolver(deliverySettingsSchema),
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
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const handleReset = async () => {
    if (!form.formState.isDirty) return;

    const confirmed = await confirm(
      "Are you sure you want to reset the delivery settings? This will discard all your changes."
    );

    if (confirmed) {
      form.reset(initialValues);
    }
  };

  const handleFormSubmit = async (values: DeliverySettingsValues) => {
    try {
      await onSubmit(values);
      toast({
        title: "Success",
        description: "Delivery settings updated successfully",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update delivery settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="is_delivery_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Delivery</FormLabel>
                    <FormDescription>
                      Turn on delivery services for your store
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("is_delivery_enabled") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="delivery_radius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Radius (km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum distance for delivery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_daily_deliveries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Daily Deliveries</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum deliveries per day
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="base_delivery_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Delivery Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Starting delivery fee
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="per_km_fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Per Kilometer Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Additional fee per kilometer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_order_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum order value for delivery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="free_delivery_threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Delivery Threshold ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Order amount for free delivery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
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
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
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