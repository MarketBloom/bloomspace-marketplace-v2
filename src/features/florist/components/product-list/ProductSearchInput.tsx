import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductSearchInputProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const ProductSearchInput = ({ searchQuery, onSearchChange }: ProductSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};