import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistance } from '@/utils/geo';
import type { AddressWithCoordinates } from '@/types/address';

interface FloristCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  address: AddressWithCoordinates;
  isDeliveryAvailable: boolean;
}

export function FloristCard({
  id,
  name,
  description,
  imageUrl,
  rating,
  reviewCount,
  distance,
  address,
  isDeliveryAvailable,
}: FloristCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={imageUrl || '/placeholder-store.jpg'}
          alt={name}
          className="object-cover w-full h-full"
        />
        {isDeliveryAvailable && (
          <Badge variant="success" className="absolute top-2 right-2">
            Delivers to you
          </Badge>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            {distance !== undefined && (
              <CardDescription>{formatDistance(distance * 1000)}</CardDescription>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviewCount})</span>
            </div>
            <CardDescription>{address.formattedAddress}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/florist/${id}`}>View Store</Link>
          </Button>
          {!isDeliveryAvailable && (
            <span className="text-sm text-muted-foreground">
              Outside delivery area
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 