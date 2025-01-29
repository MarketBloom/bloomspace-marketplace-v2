import { useState } from 'react';
import { useCart } from './useCart';
import { toast } from '@/components/ui/use-toast';

interface AddToCartOptions {
  id: string;
  name: string;
  price: number;
  image?: string;
  floristId: string;
  floristName: string;
  sizes?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export function useAddToCart(product: AddToCartOptions) {
  const { addToCart, currentFlorist } = useCart();
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>(
    product.sizes?.[0]?.id
  );

  const selectedSize = product.sizes?.find(size => size.id === selectedSizeId);

  const handleAddToCart = () => {
    try {
      // Check if product has sizes but none selected
      if (product.sizes?.length && !selectedSizeId) {
        toast({
          title: 'Please select a size',
          variant: 'destructive',
        });
        return;
      }

      // If there's a current florist and it's different from this product's florist
      if (currentFlorist && currentFlorist !== product.floristId) {
        const confirmed = window.confirm(
          'Adding items from a different florist will clear your current cart. Would you like to continue?'
        );
        if (!confirmed) {
          return;
        }
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: selectedSize?.price ?? product.price,
        image: product.image,
        floristId: product.floristId,
        floristName: product.floristName,
        sizeId: selectedSizeId,
        sizeName: selectedSize?.name,
      });

      toast({
        title: 'Added to cart',
        description: 'Your item has been added to the cart.',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    selectedSizeId,
    setSelectedSizeId,
    handleAddToCart,
    selectedSize,
  };
}
