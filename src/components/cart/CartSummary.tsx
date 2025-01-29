import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  onCheckout: () => void;
  isLoading?: boolean;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  total,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
      
      <Button
        className="w-full mt-6"
        onClick={onCheckout}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Proceed to Checkout"}
      </Button>
    </Card>
  );
} 