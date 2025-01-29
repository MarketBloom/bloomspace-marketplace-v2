import { ShieldCheck, Flower2, Users } from "lucide-react";
import { GooeyText } from "@/components/ui/gooey-text";

interface DeliveryInfoProps {
  fulfillmentType: 'pickup' | 'delivery';
}

export const DeliveryInfo = ({ fulfillmentType }: DeliveryInfoProps) => {
  return (
    <div className="bg-[#eed2d8] rounded-lg p-6 mb-4 border border-black space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-6xl font-bold">
          <GooeyText>
            {fulfillmentType === 'delivery' ? (
              <>
                Your City's Best Florists
                <br />
                All in One Place
              </>
            ) : (
              <>
                Local Pickup from
                <br />
                Expert Florists
              </>
            )}
          </GooeyText>
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {fulfillmentType === 'delivery' 
            ? "Discover our curated network of exceptional local florists, each one handpicked for their creativity and reliability. All in one convenient marketplace."
            : "Skip delivery fees and pick up your flowers directly from our talented local florists. Perfect for last-minute orders and budget-conscious shoppers."}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <Users className="w-6 h-6 mx-auto text-gray-700" />
          <h3 className="text-xl font-semibold">Handpicked Talent</h3>
          <p className="text-sm text-muted-foreground">
            Every florist in our marketplace has been personally selected for their excellence.
          </p>
        </div>

        <div className="space-y-2">
          <ShieldCheck className="w-6 h-6 mx-auto text-gray-700" />
          <h3 className="text-xl font-semibold">Secure Shopping</h3>
          <p className="text-sm text-muted-foreground">
            Shop with confidence knowing every order is backed by our guarantee.
          </p>
        </div>

        <div className="space-y-2">
          <Flower2 className="w-6 h-6 mx-auto text-gray-700" />
          <h3 className="text-xl font-semibold">Local Excellence</h3>
          <p className="text-sm text-muted-foreground">
            Experience stunning designs from the finest florists in your area.
          </p>
        </div>
      </div>
    </div>
  );
};