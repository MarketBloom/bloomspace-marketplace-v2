import { formatCurrency } from "@/utils/format";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface OrderItemsListProps {
  items: {
    id: string;
    products?: {
      id: string;
      title: string | null;
      images?: string[];
    };
    product_size?: {
      id: string;
      name: string;
    };
    quantity: number;
    price_at_time: number;
    notes?: string;
  }[];
  maxHeight?: string;
}

export const OrderItemsList = ({ items, maxHeight = "300px" }: OrderItemsListProps) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);

  return (
    <div className="space-y-4">
      <ScrollArea className={`max-h-[${maxHeight}]`}>
        <div className="space-y-4">
          {items?.map((item) => (
            <div key={item.id}>
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                  {item.products?.images?.[0] ? (
                    <Image
                      src={item.products.images[0]}
                      alt={item.products.title || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.products?.title}</h4>
                      <div className="text-sm text-muted-foreground space-x-2">
                        {item.product_size && (
                          <span>Size: {item.product_size.name}</span>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price_at_time * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Order Summary */}
      <div className="pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {/* Add more summary items here if needed (e.g., delivery fee, taxes) */}
      </div>
    </div>
  );
};