import { Button } from "@/components/ui/button";
import { Loader2, Check, Save } from "lucide-react";

interface SaveChangesButtonProps {
  loading: boolean;
  saveSuccess: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

export const SaveChangesButton = ({
  loading,
  saveSuccess,
  hasUnsavedChanges,
  onSave,
}: SaveChangesButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2 items-center bg-white shadow-lg rounded-full px-4 py-2 border border-gray-200">
      <span className="text-sm text-gray-600">You have unsaved changes</span>
      <Button 
        onClick={onSave} 
        disabled={loading || !hasUnsavedChanges}
        className={`transition-all duration-300 ${
          saveSuccess 
            ? "bg-green-500 hover:bg-green-600" 
            : ""
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : saveSuccess ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Saved!
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
};