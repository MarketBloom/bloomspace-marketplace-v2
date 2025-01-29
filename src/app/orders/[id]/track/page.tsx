import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getOrderStatusConfig } from '@/config/orderStatus';
import { OrderStatus } from '@/types/order';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Track Order | Bloomspace',
  description: 'Track your flower delivery order',
};

interface OrderTrackingPageProps {
  params: {
    id: string;
  };
}

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
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
      ),
      status_history:order_status_history (
        status,
        notes,
        created_at,
        created_by
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const statusConfig = getOrderStatusConfig(order.status as OrderStatus);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <Button asChild variant="outline">
            <Link href={`/orders/${order.id}`}>View Order Details</Link>
          </Button>
        </div>
        
        <div className="grid gap-6">
          {/* Current Status */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div 
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  {
                    'bg-green-100': statusConfig.color === 'green',
                    'bg-blue-100': statusConfig.color === 'blue',
                    'bg-yellow-100': statusConfig.color === 'yellow',
                    'bg-purple-100': statusConfig.color === 'purple',
                    'bg-red-100': statusConfig.color === 'red',
                    'bg-gray-100': statusConfig.color === 'gray',
                  }
                )}
              >
                <span 
                  className={cn(
                    'text-2xl',
                    {
                      'text-green-600': statusConfig.color === 'green',
                      'text-blue-600': statusConfig.color === 'blue',
                      'text-yellow-600': statusConfig.color === 'yellow',
                      'text-purple-600': statusConfig.color === 'purple',
                      'text-red-600': statusConfig.color === 'red',
                      'text-gray-600': statusConfig.color === 'gray',
                    }
                  )}
                >
                  <i className={`icon-${statusConfig.icon}`}></i>
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{statusConfig.label}</h2>
                <p className="text-gray-600">{statusConfig.description}</p>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
            <OrderTimeline statusHistory={order.status_history} />
          </Card>

          {/* Delivery Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Delivery Address</h3>
                <p className="text-gray-600">
                  {order.delivery_address.street}<br />
                  {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.zipCode}
                </p>
                {order.delivery_instructions && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Delivery Instructions</h3>
                    <p className="text-gray-600">{order.delivery_instructions}</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium mb-2">Recipient</h3>
                <p className="text-gray-600">
                  {order.recipient_name}<br />
                  {order.recipient_phone}
                </p>
                {order.gift_message && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Gift Message</h3>
                    <p className="text-gray-600">{order.gift_message}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Florist Information */}
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
        </div>
      </div>
    </div>
  );
} 