import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { NotificationService } from '@/lib/notifications';
import { format } from 'date-fns';
import {
  Truck, Package, CheckCircle, Clock, AlertCircle,
  ShoppingBag, MapPin, Calendar
} from 'lucide-react';

interface OrderStatus {
  status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  timestamp: string;
  note?: string;
}

interface OrderDetails {
  id: string;
  customer_id: string;
  florist_id: string;
  total_amount: number;
  delivery_address: string;
  delivery_time: string;
  status: OrderStatus['status'];
  status_history: OrderStatus[];
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

export function OrderTracking({ 
  orderId, 
  userType 
}: { 
  orderId: string; 
  userType: 'customer' | 'florist' 
}) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
    
    // Set up real-time subscription for status updates
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, (payload) => {
        handleStatusUpdate(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            price,
            products (name)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      // Format the data to match our interface
      const formattedOrder: OrderDetails = {
        ...data,
        items: data.order_items.map((item: any) => ({
          product_id: item.product_id,
          product_name: item.products.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      setOrder(formattedOrder);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (updatedOrder: any) => {
    setOrder(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: updatedOrder.status,
        status_history: updatedOrder.status_history
      };
    });

    // Notify customer of status change
    if (userType === 'florist') {
      await NotificationService.orderStatusUpdate(
        order!.customer_id,
        orderId,
        updatedOrder.status
      );
    }
  };

  const updateOrderStatus = async (newStatus: OrderStatus['status'], note?: string) => {
    try {
      const timestamp = new Date().toISOString();
      const statusUpdate: OrderStatus = {
        status: newStatus,
        timestamp,
        note
      };

      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          status_history: [...(order?.status_history || []), statusUpdate]
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      handleStatusUpdate({
        status: newStatus,
        status_history: [...(order?.status_history || []), statusUpdate]
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusIcon = (status: OrderStatus['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'accepted': return <CheckCircle className="h-5 w-5" />;
      case 'preparing': return <Package className="h-5 w-5" />;
      case 'out_for_delivery': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5" />;
      default: return <ShoppingBag className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <div>Loading order details...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">Order #{orderId.slice(0, 8)}</h2>
            <p className="text-sm text-muted-foreground">
              Placed on {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <Badge variant={
            order.status === 'delivered' ? 'default' :
            order.status === 'cancelled' ? 'destructive' :
            'secondary'
          }>
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Details
            </h3>
            <p className="text-sm">{order.delivery_address}</p>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(order.delivery_time), 'MMM d, yyyy h:mm a')}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Order Timeline</h3>
        <div className="space-y-4">
          {order.status_history.map((status, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1">{getStatusIcon(status.status)}</div>
              <div>
                <p className="font-medium">
                  {status.status.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(status.timestamp), 'MMM d, yyyy h:mm a')}
                </p>
                {status.note && (
                  <p className="text-sm mt-1">{status.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {userType === 'florist' && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Update Order Status</h3>
          <div className="flex gap-2">
            {['accepted', 'preparing', 'out_for_delivery', 'delivered'].map((status) => (
              <Button
                key={status}
                variant="outline"
                onClick={() => updateOrderStatus(status as OrderStatus['status'])}
                disabled={order.status === status}
              >
                {status.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 