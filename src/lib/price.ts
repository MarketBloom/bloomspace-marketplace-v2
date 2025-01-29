import { CartItem } from '@/types/cart';

interface PriceBreakdown {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

export function calculateTotalPrice(items: CartItem[]): PriceBreakdown {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate delivery fee based on subtotal
  const deliveryFee = subtotal >= 50 ? 0 : 9.99;
  
  // Service fee is 5% of subtotal
  const serviceFee = subtotal * 0.05;
  
  const total = subtotal + deliveryFee + serviceFee;
  
  return {
    subtotal,
    deliveryFee,
    serviceFee,
    total,
  };
} 