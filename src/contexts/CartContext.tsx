// DEPRECATED: Use useCartStore from @/stores/useCartStore instead
// This context is kept temporarily for backward compatibility
// TODO: Remove this file once all components are migrated to useCartStore

import React, { createContext, useContext } from "react";
import { useCartStore } from "@/stores/useCartStore";
import type { CartItem } from "@/types/cart";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: number;
  clear: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cart = useCartStore();
  
  const value = {
    items: cart.cart.items,
    addItem: (item: Omit<CartItem, "quantity">) => cart.addItem(item),
    removeItem: (id: string) => cart.removeItem(id),
    updateQuantity: (id: string, quantity: number) => cart.updateQuantity(id, quantity),
    total: cart.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    clear: () => cart.clearCart(),
    itemCount: cart.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  console.warn('DEPRECATED: useCart from CartContext is deprecated. Use useCartStore instead.');
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};