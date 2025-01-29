import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { showSuccessToast } from "@/utils/notifications";

interface ProductActionsProps {
  onAddToCart: () => void;
  productTitle: string;
}

export const ProductActions = ({ onAddToCart, productTitle }: ProductActionsProps) => {
  const handleAddToCart = () => {
    onAddToCart();
    showSuccessToast(
      "Added to Cart",
      `${productTitle} has been added to your cart`
    );
  };

  return (
    <div className="pt-4">
      <Button 
        size="lg" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={handleAddToCart}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  );
};