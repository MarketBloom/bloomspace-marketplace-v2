import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, CartItem } from '@/types/cart';
import { toast } from '@/components/ui/use-toast';

const MAX_QUANTITY = 99;
const MIN_QUANTITY = 1;

interface CartValidationError extends Error {
  code: 'DIFFERENT_FLORIST' | 'INVALID_QUANTITY' | 'INVENTORY_ERROR' | 'DELIVERY_ZONE';
  details?: any;
}

interface CartStore {
  cart: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  setFlorist: (floristId: string) => void;
  addCustomization: (productId: string, customization: CartItem['customizations']) => void;
  validateDeliveryZone: (floristId: string, deliveryAddress: any) => Promise<boolean>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        floristId: null,
        lastUpdated: new Date().toISOString(),
      },

      addItem: async (item, quantity = 1) => {
        const { cart } = get();
        
        try {
          // Validate quantity
          if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
            throw new Error(`Quantity must be between ${MIN_QUANTITY} and ${MAX_QUANTITY}`);
          }

          // Check if item is from different florist
          if (cart.floristId && cart.floristId !== item.floristId) {
            const error = new Error('Adding items from a different florist will clear your current cart.') as CartValidationError;
            error.code = 'DIFFERENT_FLORIST';
            throw error;
          }

          // Check inventory availability
          const inventoryCheck = await fetch(`/api/inventory/check?productId=${item.productId}&quantity=${quantity}`);
          if (!inventoryCheck.ok) {
            const error = new Error('Item is out of stock or insufficient quantity available.') as CartValidationError;
            error.code = 'INVENTORY_ERROR';
            throw error;
          }

          set((state) => {
            const existingItem = state.cart.items.find((i) => i.productId === item.productId);
            
            if (existingItem) {
              const newQuantity = existingItem.quantity + quantity;
              if (newQuantity > MAX_QUANTITY) {
                throw new Error(`Cannot add more than ${MAX_QUANTITY} items`);
              }

              return {
                cart: {
                  ...state.cart,
                  items: state.cart.items.map((i) =>
                    i.productId === item.productId
                      ? { ...i, quantity: newQuantity }
                      : i
                  ),
                  floristId: item.floristId,
                  lastUpdated: new Date().toISOString(),
                },
              };
            }

            return {
              cart: {
                ...state.cart,
                items: [...state.cart.items, { ...item, quantity }],
                floristId: item.floristId,
                lastUpdated: new Date().toISOString(),
              },
            };
          });

          toast({
            title: 'Added to cart',
            description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart.`,
          });
        } catch (error) {
          if ((error as CartValidationError).code === 'DIFFERENT_FLORIST') {
            const confirmed = window.confirm((error as Error).message);
            if (confirmed) {
              set({ 
                cart: { 
                  items: [{ ...item, quantity }], 
                  floristId: item.floristId, 
                  lastUpdated: new Date().toISOString() 
                } 
              });
              return;
            }
          }
          
          toast({
            title: 'Error',
            description: (error as Error).message,
            variant: 'destructive',
          });
          throw error;
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        try {
          if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
            throw new Error(`Quantity must be between ${MIN_QUANTITY} and ${MAX_QUANTITY}`);
          }

          // Check inventory availability
          const inventoryCheck = await fetch(`/api/inventory/check?productId=${productId}&quantity=${quantity}`);
          if (!inventoryCheck.ok) {
            throw new Error('Item is out of stock or insufficient quantity available.');
          }

          set((state) => ({
            cart: {
              ...state.cart,
              items: state.cart.items.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
              ),
              lastUpdated: new Date().toISOString(),
            },
          }));
        } catch (error) {
          toast({
            title: 'Error',
            description: (error as Error).message,
            variant: 'destructive',
          });
          throw error;
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.filter((item) => item.productId !== productId),
            floristId: state.cart.items.length === 1 ? null : state.cart.floristId,
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            floristId: null,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      setFlorist: (floristId: string) => {
        set((state) => ({
          cart: {
            ...state.cart,
            floristId,
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      addCustomization: (productId: string, customization: CartItem['customizations']) => {
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.productId === productId
                ? { ...item, customizations: { ...item.customizations, ...customization } }
                : item
            ),
            lastUpdated: new Date().toISOString(),
          },
        }));
      },

      validateDeliveryZone: async (floristId: string, deliveryAddress: any) => {
        try {
          const response = await fetch(`/api/florist/${floristId}/delivery-zone/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(deliveryAddress),
          });

          if (!response.ok) {
            const error = new Error('Address is outside delivery zone') as CartValidationError;
            error.code = 'DELIVERY_ZONE';
            throw error;
          }

          return true;
        } catch (error) {
          toast({
            title: 'Delivery Zone Error',
            description: (error as Error).message,
            variant: 'destructive',
          });
          return false;
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
