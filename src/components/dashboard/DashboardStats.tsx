import { ShoppingBag, Heart, MapPin, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface DashboardStatsProps {
  totalOrders: number;
  totalSpent: number;
  savedFlorists: number;
  recentLocations: number;
  isLoading?: boolean;
}

export function DashboardStats({
  totalOrders,
  totalSpent,
  savedFlorists,
  recentLocations,
  isLoading,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: <ShoppingBag className="h-4 w-4" />,
      formatter: (value: number) => value.toString(),
    },
    {
      label: "Total Spent",
      value: totalSpent,
      icon: <Clock className="h-4 w-4" />,
      formatter: formatPrice,
    },
    {
      label: "Saved Florists",
      value: savedFlorists,
      icon: <Heart className="h-4 w-4" />,
      formatter: (value: number) => value.toString(),
    },
    {
      label: "Recent Locations",
      value: recentLocations,
      icon: <MapPin className="h-4 w-4" />,
      formatter: (value: number) => value.toString(),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center text-gray-500 mb-2">
            {stat.icon}
            <span className="ml-2 text-sm">{stat.label}</span>
          </div>
          <div className="text-2xl font-semibold">
            {stat.formatter(stat.value)}
          </div>
        </div>
      ))}
    </div>
  );
}