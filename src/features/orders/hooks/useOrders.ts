import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderFormData } from '@/types/schema';
import { useToast } from '@/components/ui/use-toast';

interface UseOrdersOptions {
  floristId?: string;
  customerId?: string;
}

export function useOrders({ floristId, customerId }: UseOrdersOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['orders', { floristId, customerId }];

  const { data: orders, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              price,
              images
            )
          )
        `);

      if (floristId) {
        query = query.eq('florist_id', floristId);
      }
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Order & {
        order_items: Array<{
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_time: number;
          product: {
            id: string;
            name: string;
            price: number;
            images: string[];
          };
        }>;
      })[];
    },
    enabled: Boolean(floristId || customerId),
  });

  const createOrder = useMutation({
    mutationFn: async ({
      floristId,
      formData,
    }: {
      floristId: string;
      formData: OrderFormData;
    }) => {
      const { delivery_date, delivery_time_slot, delivery_address, items } = formData;

      // Calculate total amount and create order items
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: 0, // Will be updated in the transaction
      }));

      // Start a Supabase transaction
      const { data: order, error: orderError } = await supabase.rpc(
        'create_order',
        {
          p_florist_id: floristId,
          p_delivery_date: delivery_date.toISOString(),
          p_delivery_time_slot: delivery_time_slot,
          p_delivery_address: delivery_address,
          p_order_items: orderItems,
        }
      );

      if (orderError) throw orderError;
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      toast({
        title: 'Success',
        description: 'Order placed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: Order['status'];
    }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrderStatus,
  };
}
