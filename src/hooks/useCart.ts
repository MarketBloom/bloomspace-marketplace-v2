import { useCartStore } from '@/stores/useCartStore';
import { CartItem } from '@/types/cart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCart() {
  const cart = useCartStore();
  const { user } = useAuth();
  
  const subtotal = cart.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = cart.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const hasItems = cart.cart.items.length > 0;

  const currentFlorist = cart.cart.floristId;

  const addToCart = async (productId: string, quantity: number = 1) => {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        product_id: productId,
        user_id: user?.id,
        quantity,
      }, {
        onConflict: 'product_id,user_id'
      })
    // ... error handling
  };

  const removeFromCart = (productId: string) => {
    cart.removeItem(productId);
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    cart.updateQuantity(productId, quantity);
  };

  const clearCart = () => {
    cart.clearCart();
  };

  const addCustomization = (productId: string, customization: CartItem['customizations']) => {
    cart.addCustomization(productId, customization);
  };

  return {
    items: cart.cart.items,
    subtotal,
    itemCount,
    hasItems,
    currentFlorist,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addCustomization,
  };
}
