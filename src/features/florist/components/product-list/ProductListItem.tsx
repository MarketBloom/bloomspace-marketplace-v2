import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Product } from "@/types/product";
import { ProductEditForm } from "./ProductEditForm";
import { DuplicateProduct } from "./DuplicateProduct";

interface ProductListItemProps {
  product: Product;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (productId: string) => void;
  onEdit: (product: Product) => Promise<void>;
}

export const ProductListItem = ({
  product,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
}: ProductListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (updatedProduct: Product) => {
    await onEdit(updatedProduct);
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
            </div>
            <div>
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-muted-foreground">
                Base price: ${product.price}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DuplicateProduct 
              product={product} 
              onProductDuplicated={onToggle} 
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this product? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(product.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-4">
          {isEditing ? (
            <ProductEditForm
              product={product}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Product
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};