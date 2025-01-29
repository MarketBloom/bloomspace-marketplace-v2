import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/ui/loading-state';
import { handleError, ErrorMessages } from '@/lib/error-handling';
import { useSubscriptionCleanup } from '@/lib/cleanup';
import { supabase } from '@/lib/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, Truck, CheckCircle, Package, Phone } from 'lucide-react';

interface DeliveryStatus {
  id: string;
  order_id: string;
  status: 'preparing' | 'out_for_delivery' | 'nearby' | 'delivered';
  estimated_arrival?: string;
  actual_arrival?: string;
  updated_at: string;
}

interface TrackingDetails {
  order_id: string;
  customer_name: string;
  florist_name: string;
  florist_phone: string;
  delivery_address: string;
  delivery_time: string;
  current_status: DeliveryStatus['status'];
  estimated_arrival?: string;
  items: Array<{
    quantity: number;
    product_name: string;
  }>;
}

export function DeliveryTracking({ orderId }: { orderId: string }) {
  const [tracking, setTracking] = useState<TrackingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addSubscription, cleanup } = useSubscriptionCleanup();

  useEffect(() => {
    loadTrackingDetails();
    
    // Set up real-time updates
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_slots',
        filter: `order_id=eq.${orderId}`
      }, handleStatusUpdate)
      .subscribe();

    addSubscription(subscription);
    return cleanup;
  }, [orderId]);

  const loadTrackingDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          delivery_address,
          delivery_time,
          florist_profiles (
            store_name,
            contact_phone
          ),
          order_items (
            quantity,
            products (name)
          ),
          delivery_slots (
            status,
            estimated_arrival
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      setTracking({
        order_id: data.id,
        customer_name: data.customer_name,
        florist_name: data.florist_profiles.store_name,
        florist_phone: data.florist_profiles.contact_phone,
        delivery_address: data.delivery_address,
        delivery_time: data.delivery_time,
        current_status: data.delivery_slots[0]?.status || 'preparing',
        estimated_arrival: data.delivery_slots[0]?.estimated_arrival,
        items: data.order_items.map((item: any) => ({
          quantity: item.quantity,
          product_name: item.products.name
        }))
      });
    } catch (error) {
      handleError(error, { fallbackMessage: ErrorMessages.LOAD_FAILED });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = (payload: any) => {
    const updatedStatus = payload.new;
    setTracking(prev => prev ? {
      ...prev,
      current_status: updatedStatus.status,
      estimated_arrival: updatedStatus.estimated_arrival
    } : null);
  };

  const getStatusProgress = (status: DeliveryStatus['status']) => {
    switch (status) {
      case 'preparing': return 25;
      case 'out_for_delivery': return 50;
      case 'nearby': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const getStatusMessage = (status: DeliveryStatus['status']) => {
    switch (status) {
      case 'preparing':
        return 'Your order is being prepared';
      case 'out_for_delivery':
        return 'Your order is on the way';
      case 'nearby':
        return 'Your delivery is nearby';
      case 'delivered':
        return 'Your order has been delivered';
      default:
        return 'Tracking your order...';
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading delivery status..." />;
  }

  if (!tracking) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Order not found
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                Order #{tracking.order_id.slice(0, 8)}
              </h2>
              <p className="text-sm text-muted-foreground">
                From {tracking.florist_name}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <a 
                href={`tel:${tracking.florist_phone}`}
                className="text-primary hover:underline"
              >
                {tracking.florist_phone}
              </a>
            </div>
          </div>

          <div>
            <Progress value={getStatusProgress(tracking.current_status)} />
            <p className="mt-2 text-center font-medium">
              {getStatusMessage(tracking.current_status)}
            </p>
            {tracking.estimated_arrival && tracking.current_status !== 'delivered' && (
              <p className="text-sm text-center text-muted-foreground mt-1">
                Estimated arrival: {format(new Date(tracking.estimated_arrival), 'h:mm a')}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Delivery Time</span>
              </div>
              <p className="text-sm">
                {format(new Date(tracking.delivery_time), 'MMM d, h:mm a')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Delivery Address</span>
              </div>
              <p className="text-sm">{tracking.delivery_address}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Order Items</h3>
            <div className="space-y-2">
              {tracking.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">
                    {item.quantity}x {item.product_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium">Delivery Updates</h3>
        <div className="space-y-4">
          {tracking.current_status === 'delivered' && (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Delivered</p>
                <p className="text-sm text-muted-foreground">
                  Your order has been delivered
                </p>
              </div>
            </div>
          )}
          
          {tracking.current_status === 'nearby' && (
            <div className="flex items-center gap-3 text-blue-600">
              <Truck className="h-5 w-5" />
              <div>
                <p className="font-medium">Almost There!</p>
                <p className="text-sm text-muted-foreground">
                  Your delivery is just a few minutes away
                </p>
              </div>
            </div>
          )}
          
          {tracking.estimated_arrival && tracking.current_status === 'out_for_delivery' && (
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5" />
              <div>
                <p className="font-medium">On the Way</p>
                <p className="text-sm text-muted-foreground">
                  Estimated arrival in {
                    formatDistanceToNow(new Date(tracking.estimated_arrival), { addSuffix: true })
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 