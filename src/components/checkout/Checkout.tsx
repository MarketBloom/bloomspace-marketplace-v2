import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { calculateTotalPrice } from '@/lib/price';

const checkoutSchema = z.object({
  deliveryAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'Valid ZIP code is required'),
  }),
  deliveryInstructions: z.string().optional(),
  giftMessage: z.string().optional(),
  recipientPhone: z.string().min(10, 'Valid phone number is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, clearCart } = useCartStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const deliveryAddress = watch('deliveryAddress');

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsProcessing(true);

      // Validate cart is not empty
      if (cart.items.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Validate delivery zone
      const isInDeliveryZone = await useCartStore.getState().validateDeliveryZone(
        cart.floristId!,
        data.deliveryAddress
      );

      if (!isInDeliveryZone) {
        throw new Error('Delivery address is outside the delivery zone');
      }

      // Calculate final price
      const { subtotal, deliveryFee, serviceFee, total } = calculateTotalPrice(cart.items);

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          floristId: cart.floristId,
          deliveryAddress: data.deliveryAddress,
          deliveryInstructions: data.deliveryInstructions,
          giftMessage: data.giftMessage,
          recipientPhone: data.recipientPhone,
          recipientName: data.recipientName,
          pricing: {
            subtotal,
            deliveryFee,
            serviceFee,
            total,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Clear cart after successful order
      clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.id}/confirmation`);

      toast({
        title: 'Order placed successfully!',
        description: `Order #${order.id} has been placed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const { subtotal, deliveryFee, serviceFee, total } = calculateTotalPrice(cart.items);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    {...register('deliveryAddress.street')}
                    aria-invalid={!!errors.deliveryAddress?.street}
                    aria-errormessage={errors.deliveryAddress?.street?.message}
                  />
                  {errors.deliveryAddress?.street && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.deliveryAddress.street.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register('deliveryAddress.city')}
                      aria-invalid={!!errors.deliveryAddress?.city}
                      aria-errormessage={errors.deliveryAddress?.city?.message}
                    />
                    {errors.deliveryAddress?.city && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.deliveryAddress.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register('deliveryAddress.state')}
                      aria-invalid={!!errors.deliveryAddress?.state}
                      aria-errormessage={errors.deliveryAddress?.state?.message}
                    />
                    {errors.deliveryAddress?.state && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.deliveryAddress.state.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    {...register('deliveryAddress.zipCode')}
                    aria-invalid={!!errors.deliveryAddress?.zipCode}
                    aria-errormessage={errors.deliveryAddress?.zipCode?.message}
                  />
                  {errors.deliveryAddress?.zipCode && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.deliveryAddress.zipCode.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                  <Textarea
                    id="deliveryInstructions"
                    {...register('deliveryInstructions')}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    {...register('recipientName')}
                    aria-invalid={!!errors.recipientName}
                    aria-errormessage={errors.recipientName?.message}
                  />
                  {errors.recipientName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.recipientName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recipientPhone">Recipient Phone</Label>
                  <Input
                    id="recipientPhone"
                    {...register('recipientPhone')}
                    aria-invalid={!!errors.recipientPhone}
                    aria-errormessage={errors.recipientPhone?.message}
                  />
                  {errors.recipientPhone && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.recipientPhone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                  <Textarea
                    id="giftMessage"
                    {...register('giftMessage')}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Spinner className="mr-2" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </form>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 mb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
} 