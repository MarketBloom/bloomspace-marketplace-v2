import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext?: () => void;
  onBack?: () => void;
}

export const ImageUploadForm = ({ formData, setFormData, onNext, onBack }: ImageUploadFormProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, type: 'logo' | 'banner') => {
    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `florist-images/${formData.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('florist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('florist-assets')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        [`${type}_url`]: publicUrl
      });

      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Store Logo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, 'logo');
          }}
          disabled={uploading}
        />
        {formData.logo_url && (
          <img 
            src={formData.logo_url} 
            alt="Store logo" 
            className="mt-2 h-20 w-20 object-cover rounded"
          />
        )}
      </div>

      <div>
        <h3 className="font-medium mb-4">Store Banner</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, 'banner');
          }}
          disabled={uploading}
        />
        {formData.banner_url && (
          <img 
            src={formData.banner_url} 
            alt="Store banner" 
            className="mt-2 h-40 w-full object-cover rounded"
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button 
          onClick={onNext}
          disabled={!formData.logo_url || !formData.banner_url}
        >
          Next
        </Button>
      </div>
    </div>
  );
};