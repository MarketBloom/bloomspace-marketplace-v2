import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CheckoutState {
  isGift: boolean;
  recipientName: string | null;
  giftMessage: string | null;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const { isGift, recipientName, giftMessage } = (location.state as CheckoutState) || {};

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handlePlaceOrder = async () => {
    try {
      // Here you would typically:
      // 1. Process payment
      // 2. Create order in database
      // 3. Clear cart
      // 4. Navigate to confirmation page
      clear();
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-24">
        <h1 className="text-2xl font-semibold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Gift Details */}
            {isGift && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Gift Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Recipient</Label>
                    <p className="text-gray-700">{recipientName}</p>
                  </div>
                  <div>
                    <Label>Gift Message</Label>
                    <p className="text-gray-700 whitespace-pre-wrap">{giftMessage}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Details would go here */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <p className="text-gray-600">Payment integration will be implemented here</p>
            </Card>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Total</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>Calculated at next step</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold mb-6">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;