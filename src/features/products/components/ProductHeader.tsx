import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProductHeaderProps {
  onBack: () => void;
}

export const ProductHeader = ({ onBack }: ProductHeaderProps) => {
  return (
    <Button
      variant="ghost"
      className="mb-4"
      onClick={onBack}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Search
    </Button>
  );
};