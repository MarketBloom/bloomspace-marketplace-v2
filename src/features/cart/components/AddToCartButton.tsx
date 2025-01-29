import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/useAddToCart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    floristId: string;
    floristName: string;
    sizes?: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  };
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className,
}: AddToCartButtonProps) {
  const {
    selectedSizeId,
    setSelectedSizeId,
    handleAddToCart,
    selectedSize,
  } = useAddToCart(product);

  return (
    <div className="space-y-4">
      {product.sizes && product.sizes.length > 0 && (
        <Select
          value={selectedSizeId}
          onValueChange={(value) => setSelectedSizeId(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {product.sizes.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.name} - {size.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        onClick={handleAddToCart}
        variant={variant}
        size={size}
        className={className}
      >
        <ShoppingCart className="h-3.5 w-3.5 mr-2" />
        Add to Cart {selectedSize && `- $${selectedSize.price.toFixed(2)}`}
      </Button>
    </div>
  );
}