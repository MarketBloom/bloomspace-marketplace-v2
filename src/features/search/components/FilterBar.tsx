import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LocationFilter } from "./LocationFilter";
import { DateFilter } from "./filters/DateFilter";
import { BudgetFilter } from "./filters/BudgetFilter";
import { FulfillmentToggle } from "./filters/FulfillmentToggle";
import { CategoryFilter } from "./filters/CategoryFilter";
import { OccasionFilter } from "./filters/OccasionFilter";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface FilterBarProps {
  initialFulfillmentType?: "pickup" | "delivery";
  initialDate?: Date;
  initialBudget?: number[];
  initialLocation?: string;
  initialCategories?: string[];
  initialOccasions?: string[];
  onFilterChange?: (updates: Record<string, string>) => void;
}

export const FilterBar = ({ 
  initialFulfillmentType = "delivery",
  initialDate,
  initialBudget = [500],
  initialLocation = "",
  initialCategories = [],
  initialOccasions = [],
  onFilterChange
}: FilterBarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [budget, setBudget] = useState<number[]>(initialBudget);
  const [location, setLocation] = useState<string>(initialLocation);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">(initialFulfillmentType);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(initialOccasions);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const updates: Record<string, string> = {};
    
    if (location) {
      updates.location = location;
    }
    if (coordinates) {
      updates.lat = coordinates[0].toString();
      updates.lng = coordinates[1].toString();
    }
    if (date) {
      updates.date = date.toISOString();
    }
    if (budget && budget.length > 0) {
      updates.budget = budget[0].toString();
    }
    updates.fulfillment = fulfillmentType;

    if (selectedCategories.length > 0) {
      updates.categories = selectedCategories.join(',');
    }

    if (selectedOccasions.length > 0) {
      updates.occasions = selectedOccasions.join(',');
    }

    if (onFilterChange) {
      onFilterChange(updates);
    }
  }, [location, coordinates, date, budget, fulfillmentType, selectedCategories, selectedOccasions, onFilterChange]);

  const handleApplyFilters = () => {
    if (isSearching) return;
    
    setIsSearching(true);
    
    try {
      if (location && !coordinates) {
        toast({
          title: "Location Error",
          description: "Please enter a valid suburb or postcode",
          variant: "destructive"
        });
        return;
      }

      const updates: Record<string, string> = {};
      
      if (location && coordinates) {
        updates.location = location;
        updates.lat = coordinates[0].toString();
        updates.lng = coordinates[1].toString();
      }
      
      if (date) {
        const now = new Date();
        const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        
        if (isToday) {
          updates.date = now.toISOString();
        } else {
          updates.date = date.toISOString();
        }
      }
      
      updates.budget = budget[0].toString();
      updates.fulfillment = fulfillmentType;

      if (selectedCategories.length > 0) {
        updates.categories = selectedCategories.join(',');
      }

      if (selectedOccasions.length > 0) {
        updates.occasions = selectedOccasions.join(',');
      }

      if (onFilterChange) {
        onFilterChange(updates);
      } else {
        const searchParams = new URLSearchParams(updates);
        navigate({
          pathname: "/search",
          search: searchParams.toString()
        });
      }

      toast({
        title: "Filters Applied",
        description: "Your search results have been updated"
      });
    } catch (error) {
      console.error("Filter error:", error);
      toast({
        title: "Filter Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Location Filter */}
      <div className="w-full">
        <LocationFilter
          location={location}
          setLocation={setLocation}
          setCoordinates={setCoordinates}
        />
      </div>

      {/* Fulfillment Toggle */}
      <div className="w-full">
        <FulfillmentToggle
          fulfillmentType={fulfillmentType}
          setFulfillmentType={setFulfillmentType}
        />
      </div>

      {/* Date Filter */}
      <div className="w-full">
        <DateFilter
          date={date}
          setDate={setDate}
        />
      </div>

      {/* Budget Filter */}
      <div className="w-full">
        <BudgetFilter
          budget={budget}
          setBudget={setBudget}
        />
      </div>

      {/* Category Filter */}
      <div className="w-full">
        <CategoryFilter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
      </div>

      {/* Occasion Filter */}
      <div className="w-full">
        <OccasionFilter
          selectedOccasions={selectedOccasions}
          setSelectedOccasions={setSelectedOccasions}
        />
      </div>

      {/* Search Button */}
      <Button
        onClick={handleApplyFilters}
        disabled={isSearching}
        className="w-full bg-[#C5E1A5] hover:bg-[#C5E1A5]/90 text-black mt-4"
      >
        Search Flowers
      </Button>
    </div>
  );
};