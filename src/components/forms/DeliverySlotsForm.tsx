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
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

const deliverySlotsSchema = z.object({
  slots: z.array(
    z.object({
      start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Please enter a valid time in 24-hour format (HH:MM)",
      }),
      end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: "Please enter a valid time in 24-hour format (HH:MM)",
      }),
      max_orders: z.number().min(1, "Must allow at least 1 order per slot"),
      buffer_minutes: z.number().min(0, "Buffer time cannot be negative"),
    })
  ),
});

type DeliverySlotsValues = z.infer<typeof deliverySlotsSchema>;

const defaultValues: DeliverySlotsValues = {
  slots: [
    {
      start_time: "09:00",
      end_time: "12:00",
      max_orders: 5,
      buffer_minutes: 30,
    },
    {
      start_time: "12:00",
      end_time: "15:00",
      max_orders: 5,
      buffer_minutes: 30,
    },
    {
      start_time: "15:00",
      end_time: "18:00",
      max_orders: 5,
      buffer_minutes: 30,
    },
  ],
};

interface DeliverySlotsFormProps {
  onSubmit: (values: DeliverySlotsValues) => Promise<void>;
  initialValues?: DeliverySlotsValues;
}

export function DeliverySlotsForm({
  onSubmit,
  initialValues = defaultValues,
}: DeliverySlotsFormProps) {
  const form = useForm<DeliverySlotsValues>({
    resolver: zodResolver(deliverySlotsSchema),
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  const addTimeSlot = () => {
    append({
      start_time: "09:00",
      end_time: "17:00",
      max_orders: 5,
      buffer_minutes: 30,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Delivery Time Slots</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTimeSlot}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="grid grid-cols-4 gap-4 flex-1">
                  <FormField
                    control={form.control}
                    name={`slots.${index}.start_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`slots.${index}.end_time`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`slots.${index}.max_orders`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Orders</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`slots.${index}.buffer_minutes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buffer (mins)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={5}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Time between deliveries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="text-center p-4 border border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                No delivery slots configured
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addTimeSlot}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Slot
              </Button>
            </div>
          )}
        </div>

        <Button type="submit">Save Time Slots</Button>
      </form>
    </Form>
  );
}
