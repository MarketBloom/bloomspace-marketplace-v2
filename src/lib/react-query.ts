import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: true, // Refetch when window regains focus for real-time updates
      refetchOnMount: 'always', // Always refetch on mount to ensure fresh data
    },
    mutations: {
      retry: 1, // Retry failed mutations once
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    },
  },
});

// Cache keys for better organization and type safety
export const CACHE_KEYS = {
  // Florist related keys
  FLORIST: {
    PROFILE: (id: string) => ['florist', 'profile', id],
    ALL: () => ['florist'],
    SEARCH: (params: { lat: number; lng: number; radius?: number; query?: string }) => 
      ['florist', 'search', params],
    PRODUCTS: (floristId: string) => ['florist', 'products', floristId],
    ORDERS: (floristId: string) => ['florist', 'orders', floristId],
  },
  
  // Product related keys
  PRODUCT: {
    DETAIL: (id: string) => ['product', id],
    LIST: (params: { floristId?: string; category?: string; status?: string }) => 
      ['products', params],
  },
  
  // Order related keys
  ORDER: {
    DETAIL: (id: string) => ['order', id],
    LIST: (params: { customerId?: string; floristId?: string; status?: string }) => 
      ['orders', params],
    ITEMS: (orderId: string) => ['order', orderId, 'items'],
  },
  
  // Delivery related keys
  DELIVERY: {
    SLOTS: (params: { floristId: string; date: string }) => 
      ['delivery', 'slots', params],
    AVAILABILITY: (params: { floristId: string; lat: number; lng: number }) => 
      ['delivery', 'availability', params],
    RADIUS: (params: { floristId: string; lat: number; lng: number }) => 
      ['delivery', 'radius', params],
  },
} as const;

// Type-safe query key generator
export type QueryKeys = typeof CACHE_KEYS;
export type QueryKeyType<T extends keyof QueryKeys> = ReturnType<QueryKeys[T]>;

// Helper to invalidate all queries for a specific entity
export const invalidateQueries = {
  florist: (queryClient: QueryClient, id?: string) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.FLORIST.PROFILE(id) });
    } else {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.FLORIST.ALL() });
    }
  },
  products: (queryClient: QueryClient, floristId?: string) => {
    if (floristId) {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.FLORIST.PRODUCTS(floristId) });
    } else {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  },
  orders: (queryClient: QueryClient, params?: { customerId?: string; floristId?: string }) => {
    queryClient.invalidateQueries({ 
      queryKey: ['orders', params],
    });
  },
};
