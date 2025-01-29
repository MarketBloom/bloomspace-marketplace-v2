import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Order Confirmation | Bloomspace',
  description: 'Thank you for your order!',
};

interface OrderConfirmationPageProps {
  params: {
    id: string;
  };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (
          name,
          image
        )
      ),
      florist:florists (
        name,
        phone,
        email
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600">
          Order #{order.id} has been confirmed
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Delivery Address</h3>
                <p className="text-gray-600">
                  {order.delivery_address.street}<br />
                  {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.zipCode}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Recipient</h3>
                <p className="text-gray-600">
                  {order.recipient_name}<br />
                  {order.recipient_phone}
                </p>
              </div>
            </div>

            {order.delivery_instructions && (
              <div>
                <h3 className="font-medium">Delivery Instructions</h3>
                <p className="text-gray-600">{order.delivery_instructions}</p>
              </div>
            )}

            {order.gift_message && (
              <div>
                <h3 className="font-medium">Gift Message</h3>
                <p className="text-gray-600">{order.gift_message}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${order.pricing.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${order.pricing.service_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Florist Information</h2>
          
          <div>
            <h3 className="font-medium">{order.florist.name}</h3>
            <p className="text-gray-600">
              Phone: {order.florist.phone}<br />
              Email: {order.florist.email}
            </p>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 