import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { handleError, ErrorMessages } from '@/lib/error-handling';
import { useSubscriptionCleanup } from '@/lib/cleanup';
import { supabase } from '@/lib/supabase/client';
import { NotificationService } from '@/lib/notifications';
import { format, addMinutes, isAfter } from 'date-fns';
import { MapPin, Clock, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DeliverySlot {
  id: string;
  order_id: string;
  delivery_time: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  driver_notes?: string;
  estimated_arrival?: string;
}

interface DeliveryOrder {
  id: string;
  customer_name: string;
  delivery_address: string;
  delivery_time: string;
  items: Array<{
    quantity: number;
    product_name: string;
  }>;
  status: string;
  contact_phone: string;
}

export function DeliveryManagement({ floristId }: { floristId: string }) {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addSubscription, cleanup } = useSubscriptionCleanup();

  useEffect(() => {
    loadDeliveries();
    
    // Set up real-time updates
    const subscription = supabase
      .channel('deliveries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'delivery_slots',
        filter: `florist_id=eq.${floristId}`
      }, handleDeliveryUpdate)
      .subscribe();

    addSubscription(subscription);
    return cleanup;
  }, [floristId]);

  const loadDeliveries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          delivery_address,
          delivery_time,
          status,
          contact_phone,
          order_items (
            quantity,
            products (name)
          )
        `)
        .eq('florist_id', floristId)
        .eq('status', 'out_for_delivery')
        .order('delivery_time', { ascending: true });

      if (error) throw error;

      const formattedDeliveries = data.map(order => ({
        ...order,
        items: order.order_items.map((item: any) => ({
          quantity: item.quantity,
          product_name: item.products.name
        }))
      }));

      setDeliveries(formattedDeliveries);
    } catch (error) {
      handleError(error, { fallbackMessage: ErrorMessages.LOAD_FAILED });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryUpdate = (payload: any) => {
    const updatedDelivery = payload.new;
    
    // Update local state
    setDeliveries(current =>
      current.map(delivery =>
        delivery.id === updatedDelivery.order_id
          ? { ...delivery, status: updatedDelivery.status }
          : delivery
      )
    );

    // Send notifications for status changes
    if (updatedDelivery.status === 'completed') {
      NotificationService.orderStatusUpdate(
        updatedDelivery.customer_id,
        updatedDelivery.order_id,
        'delivered'
      );
    }
  };

  const markDeliveryComplete = async (orderId: string) => {
    try {
      const { error } = await supabase.from('orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Delivery marked as complete');
      
      // Remove from local state
      setDeliveries(current =>
        current.filter(delivery => delivery.id !== orderId)
      );
    } catch (error) {
      handleError(error, { fallbackMessage: 'Failed to update delivery status' });
    }
  };

  const updateEstimatedArrival = async (orderId: string, minutes: number) => {
    try {
      const estimatedTime = addMinutes(new Date(), minutes);
      
      const { error } = await supabase
        .from('delivery_slots')
        .update({ estimated_arrival: estimatedTime.toISOString() })
        .eq('order_id', orderId);

      if (error) throw error;

      // Notify customer
      NotificationService.orderStatusUpdate(
        deliveries.find(d => d.id === orderId)?.id!,
        orderId,
        `Delivery estimated in ${minutes} minutes`
      );

      toast.success('Estimated arrival time updated');
    } catch (error) {
      handleError(error, { fallbackMessage: 'Failed to update estimated arrival' });
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading deliveries..." />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Today's Deliveries</h2>
        <Button 
          onClick={loadDeliveries}
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {deliveries.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No active deliveries
        </Card>
      ) : (
        <div className="grid gap-6">
          {deliveries.map(delivery => (
            <Card key={delivery.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-medium">Order #{delivery.id.slice(0, 8)}</h3>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {format(new Date(delivery.delivery_time), 'h:mm a')}
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1" />
                    <div>
                      <p className="text-sm">{delivery.delivery_address}</p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.contact_phone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Items:</h4>
                    <div className="space-y-1">
                      {delivery.items.map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.quantity}x {item.product_name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEstimatedArrival(delivery.id, 15)}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    15 mins
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateEstimatedArrival(delivery.id, 30)}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    30 mins
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => markDeliveryComplete(delivery.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 