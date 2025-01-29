import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Truck, 
  Clock,
  AlertTriangle
} from "lucide-react";
import { useOrderAnalytics } from "@/hooks/api/useOrders";
import { useProducts } from "@/hooks/api/useProducts";
import { formatCurrency } from "@/utils/format";

interface DashboardStatsProps {
  floristId: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}

const StatCard = ({ title, value, description, icon, trend, loading }: StatCardProps) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="h-7 w-24 mt-1" />
        ) : (
          <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
        )}
      </div>
      <div className="p-2 bg-primary/10 rounded-full">
        {icon}
      </div>
    </div>
    <div className="mt-4">
      {loading ? (
        <Skeleton className="h-4 w-full" />
      ) : (
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className={trend >= 0 ? "text-green-500" : "text-red-500"}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  </Card>
);

export const DashboardStats = ({ floristId }: DashboardStatsProps) => {
  // Get order analytics for today
  const { data: todayStats, isLoading: loadingToday } = useOrderAnalytics(floristId, 'day');
  
  // Get order analytics for yesterday (for comparison)
  const { data: yesterdayStats, isLoading: loadingYesterday } = useOrderAnalytics(floristId, 'yesterday');
  
  // Get products count and low stock items
  const { data: products, isLoading: loadingProducts } = useProducts({
    floristId,
    includeOutOfStock: true
  });

  // Calculate trends
  const revenueTrend = todayStats && yesterdayStats
    ? ((todayStats.total_revenue - yesterdayStats.total_revenue) / yesterdayStats.total_revenue) * 100
    : undefined;

  const ordersTrend = todayStats && yesterdayStats
    ? ((todayStats.total_orders - yesterdayStats.total_orders) / yesterdayStats.total_orders) * 100
    : undefined;

  const lowStockCount = products?.filter(p => p.stockStatus === 'low_stock').length || 0;
  const outOfStockCount = products?.filter(p => p.stockStatus === 'out_of_stock').length || 0;

  const isLoading = loadingToday || loadingYesterday || loadingProducts;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Today's Revenue"
        value={formatCurrency(todayStats?.total_revenue || 0)}
        description={`${todayStats?.total_orders || 0} orders today`}
        icon={<DollarSign className="h-4 w-4 text-primary" />}
        trend={revenueTrend}
        loading={isLoading}
      />

      <StatCard
        title="Pending Orders"
        value={todayStats?.pending_orders || 0}
        description={`${todayStats?.delivery_orders || 0} for delivery`}
        icon={<ShoppingCart className="h-4 w-4 text-primary" />}
        loading={isLoading}
      />

      <StatCard
        title="Out for Delivery"
        value={todayStats?.delivery_orders || 0}
        description="Active deliveries"
        icon={<Truck className="h-4 w-4 text-primary" />}
        loading={isLoading}
      />

      <StatCard
        title="Inventory Alerts"
        value={lowStockCount + outOfStockCount}
        description={`${outOfStockCount} items out of stock`}
        icon={<AlertTriangle className="h-4 w-4 text-primary" />}
        loading={isLoading}
      />
    </div>
  );
};