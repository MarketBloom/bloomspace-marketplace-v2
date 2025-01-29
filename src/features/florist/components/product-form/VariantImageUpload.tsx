import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VariantImageUploadProps {
  images: string[];
  onImagesChange: (newImages: string[]) => void;
  isUploading: boolean;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

export const VariantImageUpload = ({
  images,
  onImagesChange,
  isUploading,
  onUploadStart,
  onUploadEnd,
}: VariantImageUploadProps) => {
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      onUploadStart();
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("florist-images")
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`Failed to upload image ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("florist-images")
          .getPublicUrl(filePath);

        newImages.push(publicUrl);
      }

      onImagesChange([...images, ...newImages]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      onUploadEnd();
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images?.map((image, imageIndex) => (
          <div key={imageIndex} className="relative group">
            <img
              src={image}
              alt={`Variant image ${imageIndex + 1}`}
              className="w-16 h-16 object-cover rounded-md border"
            />
            <button
              type="button"
              onClick={() => removeImage(imageIndex)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <div>
          <input
            type="file"
            id="variant-images"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("variant-images")?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4 mr-2" />
                Add Images
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};