import { ShieldCheck, Flower2, Users } from "lucide-react";

export const MobileDeliveryInfo = () => {
  return (
    <div className="bg-[#eed2d8] rounded-lg p-4 mb-4 border border-black space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold">
          Your City's Best Florists
        </h2>
        <p className="text-sm text-muted-foreground">
          Discover our curated network of exceptional local florists, each one handpicked for their creativity.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold">Handpicked Talent</h3>
            <p className="text-xs text-muted-foreground">
              Every florist in our marketplace has been personally selected for their excellence.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold">Secure Shopping</h3>
            <p className="text-xs text-muted-foreground">
              Shop with confidence knowing every order is backed by our guarantee.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Flower2 className="w-5 h-5 text-gray-700 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold">Local Excellence</h3>
            <p className="text-xs text-muted-foreground">
              Experience stunning designs from the finest florists in your area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};