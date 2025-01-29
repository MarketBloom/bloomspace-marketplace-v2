import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface StoreVisibilityProps {
  storeId: string;
  initialStatus: "private" | "published";
  onStatusChange: (status: "private" | "published") => void;
}

export const StoreVisibility = ({ storeId, initialStatus, onStatusChange }: StoreVisibilityProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleVisibility = async () => {
    setLoading(true);
    const newStatus = status === "private" ? "published" : "private";

    const promise = new Promise(async (resolve, reject) => {
      try {
        const { error } = await supabase
          .from('florist_profiles')
          .update({ 
            store_status: newStatus,
          })
          .eq('id', storeId)
          .select('store_name, address')
          .single();

        if (error) throw error;

        setStatus(newStatus);
        onStatusChange(newStatus);
        resolve(newStatus);
      } catch (error) {
        reject(error);
      } finally {
        setLoading(false);
      }
    });

    toast.promise(promise, {
      loading: 'Updating store visibility...',
      success: (status) => `Store ${status === "published" ? "published" : "unpublished"} successfully`,
      error: 'Failed to update store visibility',
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium">Store Visibility</h3>
          <p className="text-sm text-muted-foreground">
            {status === "private"
              ? "Your store is currently hidden from the marketplace"
              : "Your store is visible to customers"}
          </p>
        </div>
        <Button
          variant={status === "published" ? "default" : "outline"}
          size="sm"
          onClick={toggleVisibility}
          disabled={loading}
          className="min-w-[100px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : status === "private" ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </>
          )}
        </Button>
      </div>
    </div>
  );
};