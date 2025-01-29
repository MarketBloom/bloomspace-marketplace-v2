import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface OccasionSelectionProps {
  occasions: string[];
  selectedOccasions: string[];
  setSelectedOccasions: (occasions: string[]) => void;
}

export const OccasionSelection = ({
  occasions,
  selectedOccasions,
  setSelectedOccasions,
}: OccasionSelectionProps) => {
  const toggleOccasion = (occasion: string) => {
    if (selectedOccasions.includes(occasion)) {
      setSelectedOccasions(selectedOccasions.filter((o) => o !== occasion));
    } else {
      setSelectedOccasions([...selectedOccasions, occasion]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Occasions</Label>
      <div className="flex flex-wrap gap-2">
        {occasions.map((occasion) => (
          <button
            key={occasion}
            type="button"
            onClick={() => toggleOccasion(occasion)}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
              selectedOccasions.includes(occasion)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {occasion}
            {selectedOccasions.includes(occasion) && (
              <X className="ml-1 h-3 w-3" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};