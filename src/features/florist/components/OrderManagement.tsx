import { useState } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/api/useOrders";
import { OrderStatus, ORDER_STATUSES } from "@/types/order";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { 
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderManagementProps {
  floristId: string;
}

interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  deliveryType?: 'delivery' | 'pickup';
}

const ORDER_TABS = [
  { value: 'all', label: 'All Orders', icon: Package },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'processing', label: 'Processing', icon: Package },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export const OrderManagement = ({ floristId }: OrderManagementProps) => {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: orders, isLoading } = useOrders(floristId, {
    ...filters,
    status: activeTab !== 'all' ? activeTab as OrderStatus : undefined,
  });

  const updateOrderStatusMutation = useUpdateOrderStatus();

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    setFilters(prev => ({
      ...prev,
      startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
    }));
  };

  const handleDeliveryTypeChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      deliveryType: value as 'delivery' | 'pickup',
    }));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortedOrders = orders?.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search orders..."
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <DateRangePicker
            onChange={handleDateRangeChange}
            className="max-w-sm"
          />
          <Select onValueChange={handleDeliveryTypeChange}>
            <SelectTrigger className="max-w-[200px]">
              <SelectValue placeholder="Delivery Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="ml-auto"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {ORDER_TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center gap-2",
                  activeTab === tab.value && "bg-primary text-primary-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {orders && (
                  <span className="ml-auto">
                    {orders.filter(o => 
                      tab.value === 'all' ? true : o.status === tab.value
                    ).length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))
          ) : sortedOrders?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            sortedOrders?.map(order => (
              <OrderItem
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
};