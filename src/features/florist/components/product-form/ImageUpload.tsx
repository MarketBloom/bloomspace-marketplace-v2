import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  uploadedImages: string[];
  setUploadedImages: (images: string[]) => void;
  error?: string;
}

export const ImageUpload = ({ uploadedImages, setUploadedImages, error }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);

    try {
      const newImages = await Promise.all(
        acceptedFiles.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}${Date.now()}.${fileExt}`;
          const filePath = `product-images/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("public")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("public")
            .getPublicUrl(filePath);

          return data.publicUrl;
        })
      );

      setUploadedImages([...uploadedImages, ...newImages]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages, setUploadedImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"]
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    disabled: isUploading
  });

  const removeImage = async (imageUrl: string) => {
    // Extract file path from URL
    const filePath = imageUrl.split("/").pop();
    if (!filePath) return;

    try {
      const { error } = await supabase.storage
        .from("public")
        .remove([`product-images/${filePath}`]);

      if (error) throw error;

      setUploadedImages(uploadedImages.filter(url => url !== imageUrl));
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border",
          error && "border-destructive",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          {isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Uploading...</p>
            </div>
          ) : isDragActive ? (
            <p>Drop the files here</p>
          ) : (
            <>
              <p>Drag & drop images here, or click to select</p>
              <p className="text-sm text-muted-foreground">
                Upload up to 5 images (max 5MB each)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {uploadedImages.map((url, index) => (
            <Card key={url} className="relative group">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(url);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};