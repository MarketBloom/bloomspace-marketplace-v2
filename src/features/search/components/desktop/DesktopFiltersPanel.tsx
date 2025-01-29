import { Button } from "@/components/ui/button";
import { BudgetFilter } from "../BudgetFilter";
import { CategoryFilter } from "../CategoryFilter";
import { OccasionFilter } from "../OccasionFilter";
import { useToast } from "@/hooks/use-toast";

interface DesktopFiltersPanelProps {
  budget: number[];
  setBudget: (value: number[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedOccasions: string[];
  setSelectedOccasions: (occasions: string[]) => void;
  onApplyFilters: () => void;
}

export const DesktopFiltersPanel = ({
  budget,
  setBudget,
  selectedCategories,
  setSelectedCategories,
  selectedOccasions,
  setSelectedOccasions,
  onApplyFilters,
}: DesktopFiltersPanelProps) => {
  const { toast } = useToast();

  const handleApplyFilters = () => {
    onApplyFilters();
    toast({
      title: "Filters applied",
      description: "Your search results have been updated.",
    });
  };

  return (
    <div className="space-y-6 bg-white rounded-lg p-4 border border-black/10 relative z-[60]">
      <div className="manual-filters-section">
        <BudgetFilter 
          budget={budget}
          setBudget={setBudget}
        />
        
        <CategoryFilter 
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
        
        <OccasionFilter 
          selectedOccasions={selectedOccasions}
          setSelectedOccasions={setSelectedOccasions}
        />

        <Button 
          onClick={handleApplyFilters}
          className="w-full bg-[#C5E1A5] hover:bg-[#C5E1A5]/90 text-black font-bold py-3 px-4 rounded mt-4 relative z-[70]"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};