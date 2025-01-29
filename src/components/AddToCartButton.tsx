import { useState } from "react";
import { ShoppingCart, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddToCartButtonProps {
  productId: string;
  price: number;
  stock: number;
  sizes?: { id: string; name: string; price: number }[];
  onAddToCart: (quantity: number, sizeId?: string) => Promise<void>;
}

export function AddToCartButton({
  productId,
  price,
  stock,
  sizes,
  onAddToCart,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizes?.[0]?.id
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      await onAddToCart(quantity, selectedSize);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (stock === 0) {
    return (
      <Button disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {sizes && sizes.length > 0 && (
        <Select
          value={selectedSize}
          onValueChange={setSelectedSize}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.name} - ${size.price.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isLoading}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= stock || isLoading}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isLoading || (sizes && !selectedSize)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>

      {stock <= 5 && (
        <p className="text-sm text-red-600">
          Only {stock} left in stock - order soon
        </p>
      )}
    </div>
  );
} 