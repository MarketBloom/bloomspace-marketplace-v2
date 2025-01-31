import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/utils/format";

interface ProductSize {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
}

interface CustomizationOption {
  id: string;
  name: string;
  type: "select" | "text" | "textarea";
  required?: boolean;
  options?: Array<{
    id: string;
    name: string;
    price_adjustment?: number;
  }>;
}

interface ProductDescriptionProps {
  description: string;
  sizes?: ProductSize[];
  customization_options?: CustomizationOption[];
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  onAddToCart: (data: {
    size_id?: string;
    quantity: number;
    customizations: Record<string, any>;
  }) => void;
}

export function ProductDescription({
  description,
  sizes,
  customization_options = [],
  stock_status,
  onAddToCart,
}: ProductDescriptionProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizes?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<Record<string, any>>({});

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, Math.min(99, value)));
  };

  const handleCustomizationChange = (id: string, value: any) => {
    setCustomizations((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleAddToCart = () => {
    onAddToCart({
      size_id: selectedSize,
      quantity,
      customizations,
    });
  };

  const selectedSizeDetails = sizes?.find((size) => size.id === selectedSize);

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Description</h3>
        <div
          className="mt-4 prose prose-sm text-gray-500"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {/* Sizes */}
      {sizes && sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900">Size</h3>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                className={`relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none ${
                  selectedSize === size.id
                    ? "border-primary"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedSize(size.id)}
              >
                <span>{size.name}</span>
                {size.sale_price ? (
                  <span className="absolute -top-2 -right-2">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Sale
                    </span>
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {selectedSizeDetails && (
            <p className="mt-2 text-sm text-gray-500">
              Price:{" "}
              {selectedSizeDetails.sale_price ? (
                <>
                  <span className="text-primary font-medium">
                    {formatPrice(selectedSizeDetails.sale_price)}
                  </span>{" "}
                  <span className="line-through">
                    {formatPrice(selectedSizeDetails.price)}
                  </span>
                </>
              ) : (
                <span className="text-primary font-medium">
                  {formatPrice(selectedSizeDetails.price)}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Customization Options */}
      {customization_options.map((option) => (
        <div key={option.id}>
          <Label htmlFor={option.id}>
            {option.name}
            {option.required && <span className="text-red-500">*</span>}
          </Label>
          <div className="mt-2">
            {option.type === "select" && option.options ? (
              <Select
                value={customizations[option.id] || ""}
                onValueChange={(value) =>
                  handleCustomizationChange(option.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {option.options.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                      {opt.price_adjustment ? (
                        <span className="ml-2 text-gray-500">
                          ({opt.price_adjustment > 0 ? "+" : ""}
                          {formatPrice(opt.price_adjustment)})
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : option.type === "textarea" ? (
              <Textarea
                id={option.id}
                value={customizations[option.id] || ""}
                onChange={(e) =>
                  handleCustomizationChange(option.id, e.target.value)
                }
                placeholder={`Enter ${option.name.toLowerCase()}`}
              />
            ) : (
              <Input
                type="text"
                id={option.id}
                value={customizations[option.id] || ""}
                onChange={(e) =>
                  handleCustomizationChange(option.id, e.target.value)
                }
                placeholder={`Enter ${option.name.toLowerCase()}`}
              />
            )}
          </div>
        </div>
      ))}

      {/* Quantity and Add to Cart */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              id="quantity"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
              className="w-16 text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 99}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          className="mt-6 w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={stock_status === "out_of_stock"}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {stock_status === "out_of_stock"
            ? "Out of Stock"
            : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
} 