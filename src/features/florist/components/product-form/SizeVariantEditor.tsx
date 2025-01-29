import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Size } from "@/types/product";
import { X } from "lucide-react";

interface SizeVariantEditorProps {
  size: Size;
  index: number;
  onSizeChange: (index: number, field: keyof Size, value: any) => void;
  onRemoveSize: (index: number) => void;
}

export const SizeVariantEditor = ({
  size,
  index,
  onSizeChange,
  onRemoveSize,
}: SizeVariantEditorProps) => {
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <Input
          placeholder="Size name"
          value={size.name}
          onChange={(e) => onSizeChange(index, "name", e.target.value)}
        />
      </div>
      <div className="w-32">
        <Input
          type="number"
          placeholder="Price"
          value={size.price}
          onChange={(e) => onSizeChange(index, "price", e.target.value)}
          step="0.01"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemoveSize(index)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};