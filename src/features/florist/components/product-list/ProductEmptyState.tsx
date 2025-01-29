interface ProductEmptyStateProps {
  searchQuery: string;
}

export const ProductEmptyState = ({ searchQuery }: ProductEmptyStateProps) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {searchQuery ? (
        <p>No products found matching your search.</p>
      ) : (
        <p>No products added yet.</p>
      )}
    </div>
  );
};