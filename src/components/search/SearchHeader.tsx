import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Rating", value: "rating" },
];

export function SearchHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "popular";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    
    if (query.trim()) {
      searchParams.set("q", query);
    } else {
      searchParams.delete("q");
    }
    setSearchParams(searchParams);
  };

  const handleSort = (value: string) => {
    if (value) {
      searchParams.set("sort", value);
    } else {
      searchParams.delete("sort");
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 w-full sm:max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="search"
                name="search"
                placeholder="Search flowers, occasions, or florists..."
                defaultValue={currentQuery}
                className="w-full pl-9 pr-4"
              />
            </div>
          </form>

          {/* Sort Options */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select value={currentSort} onValueChange={handleSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchParams.toString() !== "" && searchParams.get("q")) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from(searchParams.entries()).map(([key, value]) => {
              if (key === "sort") return null;
              return (
                <Button
                  key={key}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    searchParams.delete(key);
                    setSearchParams(searchParams);
                  }}
                >
                  {key === "q" ? `"${value}"` : `${key}: ${value}`}
                  <span className="ml-1">×</span>
                </Button>
              );
            })}
            {searchParams.toString() !== "" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchParams(new URLSearchParams())}
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}