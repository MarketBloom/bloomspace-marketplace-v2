import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { Size } from "@/types/product";
import { Card } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { GripVertical, Plus, Trash2, Star, StarOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface ProductSizesProps {
  sizes: Size[];
  setSizes: (sizes: Size[]) => void;
  error?: string;
}

export const ProductSizes = ({ sizes, setSizes, error }: ProductSizesProps) => {
  const [newSize, setNewSize] = useState<Partial<Size>>({
    name: "",
    price: "",
    images: [],
    isDefault: false
  });

  const addSize = () => {
    if (!newSize.name || !newSize.price) return;

    const sizeId = `temp-${Date.now()}`;
    setSizes([
      ...sizes,
      {
        id: sizeId,
        name: newSize.name,
        price: newSize.price,
        images: newSize.images || [],
        isDefault: sizes.length === 0 ? true : newSize.isDefault || false
      }
    ]);

    setNewSize({
      name: "",
      price: "",
      images: [],
      isDefault: false
    });
  };

  const removeSize = (indexToRemove: number) => {
    const newSizes = sizes.filter((_, index) => index !== indexToRemove);
    
    // If we removed the default size, make the first remaining size default
    if (sizes[indexToRemove].isDefault && newSizes.length > 0) {
      newSizes[0].isDefault = true;
    }
    
    setSizes(newSizes);
  };

  const updateSize = (index: number, field: keyof Size, value: any) => {
    const newSizes = [...sizes];
    newSizes[index] = {
      ...newSizes[index],
      [field]: value
    };

    // If this size is being set as default, unset others
    if (field === "isDefault" && value === true) {
      newSizes.forEach((size, i) => {
        if (i !== index) {
          size.isDefault = false;
        }
      });
    }

    setSizes(newSizes);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sizes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSizes(items);
  };

  return (
    <div className="space-y-6">
      {/* Add New Size Form */}
      <Card className="p-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizeName">Size Name</Label>
              <Input
                id="sizeName"
                value={newSize.name}
                onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
                placeholder="e.g., Small, Medium, Large"
              />
            </div>
            <div>
              <Label htmlFor="sizePrice">Price</Label>
              <Input
                id="sizePrice"
                type="number"
                min="0"
                step="0.01"
                value={newSize.price}
                onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label>Size-specific Images (Optional)</Label>
            <ImageUpload
              uploadedImages={newSize.images || []}
              setUploadedImages={(images) => setNewSize({ ...newSize, images })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={newSize.isDefault}
                onCheckedChange={(checked) => setNewSize({ ...newSize, isDefault: checked })}
              />
              <Label htmlFor="isDefault">Set as default size</Label>
            </div>

            <Button
              onClick={addSize}
              disabled={!newSize.name || !newSize.price}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Size List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sizes">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {sizes.map((size, index) => (
                <Draggable
                  key={size.id}
                  draggableId={size.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "p-4",
                        size.isDefault && "border-primary"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Size Name</Label>
                            <Input
                              value={size.name}
                              onChange={(e) => updateSize(index, "name", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={size.price}
                              onChange={(e) => updateSize(index, "price", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateSize(index, "isDefault", !size.isDefault)}
                          >
                            {size.isDefault ? (
                              <Star className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSize(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {size.images && size.images.length > 0 && (
                        <div className="mt-4">
                          <Label>Size-specific Images</Label>
                          <ImageUpload
                            uploadedImages={size.images}
                            setUploadedImages={(images) => updateSize(index, "images", images)}
                          />
                        </div>
                      )}
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};