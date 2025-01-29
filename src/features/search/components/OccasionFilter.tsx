import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const occasions = [
  "All",
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

interface OccasionFilterProps {
  selectedOccasions: string[];
  setSelectedOccasions: (occasions: string[]) => void;
}

export const OccasionFilter = ({ 
  selectedOccasions, 
  setSelectedOccasions 
}: OccasionFilterProps) => {
  const handleOccasionChange = (checked: boolean, occasion: string) => {
    if (occasion === "All") {
      if (checked) {
        setSelectedOccasions(["All"]);
      } else {
        setSelectedOccasions([]);
      }
    } else {
      if (checked) {
        const newOccasions = selectedOccasions.filter(o => o !== "All").concat([occasion]);
        setSelectedOccasions(newOccasions);
      } else {
        setSelectedOccasions(selectedOccasions.filter(o => o !== occasion));
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-foreground text-xs font-medium">Occasions</label>
      <div className="space-y-2 bg-white/90 border border-black rounded-md p-2">
        {occasions.map((occasion) => (
          <div key={occasion} className="flex items-center space-x-2">
            <Checkbox 
              id={`occasion-${occasion}`}
              checked={selectedOccasions.includes(occasion)}
              onCheckedChange={(checked) => handleOccasionChange(checked as boolean, occasion)}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor={`occasion-${occasion}`} className="text-xs">{occasion}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};