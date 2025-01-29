import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BudgetFilter } from "../BudgetFilter";
import { CategoryFilter } from "../CategoryFilter";
import { OccasionFilter } from "../OccasionFilter";
import { useToast } from "@/hooks/use-toast";

interface MobileFiltersAccordionProps {
  budget: number[];
  setBudget: (value: number[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedOccasions: string[];
  setSelectedOccasions: (occasions: string[]) => void;
  onApplyFilters: () => void;
}

export const MobileFiltersAccordion = ({
  budget,
  setBudget,
  selectedCategories,
  setSelectedCategories,
  selectedOccasions,
  setSelectedOccasions,
  onApplyFilters,
}: MobileFiltersAccordionProps) => {
  const { toast } = useToast();

  const handleApplyFilters = () => {
    onApplyFilters();
    toast({
      title: "Filters applied",
      description: "Your search results have been updated.",
    });
  };

  return (
    <div className="space-y-4 relative z-[60]">
      <div className="manual-filters-section">
        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="occasions">Occasions</TabsTrigger>
          </TabsList>
          <TabsContent value="budget" className="bg-white rounded-lg p-4 border border-black/10 mt-2">
            <BudgetFilter 
              budget={budget}
              setBudget={setBudget}
            />
          </TabsContent>
          <TabsContent value="categories" className="bg-white rounded-lg p-4 border border-black/10 mt-2">
            <CategoryFilter 
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </TabsContent>
          <TabsContent value="occasions" className="bg-white rounded-lg p-4 border border-black/10 mt-2">
            <OccasionFilter 
              selectedOccasions={selectedOccasions}
              setSelectedOccasions={setSelectedOccasions}
            />
          </TabsContent>
        </Tabs>
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