import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductListItem } from "./product-list/ProductListItem";
import { Product } from "../../types/product";
import { ProductSearchInput } from "./product-list/ProductSearchInput";
import { ProductEmptyState } from "./product-list/ProductEmptyState";

interface ProductListProps {
  products: Product[];
  onProductDeleted: () => void;
}

export const ProductList = ({ products, onProductDeleted }: ProductListProps) => {
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success("Product deleted successfully");
      onProductDeleted();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = async (product: Product) => {
    try {
      const { error: productError } = await supabase
        .from('products')
        .update({
          title: product.title,
          description: product.description,
          price: Number(product.product_sizes?.[0]?.price || 0),
          images: product.images || [],
          category: product.category || null,
          occasion: product.occasion || []
        })
        .eq('id', product.id);

      if (productError) throw productError;

      if (product.product_sizes && product.product_sizes.length > 0) {
        const basePrice = Number(product.product_sizes[0].price);
        
        const { error: sizesError } = await supabase
          .from('product_sizes')
          .upsert(
            product.product_sizes.map(size => ({
              id: size.id.startsWith('temp-') ? undefined : size.id,
              product_id: product.id,
              name: size.name,
              price_adjustment: Number(size.price) - basePrice,
              images: size.images || []
            }))
          );

        if (sizesError) throw sizesError;
      }

      toast.success("Changes saved successfully");
      onProductDeleted();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error("Failed to save changes");
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ProductSearchInput 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="space-y-4">
        {filteredProducts.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            isExpanded={expandedProducts.includes(product.id)}
            onToggle={() => toggleProduct(product.id)}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
        
        {filteredProducts.length === 0 && (
          <ProductEmptyState searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};