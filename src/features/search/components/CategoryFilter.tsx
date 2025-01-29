import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const categories = [
  "All",
  "Bouquets",
  "Arrangements",
  "Roses",
  "Lilies", 
  "Sunflowers",
  "Mixed Flowers",
  "Plants",
  "Seasonal"
];

interface CategoryFilterProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

export const CategoryFilter = ({ 
  selectedCategories, 
  setSelectedCategories 
}: CategoryFilterProps) => {
  const handleCategoryChange = (checked: boolean, category: string) => {
    if (category === "All") {
      if (checked) {
        setSelectedCategories(["All"]);
      } else {
        setSelectedCategories([]);
      }
    } else {
      if (checked) {
        const newCategories = selectedCategories.filter(c => c !== "All").concat([category]);
        setSelectedCategories(newCategories);
      } else {
        setSelectedCategories(selectedCategories.filter(c => c !== category));
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-foreground text-xs font-medium">Categories</label>
      <div className="space-y-2 bg-white/90 border border-black rounded-md p-2">
        {categories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox 
              id={`category-${category}`}
              checked={selectedCategories.includes(category)}
              onCheckedChange={(checked) => handleCategoryChange(checked as boolean, category)}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor={`category-${category}`} className="text-xs">{category}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};