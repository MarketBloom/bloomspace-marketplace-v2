import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "./product-form/ImageUpload";
import { ProductBasicInfo } from "./product-form/ProductBasicInfo";
import { ProductSizes } from "./product-form/ProductSizes";
import { useProductForm } from "@/hooks/useProductForm";

interface AddProductFormProps {
  floristId: string;
  onProductAdded: () => void;
}

export const AddProductForm = ({ floristId, onProductAdded }: AddProductFormProps) => {
  const {
    formState,
    isSubmitting,
    errors,
    updateField,
    handleSubmit
  } = useProductForm({
    floristId,
    onSuccess: onProductAdded
  });

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <ProductBasicInfo
              title={formState.title}
              setTitle={(title) => updateField("title", title)}
              description={formState.description}
              setDescription={(description) => updateField("description", description)}
              price={formState.price}
              setPrice={(price) => updateField("price", price)}
              salePrice={formState.salePrice}
              setSalePrice={(salePrice) => updateField("salePrice", salePrice)}
              category={formState.category}
              setCategory={(category) => updateField("category", category)}
              selectedTags={formState.tags}
              setSelectedTags={(tags) => updateField("tags", tags)}
              selectedOccasions={formState.occasions}
              setSelectedOccasions={(occasions) => updateField("occasions", occasions)}
              status={formState.status}
              setStatus={(status) => updateField("status", status)}
              stockQuantity={formState.stockQuantity}
              setStockQuantity={(quantity) => updateField("stockQuantity", quantity)}
              lowStockThreshold={formState.lowStockThreshold}
              setLowStockThreshold={(threshold) => updateField("lowStockThreshold", threshold)}
              errors={errors}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Product Images</h3>
            <ImageUpload
              uploadedImages={formState.images}
              setUploadedImages={(images) => updateField("images", images)}
              error={errors.images}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Product Sizes and Pricing</h3>
            <ProductSizes 
              sizes={formState.sizes} 
              setSizes={(sizes) => updateField("sizes", sizes)}
              error={errors.sizes}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Product..." : "Add Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};