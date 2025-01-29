import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

interface DuplicateProductProps {
  product: Product;
  onProductDuplicated: () => void;
}

export const DuplicateProduct = ({ product, onProductDuplicated }: DuplicateProductProps) => {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      // First, duplicate the main product
      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert({
          florist_id: product.florist_id,
          title: `${product.title} (Copy)`,
          description: product.description,
          price: product.price,
          images: product.images,
          category: product.category,
          occasion: product.occasion,
          in_stock: product.in_stock,
          is_hidden: product.is_hidden
        })
        .select()
        .single();

      if (productError) throw productError;

      // Then, duplicate all size variants if they exist
      if (product.product_sizes && product.product_sizes.length > 0) {
        const sizesData = product.product_sizes.map(size => ({
          product_id: newProduct.id,
          name: size.name,
          price_adjustment: parseFloat(size.price) - product.price,
          images: size.images || [],
          is_default: size.isDefault
        }));

        const { error: sizesError } = await supabase
          .from("product_sizes")
          .insert(sizesData);

        if (sizesError) throw sizesError;
      }

      toast.success("Product duplicated successfully", {
        description: `${product.title} has been duplicated.`
      });
      
      onProductDuplicated();
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast.error("Failed to duplicate product");
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDuplicate}
      disabled={isDuplicating}
    >
      {isDuplicating ? (
        "Duplicating..."
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </>
      )}
    </Button>
  );
};