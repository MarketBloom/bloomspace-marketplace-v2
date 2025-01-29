import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileFiltersAccordion } from "./mobile/MobileFiltersAccordion";
import { DesktopFiltersPanel } from "./desktop/DesktopFiltersPanel";

interface FloristProductFiltersProps {
  onFilterChange: (filters: {
    budget?: number[];
    categories?: string[];
    occasions?: string[];
  }) => void;
}

export const FloristProductFilters = ({ onFilterChange }: FloristProductFiltersProps) => {
  const [budget, setBudget] = useState<number[]>([500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const isMobile = useIsMobile();

  const handleApplyFilters = () => {
    onFilterChange({
      budget: budget.length > 0 ? budget : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      occasions: selectedOccasions.length > 0 ? selectedOccasions : undefined
    });
  };

  const filterProps = {
    budget,
    setBudget,
    selectedCategories,
    setSelectedCategories,
    selectedOccasions,
    setSelectedOccasions,
    onApplyFilters: handleApplyFilters,
  };

  if (isMobile) {
    return <MobileFiltersAccordion {...filterProps} />;
  }

  return <DesktopFiltersPanel {...filterProps} />;
};