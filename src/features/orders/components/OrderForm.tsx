import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Order, Product } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddressForm } from '@/components/address/AddressForm';
import { orderSchema } from '@/utils/validation';
import { DatePicker } from '@/components/ui/date-picker';
import { addDays, format, isBefore, isToday, startOfToday } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

interface OrderFormProps {
  floristId: string;
  products: Product[];
  businessHours: Record<string, { open: string; close: string; closed?: boolean }>;
  deliverySettings: {
    radius_km: number;
    fee: number;
    minimum_order: number;
    same_day_cutoff: string;
  };
  onSubmit: (data: OrderFormData) => Promise<void>;
  onCancel: () => void;
}

interface OrderFormData {
  delivery_date: Date;
  delivery_time_slot: string;
  delivery_address: {
    street_number: string;
    street_name: string;
    unit_number?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export function OrderForm({
  floristId,
  products,
  businessHours,
  deliverySettings,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [],
      delivery_date: new Date(),
    },
  });

  // Calculate available time slots based on selected date and business hours
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    const dayHours = businessHours[dayOfWeek];

    if (dayHours.closed) return [];

    const slots: string[] = [];
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    const [cutoffHour, cutoffMin] = deliverySettings.same_day_cutoff.split(':').map(Number);

    let startHour = openHour;
    let startMin = Math.ceil(openMin / 30) * 30;

    // If it's today and past cutoff time, no same-day delivery
    if (isToday(selectedDate)) {
      const now = new Date();
      if (now.getHours() > cutoffHour || (now.getHours() === cutoffHour && now.getMinutes() > cutoffMin)) {
        return [];
      }
      // Adjust start time if current time is after opening
      if (now.getHours() > openHour || (now.getHours() === openHour && now.getMinutes() > openMin)) {
        startHour = now.getHours();
        startMin = Math.ceil(now.getMinutes() / 30) * 30;
      }
    }

    // Generate 30-minute slots
    while (startHour < closeHour || (startHour === closeHour && startMin < closeMin)) {
      const endHour = startMin === 30 ? startHour + 1 : startHour;
      const endMin = startMin === 30 ? 0 : 30;
      
      slots.push(
        `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}-${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
      );

      if (startMin === 30) {
        startHour++;
        startMin = 0;
      } else {
        startMin = 30;
      }
    }

    return slots;
  }, [selectedDate, businessHours, deliverySettings.same_day_cutoff]);

  // Calculate order total
  const orderSummary = useMemo(() => {
    const subtotal = Object.entries(quantities).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);

    return {
      subtotal,
      deliveryFee: deliverySettings.fee,
      total: subtotal + deliverySettings.fee,
      meetsMinimumOrder: subtotal >= deliverySettings.minimum_order,
    };
  }, [quantities, products, deliverySettings]);

  // Handle quantity changes
  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }));
  };

  // Update form items when quantities change
  useEffect(() => {
    const items = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        product_id: productId,
        quantity,
      }));
    form.setValue('items', items);
  }, [quantities, form]);

  const handleSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setSelectedDate(date);
                      }}
                      minDate={new Date()}
                      maxDate={addDays(new Date(), 14)}
                      disabled={(date) => {
                        const day = format(date, 'EEEE').toLowerCase();
                        return businessHours[day]?.closed || false;
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Select a delivery date within the next 2 weeks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_time_slot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedDate || availableTimeSlots.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a delivery time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {!selectedDate
                      ? 'Select a delivery date first'
                      : availableTimeSlots.length === 0
                      ? 'No delivery slots available for this date'
                      : 'Choose your preferred delivery time'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="delivery_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <AddressForm
                      value={field.value}
                      onChange={field.onChange}
                      maxRadius={deliverySettings.radius_km}
                      floristId={floristId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-16 w-16 overflow-hidden rounded-lg">
                      <img
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        value={quantities[product.id] || 0}
                        onChange={(e) =>
                          handleQuantityChange(product.id, parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(orderSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(orderSummary.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(orderSummary.total)}</span>
              </div>
              {!orderSummary.meetsMinimumOrder && (
                <p className="text-sm text-destructive">
                  Minimum order amount is {formatCurrency(deliverySettings.minimum_order)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !orderSummary.meetsMinimumOrder ||
              Object.values(quantities).every((q) => q === 0)
            }
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
