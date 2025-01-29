import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface FilterBarLayoutProps {
  children: ReactNode;
  onSearch: () => void;
}

export const FilterBarLayout = ({ children, onSearch }: FilterBarLayoutProps) => {
  return (
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {children}
        <div className="flex items-end">
          <Button 
            className="bg-[#C5E1A5] hover:bg-[#C5E1A5]/90 text-black text-sm h-9 px-4 w-full rounded-full"
            onClick={onSearch}
          >
            Search Flowers
          </Button>
        </div>
      </div>
    </div>
  );
};