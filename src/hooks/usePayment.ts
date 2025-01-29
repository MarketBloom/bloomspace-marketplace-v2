import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PaymentMethod {
  id: string;
  customer_id: string;
  type: 'card';
  card_last4: string;
  card_brand: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  created_at: string;
}

interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  payment_method_id: string;
  stripe_payment_intent_id: string;
  created_at: string;
}

export function usePayment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as PaymentMethod[];
    },
  });

  const addPaymentMethod = useMutation({
    mutationFn: async ({
      paymentMethodId,
      isDefault = false,
    }: {
      paymentMethodId: string;
      isDefault?: boolean;
    }) => {
      // Call your backend API to save the payment method
      const response = await fetch('/api/add-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          isDefault,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods']);
      toast({
        title: 'Success',
        description: 'Payment method added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add payment method',
        variant: 'destructive',
      });
    },
  });

  const removePaymentMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods']);
      toast({
        title: 'Success',
        description: 'Payment method removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove payment method',
        variant: 'destructive',
      });
    },
  });

  const setDefaultPaymentMethod = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      // Start a transaction
      const { error } = await supabase.rpc('set_default_payment_method', {
        p_payment_method_id: paymentMethodId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payment-methods']);
      toast({
        title: 'Success',
        description: 'Default payment method updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update default payment method',
        variant: 'destructive',
      });
    },
  });

  const getPaymentHistory = async (orderId?: string) => {
    let query = supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as PaymentTransaction[];
  };

  return {
    paymentMethods,
    isLoadingPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getPaymentHistory,
  };
}
