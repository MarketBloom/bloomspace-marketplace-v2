import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Size {
  id: string;
  name: string;
  price_adjustment: number;
}

interface ProductSizeSelectorProps {
  sizes: Size[];
  selectedSizeId: string | null;
  basePrice: number;
  onSizeChange: (sizeId: string) => void;
}

export const ProductSizeSelector = ({ 
  sizes, 
  selectedSizeId, 
  basePrice,
  onSizeChange 
}: ProductSizeSelectorProps) => {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Select Size</h2>
      <RadioGroup 
        defaultValue={selectedSizeId || undefined} 
        className="grid gap-4"
        onValueChange={onSizeChange}
      >
        {sizes.map((size) => (
          <div key={size.id} className="flex items-center space-x-3">
            <RadioGroupItem value={size.id} id={size.id} />
            <Label htmlFor={size.id} className="flex-1">
              <div className="flex justify-between">
                <span>{size.name}</span>
                <span className="font-semibold">
                  ${(basePrice + size.price_adjustment).toFixed(2)}
                </span>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};