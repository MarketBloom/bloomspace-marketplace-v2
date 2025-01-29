import { useEffect, useRef } from 'react';
import { useCartStore } from '../stores/useCartStore';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/use-toast';
import type { CartItem } from '../types/cart';

interface CartItemResponse {
  id: string;
  quantity: number;
  customizations?: Record<string, any>;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    florist_id: string;
    florist_profiles: {
      id: string;
      store_name: string;
    };
  };
  product_sizes?: {
    id: string;
    name: string;
    price: number;
  };
}

export function useCartSync() {
  const { user } = useAuth();
  const { cart, addItem, clearCart } = useCartStore();
  const { toast } = useToast();
  const loadingRef = useRef(false);
  const lastSyncRef = useRef<string | null>(null);

  // Load cart from database when user signs in
  useEffect(() => {
    if (!user) return;

    const loadCartFromDB = async () => {
      // Prevent concurrent loads
      if (loadingRef.current) return;
      
      // Check if we've synced recently (within last 2 seconds)
      const now = new Date().toISOString();
      if (lastSyncRef.current && 
          new Date(now).getTime() - new Date(lastSyncRef.current).getTime() < 2000) {
        return;
      }

      try {
        loadingRef.current = true;
        lastSyncRef.current = now;

        // First, clean up any orphaned cart items
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .or('product_id.is.null');

        // Then load valid cart items with proper joins
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            customizations,
            products (
              id,
              name,
              price,
              images,
              florist_id,
              florist_profiles (
                id,
                store_name
              )
            ),
            product_sizes (
              id,
              name,
              price
            )
          `)
          .eq('user_id', user.id)
          .not('products', 'is', null);

        if (error) {
          console.error('Error loading cart:', error);
          toast({
            title: 'Error',
            description: 'Failed to load your cart. Please try again.',
            variant: 'destructive',
          });
          return;
        }

        // Clear existing cart
        clearCart();

        // Add valid items from database
        const cartItems = data as unknown as CartItemResponse[];
        if (!Array.isArray(cartItems)) return;
        
        cartItems.forEach((item) => {
          if (!item.products || !item.products.florist_profiles) return;

          addItem({
            id: item.id,
            productId: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image: item.products.images?.[0],
            floristId: item.products.florist_id,
            floristName: item.products.florist_profiles.store_name,
            sizeId: item.product_sizes?.id,
            sizeName: item.product_sizes?.name,
            customizations: item.customizations,
          });
        });
      } catch (error) {
        console.error('Error loading cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your cart. Please try again.',
          variant: 'destructive',
        });
      } finally {
        loadingRef.current = false;
      }
    };

    loadCartFromDB();
  }, [user]); // Only depend on user changes, not cart state

  // Sync cart changes to database
  useEffect(() => {
    if (!user) return;

    const syncCartToDB = async () => {
      try {
        // Get current cart items from DB
        const { data: existingItems } = await supabase
          .from('cart_items')
          .select('id, product_id, size_id')
          .eq('user_id', user.id);

        // Create sets for efficient lookup
        const existingItemKeys = new Set(
          existingItems?.map(
            (item) => `${item.product_id}-${item.size_id || ''}`
          ) || []
        );
        const currentItemKeys = new Set(
          cart.items.map((item) => `${item.productId}-${item.sizeId || ''}`)
        );

        // Items to delete (in DB but not in current cart)
        const itemsToDelete = existingItems?.filter(
          (item) =>
            !currentItemKeys.has(`${item.product_id}-${item.size_id || ''}`)
        );

        // Items to upsert (in current cart)
        const itemsToUpsert = cart.items.map((item) => ({
          user_id: user.id,
          product_id: item.productId,
          quantity: item.quantity,
          size_id: item.sizeId,
          customizations: item.customizations,
        }));

        // Delete removed items
        if (itemsToDelete?.length) {
          await supabase
            .from('cart_items')
            .delete()
            .in(
              'id',
              itemsToDelete.map((item) => item.id)
            );
        }

        // Upsert current items
        if (itemsToUpsert.length) {
          await supabase.from('cart_items').upsert(itemsToUpsert, {
            onConflict: 'user_id,product_id,size_id',
          });
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to sync your cart. Please try again.',
          variant: 'destructive',
        });
      }
    };

    // Debounce sync to avoid too many DB calls
    const timeoutId = setTimeout(syncCartToDB, 1000);
    return () => clearTimeout(timeoutId);
  }, [cart.items, user]);
}
