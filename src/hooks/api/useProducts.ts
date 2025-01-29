import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductsTable, ProductSizesTable, transformProduct } from '@/types/product';
import { toast } from '@/components/ui/use-toast';

interface ProductFilters {
  status?: string;
  stockStatus?: string;
  category?: string;
  search?: string;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_sizes (*)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.stockStatus) {
        query = query.eq('stock_status', filters.stockStatus);
      }
      if (filters?.category) {
        query = query.contains('categories', [filters.category]);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((row: any) => transformProduct(row, row.product_sizes));
    }
  });
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      return transformProduct(data, data.product_sizes);
    },
    enabled: !!productId
  });
}

interface CreateProductData extends Omit<ProductsTable['Insert'], 'id' | 'created_at' | 'updated_at'> {
  sizes?: Omit<ProductSizesTable['Insert'], 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      // First create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          florist_id: data.florist_id,
          name: data.name,
          description: data.description,
          price: data.price,
          sale_price: data.sale_price,
          status: data.status || 'draft',
          stock_status: data.stock_status || 'in_stock',
          images: data.images || [],
          categories: data.categories || [],
          tags: data.tags || [],
          metadata: data.metadata || {}
        })
        .select()
        .single();

      if (productError) throw productError;

      // Then create the sizes if any
      if (data.sizes?.length) {
        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(
            data.sizes.map(size => ({
              product_id: product.id,
              name: size.name,
              price_adjustment: size.price_adjustment
            }))
          );

        if (sizesError) throw sizesError;
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    }
  });
}

interface UpdateProductData extends Partial<Omit<ProductsTable['Update'], 'id' | 'created_at' | 'updated_at'>> {
  id: string;
  sizes?: {
    create?: Omit<ProductSizesTable['Insert'], 'id' | 'product_id' | 'created_at' | 'updated_at'>[];
    update?: (Omit<ProductSizesTable['Update'], 'product_id' | 'created_at' | 'updated_at'> & { id: string })[];
    delete?: string[];
  };
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProductData) => {
      // Start a transaction
      const { data: product, error: productError } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          sale_price: data.sale_price,
          status: data.status,
          stock_status: data.stock_status,
          images: data.images,
          categories: data.categories,
          tags: data.tags,
          metadata: data.metadata
        })
        .eq('id', data.id)
        .select()
        .single();

      if (productError) throw productError;

      // Handle size updates if any
      if (data.sizes) {
        // Delete sizes
        if (data.sizes.delete?.length) {
          const { error: deleteError } = await supabase
            .from('product_sizes')
            .delete()
            .in('id', data.sizes.delete);

          if (deleteError) throw deleteError;
        }

        // Update sizes
        if (data.sizes.update?.length) {
          const { error: updateError } = await supabase
            .from('product_sizes')
            .upsert(
              data.sizes.update.map(size => ({
                id: size.id,
                name: size.name,
                price_adjustment: size.price_adjustment
              }))
            );

          if (updateError) throw updateError;
        }

        // Create new sizes
        if (data.sizes.create?.length) {
          const { error: createError } = await supabase
            .from('product_sizes')
            .insert(
              data.sizes.create.map(size => ({
                product_id: data.id,
                name: size.name,
                price_adjustment: size.price_adjustment
              }))
            );

          if (createError) throw createError;
        }
      }

      return product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  });
}

export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productIds, data }: { productIds: string[], data: Partial<ProductsTable['Update']> }) => {
      const { error } = await supabase
        .from('products')
        .update(data)
        .in('id', productIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Products updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating products:', error);
      toast({
        title: 'Error',
        description: 'Failed to update products. Please try again.',
        variant: 'destructive',
      });
    }
  });
}
