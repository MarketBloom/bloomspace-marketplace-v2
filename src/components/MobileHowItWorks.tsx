import { Flower, Heart, Filter, Truck } from 'lucide-react';

const FEATURES = [
  {
    icon: Flower,
    title: "Local Excellence",
    description: "Support the finest florists in your community creating stunning arrangements"
  },
  {
    icon: Heart,
    title: "Seamless Selection",
    description: "Browse and filter arrangements from our florists, and complete your order in one place"
  },
  {
    icon: Filter,
    title: "Secure Checkout",
    description: "Shop with confidence using our safe and effortless payment system"
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    description: "Same-day delivery available for those special moments"
  }
];

export function MobileHowItWorks() {
  return (
    <section className="md:hidden py-8 mt-0 bg-background">
      <div className="px-4">
        {/* Typography */}
        <h2 className="text-4xl font-bold text-center mb-4 font-display">
          Fresh Flowers, Delivered with Care
        </h2>
        <p className="text-lg text-muted-foreground text-center mb-8">
          Discover our handpicked selection of exceptional local florists
        </p>

        {/* Feature Cards */}
        <div className="space-y-4">
          {FEATURES.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#eed2d8] rounded-2xl p-6 animate-fade-in"
            >
              <div className="flex items-start gap-4">
                <feature.icon className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 