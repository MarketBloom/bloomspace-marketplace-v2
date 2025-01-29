import { CartItem } from '@/types/cart';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="w-20 h-20 relative rounded-md overflow-hidden">
        <img
          src={item.image || '/placeholder.png'}
          alt={item.name}
          className="object-cover w-full h-full"
        />
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{item.floristName}</p>
        {item.sizeName && (
          <p className="text-sm text-muted-foreground">Size: {item.sizeName}</p>
        )}
        {item.customizations?.isGift && (
          <div className="mt-1 text-sm">
            <p className="text-muted-foreground">Gift for: {item.customizations.recipientName}</p>
            {item.customizations.giftMessage && (
              <p className="text-muted-foreground">Message: {item.customizations.giftMessage}</p>
            )}
          </div>
        )}
        <p className="font-medium mt-1">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(item.quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
