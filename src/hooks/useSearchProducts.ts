import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/utils/geo';
import type { AddressWithCoordinates } from '@/types/address';

interface SearchProductsOptions {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance';
  customerLocation?: AddressWithCoordinates;
  deliveryOnly?: boolean;
  page?: number;
  limit?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  florist: {
    id: string;
    name: string;
    address: AddressWithCoordinates;
    delivery_radius: number;
  };
  distance?: number;
  delivery_available?: boolean;
}

export function useSearchProducts(options: SearchProductsOptions = {}) {
  const [isCalculatingDistances, setIsCalculatingDistances] = useState(false);

  const fetchProducts = useCallback(async () => {
    const {
      query = '',
      category,
      minPrice,
      maxPrice,
      sortBy = 'distance',
      customerLocation,
      deliveryOnly = false,
      page = 1,
      limit = 20,
    } = options;

    let queryBuilder = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        images,
        florist:florist_id (
          id,
          name,
          address,
          delivery_radius
        )
      `)
      .ilike('name', `%${query}%`);

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (minPrice !== undefined) {
      queryBuilder = queryBuilder.gte('price', minPrice);
    }

    if (maxPrice !== undefined) {
      queryBuilder = queryBuilder.lte('price', maxPrice);
    }

    // Add pagination
    const from = (page - 1) * limit;
    queryBuilder = queryBuilder.range(from, from + limit - 1);

    // Fetch products
    const { data: products, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    if (!products) {
      return [];
    }

    // Calculate distances and delivery availability if customer location is provided
    if (customerLocation) {
      setIsCalculatingDistances(true);
      try {
        const productsWithDistance = await Promise.all(
          products.map(async (product) => {
            if (!product.florist?.address) {
              return { ...product, distance: Infinity, delivery_available: false };
            }

            try {
              const result = await calculateDistance(
                customerLocation,
                product.florist.address as AddressWithCoordinates
              );

              const distanceKm = result.distance / 1000;
              const delivery_available = distanceKm <= product.florist.delivery_radius;

              return {
                ...product,
                distance: distanceKm,
                delivery_available,
              };
            } catch (error) {
              console.error('Error calculating distance for product:', error);
              return { ...product, distance: Infinity, delivery_available: false };
            }
          })
        );

        // Filter out products not available for delivery if deliveryOnly is true
        let filteredProducts = productsWithDistance;
        if (deliveryOnly) {
          filteredProducts = productsWithDistance.filter((p) => p.delivery_available);
        }

        // Sort products
        switch (sortBy) {
          case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            // TODO: Implement rating sort when ratings are added
            break;
          case 'distance':
          default:
            filteredProducts.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            break;
        }

        return filteredProducts;
      } finally {
        setIsCalculatingDistances(false);
      }
    }

    return products;
  }, [options]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', options],
    queryFn: fetchProducts,
  });

  return {
    products,
    isLoading: isLoading || isCalculatingDistances,
    error,
  };
} 