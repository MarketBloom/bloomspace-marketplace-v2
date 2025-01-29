import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { showSuccessToast } from "@/utils/notifications";

interface AddToCartButtonProps {
  id: string;
  title: string;
  price: number;
  image?: string;
  floristId: string;
  floristName?: string;
  selectedSizeId?: string | null;
  selectedSizeName?: string;
}

export const AddToCartButton = ({ 
  id, 
  title, 
  price, 
  image, 
  floristId, 
  floristName,
  selectedSizeId,
  selectedSizeName
}: AddToCartButtonProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id,
      title,
      price,
      image,
      floristId,
      floristName,
      sizeId: selectedSizeId,
      sizeName: selectedSizeName
    });
    
    showSuccessToast(
      "Added to Cart",
      `${title}${selectedSizeName ? ` (${selectedSizeName})` : ''} has been added to your cart`
    );
  };

  return (
    <Button 
      variant="default"
      size="sm"
      className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-3.5 w-3.5 mr-2" />
      Add to Cart
    </Button>
  );
};