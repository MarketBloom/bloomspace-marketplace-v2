import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import type { CartItem as CartItemType } from "@/types/cart";

export default function Cart() {
  const { items, hasItems, updateCartItemQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 pt-24">
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Browse our beautiful flower arrangements</p>
            <Button onClick={() => navigate("/search")}>
              Continue Shopping
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24">
        <h1 className="text-2xl font-semibold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={(quantity) => updateCartItemQuantity(item.productId, quantity)}
                onRemove={() => removeFromCart(item.productId)}
              />
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </main>
    </div>
  );
}