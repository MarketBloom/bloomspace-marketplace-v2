import { useState } from 'react';
import { Product } from '@/types/schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, isOwner = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const mainImage = product.images[0] || '/placeholder-product.jpg';

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageError ? '/placeholder-product.jpg' : mainImage}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          onError={() => setImageError(true)}
        />
        {product.status !== 'active' && (
          <div className="absolute top-2 right-2">
            <Badge variant={product.status === 'inactive' ? 'secondary' : 'destructive'}>
              {product.status === 'inactive' ? 'Inactive' : 'Deleted'}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="line-clamp-3">
          {product.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>
      </CardContent>
      {isOwner && (
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onDelete}
          >
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
