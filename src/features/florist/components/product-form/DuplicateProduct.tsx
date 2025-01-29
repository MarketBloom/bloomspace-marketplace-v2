import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DuplicateProductProps {
  product: Product;
  onSuccess: () => void;
  onClose: () => void;
}

export const DuplicateProduct = ({ product, onSuccess, onClose }: DuplicateProductProps) => {
  const [title, setTitle] = useState(product.title + " (Copy)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newProduct = {
        ...product,
        title,
        id: undefined
      };

      const { error } = await supabase
        .from("products")
        .insert(newProduct);

      if (error) throw error;

      toast.success("Product duplicated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast.error("Failed to duplicate product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Product title"
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title || isSubmitting}>
          {isSubmitting ? "Duplicating..." : "Duplicate"}
        </Button>
      </div>
    </form>
  );
};