import { Package, Store, Clock, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

function Feature() {
  const navigate = useNavigate();

  const tiles = [
    {
      icon: Store,
      title: "Manage Store",
      description: "Update your store details, products, and settings",
      path: "/store-management",
      span: true
    },
    {
      icon: Clock,
      title: "Hours & Delivery",
      description: "Set your operating hours and delivery zones",
      path: "/delivery-settings"
    },
    {
      icon: Package,
      title: "Orders",
      description: "View and manage your incoming orders",
      path: "/orders"
    },
    {
      icon: CreditCard,
      title: "Payments",
      description: "Track your earnings and manage payments",
      path: "/payments",
      span: true
    }
  ];

  return (
    <div className="w-full py-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Dashboard</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-4xl tracking-tighter max-w-xl font-regular text-left">
                Manage Your Business
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                Everything you need to run your florist business efficiently in one place.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiles.map((tile, index) => (
              <div
                key={index}
                onClick={() => navigate(tile.path)}
                className={`bg-muted rounded-lg p-6 flex justify-between flex-col cursor-pointer shadow-apple hover:shadow-apple-hover transition-shadow
                  ${tile.span ? 'lg:col-span-2' : ''} aspect-square lg:aspect-auto`}
              >
                <tile.icon className="w-8 h-8 stroke-1 text-primary" />
                <div className="flex flex-col">
                  <h3 className="text-xl tracking-tight">{tile.title}</h3>
                  <p className="text-muted-foreground max-w-xs text-base">
                    {tile.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };