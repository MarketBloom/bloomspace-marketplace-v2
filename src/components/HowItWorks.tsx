import { Search, ShoppingBag, Truck } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-14 w-14 text-pink-500" />,
      title: "Browse & Choose",
      description: "Find the perfect flowers from local florists in your area",
    },
    {
      icon: <ShoppingBag className="h-14 w-14 text-pink-500" />,
      title: "Place Your Order",
      description: "Customize your arrangement and select delivery options",
    },
    {
      icon: <Truck className="h-14 w-14 text-pink-500" />,
      title: "Fast Delivery",
      description: "Get fresh flowers delivered right to your door",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-pink-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple & Easy Process
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get beautiful flowers delivered to your door in just three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-6 transform group-hover:-translate-y-1 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                  <div className="w-8 h-0.5 bg-pink-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 