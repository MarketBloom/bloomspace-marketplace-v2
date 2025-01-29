import { Skeleton } from "@/components/ui/skeleton";

interface SearchResultsHeaderProps {
  isLoading: boolean;
  count: number;
  type: 'products' | 'florists';
}

export const SearchResultsHeader = ({ 
  isLoading, 
  count, 
  type,
}: SearchResultsHeaderProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const getMessage = () => {
    if (type === 'florists') {
      return `${count} curated ${count === 1 ? 'florist' : 'florists'} in your area`;
    }
    return `${count} fresh ${count === 1 ? 'arrangement' : 'arrangements'} available`;
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-medium">
        {getMessage()}
      </h2>
    </div>
  );
};