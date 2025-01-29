import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "../product-form/ImageUpload";
import { ProductBasicInfo } from "../product-form/ProductBasicInfo";
import { CategorySelection } from "../product-form/CategorySelection";
import { OccasionSelection } from "../product-form/OccasionSelection";
import { ProductSizes } from "../product-form/ProductSizes";
import { Separator } from "@/components/ui/separator";
import { Size, Product } from "@/types/product";
import { SizeVariantEditor } from "../product-form/SizeVariantEditor";

const categories = [
  "Bouquets",
  "Arrangements",
  "Roses",
  "Lilies",
  "Sunflowers",
  "Mixed Flowers",
  "Plants",
  "Seasonal"
];

const occasions = [
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

interface ProductEditFormProps {
  product: Product & {
    images?: string[];
    category?: string;
    occasion?: string[];
  };
  onSave: (product: any) => Promise<void>;
  onCancel: () => void;
}

export const ProductEditForm = ({ product, onSave, onCancel }: ProductEditFormProps) => {
  const [editedProduct, setEditedProduct] = useState({
    title: product.title,
    description: product.description || "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product.category ? [product.category] : []
  );
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    product.occasion || []
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    product.images || []
  );
  const [sizes, setSizes] = useState<Size[]>(
    product.product_sizes?.map(size => ({
      id: size.id,
      name: size.name,
      price: size.price.toString(),
      images: [],
    })) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sizes.length === 0) {
      alert("Please add at least one size option");
      return;
    }

    const updatedProduct = {
      id: product.id,
      title: editedProduct.title,
      description: editedProduct.description,
      price: parseFloat(sizes[0].price),
      category: selectedCategories[0],
      occasion: selectedOccasions,
      images: uploadedImages,
      product_sizes: sizes,
    };

    await onSave(updatedProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <ProductBasicInfo
          title={editedProduct.title}
          setTitle={(title) => setEditedProduct({ ...editedProduct, title })}
          description={editedProduct.description}
          setDescription={(description) => setEditedProduct({ ...editedProduct, description })}
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Product Images</h3>
        <ImageUpload
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
        />
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Product Sizes and Pricing</h3>
        <div className="space-y-4">
          {sizes.map((size, index) => (
            <SizeVariantEditor
              key={size.id}
              size={size}
              index={index}
              onSizeChange={(index, field, value) => {
                const newSizes = [...sizes];
                newSizes[index] = { ...newSizes[index], [field]: value };
                setSizes(newSizes);
              }}
              onRemoveSize={(index) => {
                setSizes(sizes.filter((_, i) => i !== index));
              }}
            />
          ))}
          <Button
            type="button"
            onClick={() => setSizes([...sizes, { id: `temp-${Date.now()}`, name: "", price: "", images: [] }])}
          >
            Add Size
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Categories and Occasions</h3>
        <div className="grid gap-6">
          <CategorySelection
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />

          <OccasionSelection
            occasions={occasions}
            selectedOccasions={selectedOccasions}
            setSelectedOccasions={setSelectedOccasions}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};