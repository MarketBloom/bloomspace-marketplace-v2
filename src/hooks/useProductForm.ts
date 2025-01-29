import { useState } from "react";
import { Product, ProductStatus, Size } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductFormState {
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  category?: string;
  tags: string[];
  occasions: string[];
  status: ProductStatus;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  sizes: Size[];
  metadata: Record<string, any>;
}

interface UseProductFormProps {
  floristId: string;
  initialProduct?: Product;
  onSuccess?: () => void;
}

export const useProductForm = ({ floristId, initialProduct, onSuccess }: UseProductFormProps) => {
  const [formState, setFormState] = useState<ProductFormState>({
    title: initialProduct?.title || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price || 0,
    salePrice: initialProduct?.sale_price,
    category: initialProduct?.category,
    tags: initialProduct?.tags || [],
    occasions: initialProduct?.occasion || [],
    status: initialProduct?.status || "draft",
    stockQuantity: initialProduct?.stock_quantity || 0,
    lowStockThreshold: initialProduct?.low_stock_threshold || 5,
    images: initialProduct?.images || [],
    sizes: initialProduct?.product_sizes?.map(size => ({
      id: size.id,
      name: size.name,
      price: size.price.toString(),
      images: size.images,
      isDefault: size.is_default
    })) || [],
    metadata: initialProduct?.metadata || {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormState, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductFormState, string>> = {};

    if (!formState.title.trim()) {
      newErrors.title = "Please enter a product title";
    }

    if (!formState.description.trim()) {
      newErrors.description = "Please enter a product description";
    }

    if (formState.images.length === 0) {
      newErrors.images = "Please upload at least one product image";
    }

    if (formState.sizes.length === 0) {
      newErrors.sizes = "Please add at least one size option";
    }

    if (!formState.category) {
      newErrors.category = "Please select a category";
    }

    if (formState.price <= 0) {
      newErrors.price = "Please enter a valid price";
    }

    if (formState.salePrice && formState.salePrice >= formState.price) {
      newErrors.salePrice = "Sale price must be lower than regular price";
    }

    if (formState.stockQuantity < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    }

    if (formState.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = "Low stock threshold cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Object.values(errors).forEach(error => {
        if (error) toast.error(error);
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const basePrice = parseFloat(formState.sizes[0].price);
      
      // Insert or update product
      const productData = {
        florist_id: floristId,
        title: formState.title,
        description: formState.description,
        price: basePrice,
        sale_price: formState.salePrice,
        images: formState.images,
        category: formState.category,
        occasion: formState.occasions,
        tags: formState.tags,
        status: formState.status,
        stock_quantity: formState.stockQuantity,
        low_stock_threshold: formState.lowStockThreshold,
        metadata: formState.metadata
      };

      const { data: product, error: productError } = initialProduct
        ? await supabase
            .from("products")
            .update(productData)
            .eq("id", initialProduct.id)
            .select()
            .single()
        : await supabase
            .from("products")
            .insert(productData)
            .select()
            .single();

      if (productError) throw productError;

      // Handle sizes
      const sizesData = formState.sizes.map((size, index) => ({
        product_id: product.id,
        name: size.name,
        price_adjustment: index === 0 ? 0 : parseFloat(size.price) - basePrice,
        images: size.images || [],
        is_default: index === 0 || size.isDefault,
        stock_quantity: formState.stockQuantity // Initially same as product quantity
      }));

      if (initialProduct) {
        // Delete old sizes
        await supabase
          .from("product_sizes")
          .delete()
          .eq("product_id", initialProduct.id);
      }

      // Insert new sizes
      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizesData);

      if (sizesError) throw sizesError;

      toast.success(
        initialProduct ? "Product updated successfully" : "Product added successfully",
        {
          description: `${formState.title} has been ${initialProduct ? "updated" : "added"} to your store.`,
        }
      );

      onSuccess?.();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(`Failed to ${initialProduct ? "update" : "add"} product. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    formState,
    isSubmitting,
    errors,
    updateField,
    handleSubmit
  };
};
