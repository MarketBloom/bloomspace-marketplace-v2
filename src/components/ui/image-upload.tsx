import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true);

        // Check if adding new files would exceed the limit
        if (value.length + acceptedFiles.length > maxFiles) {
          toast({
            title: 'Error',
            description: `You can only upload up to ${maxFiles} images`,
            variant: 'destructive',
          });
          return;
        }

        const uploadPromises = acceptedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `product-images/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('public')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('public').getPublicUrl(filePath);

          return publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        onChange([...value, ...uploadedUrls]);

        toast({
          title: 'Success',
          description: 'Images uploaded successfully',
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        toast({
          title: 'Error',
          description: 'Failed to upload images. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [maxFiles, onChange, toast, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled: isUploading,
    maxFiles: maxFiles - value.length,
  });

  const removeImage = async (urlToRemove: string) => {
    try {
      // Extract file path from URL
      const filePath = urlToRemove.split('/').pop();
      if (!filePath) return;

      const { error } = await supabase.storage
        .from('public')
        .remove([`product-images/${filePath}`]);

      if (error) {
        throw error;
      }

      onChange(value.filter((url) => url !== urlToRemove));
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative h-24 w-24 overflow-hidden rounded-lg border"
          >
            <img
              src={url}
              alt={`Uploaded ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50',
          isDragActive && 'border-primary',
          isUploading && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>Drop the files here</p>
            ) : (
              <p>
                Drag and drop images here, or click to select
                {maxFiles > 1 && ` (up to ${maxFiles - value.length} more)`}
              </p>
            )}
          </div>
          <Button type="button" variant="secondary" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </Button>
        </div>
      </div>
    </div>
  );
}
