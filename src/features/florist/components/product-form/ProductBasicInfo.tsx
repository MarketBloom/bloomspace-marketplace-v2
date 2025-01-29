import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ProductStatus } from "@/types/product";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductBasicInfoProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  price: number;
  setPrice: (price: number) => void;
  salePrice?: number;
  setSalePrice: (price: number | undefined) => void;
  category?: string;
  setCategory: (category: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedOccasions: string[];
  setSelectedOccasions: (occasions: string[]) => void;
  status: ProductStatus;
  setStatus: (status: ProductStatus) => void;
  stockQuantity: number;
  setStockQuantity: (quantity: number) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
  errors?: Record<string, string>;
}

const CATEGORIES = [
  "Bouquets",
  "Arrangements",
  "Roses",
  "Lilies",
  "Sunflowers",
  "Mixed Flowers",
  "Plants",
  "Seasonal"
];

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Sympathy",
  "Get Well",
  "Thank You",
  "New Baby",
  "Congratulations",
  "Just Because"
];

const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" }
];

export const ProductBasicInfo = ({
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  salePrice,
  setSalePrice,
  category,
  setCategory,
  selectedTags,
  setSelectedTags,
  selectedOccasions,
  setSelectedOccasions,
  status,
  setStatus,
  stockQuantity,
  setStockQuantity,
  lowStockThreshold,
  setLowStockThreshold,
  errors
}: ProductBasicInfoProps) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(newTag.trim())) {
        setSelectedTags([...selectedTags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const removeOccasion = (occasionToRemove: string) => {
    setSelectedOccasions(selectedOccasions.filter(occasion => occasion !== occasionToRemove));
  };

  return (
    <div className="grid gap-6">
      <div>
        <Label htmlFor="title">Product Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(errors?.title && "border-destructive")}
        />
        {errors?.title && (
          <p className="text-sm text-destructive mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={cn("min-h-[100px]", errors?.description && "border-destructive")}
        />
        {errors?.description && (
          <p className="text-sm text-destructive mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Regular Price</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price || ""}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className={cn(errors?.price && "border-destructive")}
          />
          {errors?.price && (
            <p className="text-sm text-destructive mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <Label htmlFor="salePrice">Sale Price (Optional)</Label>
          <Input
            id="salePrice"
            type="number"
            min="0"
            step="0.01"
            value={salePrice || ""}
            onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : undefined)}
            className={cn(errors?.salePrice && "border-destructive")}
          />
          {errors?.salePrice && (
            <p className="text-sm text-destructive mt-1">{errors.salePrice}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className={cn(errors?.category && "border-destructive")}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.category && (
            <p className="text-sm text-destructive mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input
            id="stockQuantity"
            type="number"
            min="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(parseInt(e.target.value))}
            className={cn(errors?.stockQuantity && "border-destructive")}
          />
          {errors?.stockQuantity && (
            <p className="text-sm text-destructive mt-1">{errors.stockQuantity}</p>
          )}
        </div>

        <div>
          <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
            className={cn(errors?.lowStockThreshold && "border-destructive")}
          />
          {errors?.lowStockThreshold && (
            <p className="text-sm text-destructive mt-1">{errors.lowStockThreshold}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="occasions">Occasions</Label>
        <Select
          value={selectedOccasions[selectedOccasions.length - 1] || ""}
          onValueChange={(value) => {
            if (!selectedOccasions.includes(value)) {
              setSelectedOccasions([...selectedOccasions, value]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select occasions" />
          </SelectTrigger>
          <SelectContent>
            {OCCASIONS.map((occasion) => (
              <SelectItem
                key={occasion}
                value={occasion}
                disabled={selectedOccasions.includes(occasion)}
              >
                {occasion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedOccasions.map((occasion) => (
            <Badge
              key={occasion}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {occasion}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeOccasion(occasion)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a tag and press Enter"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};