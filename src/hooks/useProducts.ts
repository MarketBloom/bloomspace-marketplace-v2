import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/schema';
import { useToast } from '@/components/ui/use-toast';

export function useProducts(floristId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ['products', floristId];

  const { data: products, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('florist_id', floristId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const createProduct = useMutation({
    mutationFn: async (data: Omit<Product, 'id' | 'florist_id'>) => {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{ ...data, florist_id: floristId }])
        .select()
        .single();

      if (error) throw error;
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (data: Product) => {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
