import { handleError, ErrorMessages } from '@/lib/error-handling';
import { LoadingState } from '@/components/ui/loading-state';
import { useSubscriptionCleanup } from '@/lib/cleanup';

export function ProductCatalog() {
  const [isLoading, setIsLoading] = useState(true);
  const { addSubscription, cleanup } = useSubscriptionCleanup();

  useEffect(() => {
    const subscription = supabase
      .channel('products')
      .on('postgres_changes', { /* ... */ })
      .subscribe();

    addSubscription(subscription);
    return cleanup;
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      // ... existing loading logic
    } catch (error) {
      handleError(error, { fallbackMessage: ErrorMessages.LOAD_FAILED });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading products..." />;
  }

  // ... rest of the component
} 