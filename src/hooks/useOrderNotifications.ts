import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/schema';
import { useQueryClient } from '@tanstack/react-query';

interface UseOrderNotificationsOptions {
  floristId?: string;
  customerId?: string;
}

export function useOrderNotifications({ floristId, customerId }: UseOrderNotificationsOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!floristId && !customerId) return;

    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: floristId
            ? `florist_id=eq.${floristId}`
            : `customer_id=eq.${customerId}`,
        },
        async (payload) => {
          // Invalidate orders query to trigger a refresh
          queryClient.invalidateQueries(['orders']);

          // Get the updated order details
          const order = payload.new as Order;
          const oldOrder = payload.old as Order;

          // Show appropriate notification based on the event type
          switch (payload.eventType) {
            case 'INSERT':
              if (floristId) {
                toast({
                  title: 'New Order Received',
                  description: `Order #${order.id.slice(-6)} has been placed`,
                });
              }
              break;

            case 'UPDATE':
              if (oldOrder.status !== order.status) {
                const message = getStatusUpdateMessage(order.status);
                toast({
                  title: 'Order Status Updated',
                  description: message,
                });
              }
              break;

            case 'DELETE':
              toast({
                title: 'Order Cancelled',
                description: `Order #${order.id.slice(-6)} has been cancelled`,
                variant: 'destructive',
              });
              break;
          }
        }
      );

    // Start listening for changes
    channel.subscribe();

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [floristId, customerId, toast, queryClient]);
}

function getStatusUpdateMessage(status: Order['status']): string {
  switch (status) {
    case 'confirmed':
      return 'Your order has been confirmed';
    case 'preparing':
      return 'Your order is being prepared';
    case 'out_for_delivery':
      return 'Your order is out for delivery';
    case 'delivered':
      return 'Your order has been delivered';
    case 'cancelled':
      return 'Your order has been cancelled';
    default:
      return 'Order status has been updated';
  }
}
