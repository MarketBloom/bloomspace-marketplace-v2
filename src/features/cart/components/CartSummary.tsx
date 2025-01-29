import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format';
import { useNavigate } from 'react-router-dom';

export function CartSummary() {
  const { subtotal, itemCount } = useCart();
  const navigate = useNavigate();
  
  // These could be configured based on business rules
  const deliveryFee = 10.00;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + deliveryFee + serviceFee;

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service Fee</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-6" 
        size="lg"
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout
      </Button>
      
      <p className="text-sm text-muted-foreground text-center mt-4">
        Delivery time will be confirmed at checkout
      </p>
    </div>
  );
}
