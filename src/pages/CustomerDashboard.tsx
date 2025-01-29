import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { FavoriteFlorists } from "@/components/dashboard/FavoriteFlorists";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { GiftCardSection } from "@/components/loyalty/GiftCardSection";
import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CustomerDashboard = () => {
  const { user } = useAuth();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['customer-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorite_florists')
        .select(`
          *,
          florist_profiles (
            id,
            store_name,
            address,
            about_text,
            banner_url,
            logo_url,
            delivery_fee,
            delivery_radius,
            minimum_order_amount
          )
        `)
        .eq('customer_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const activeOrders = orders?.filter(order => 
    ['pending', 'processing', 'ready'].includes(order.status)
  ).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="grid gap-8">
          <DashboardStats
            totalOrders={orders?.length || 0}
            activeOrders={activeOrders}
            favoritesCount={favorites?.length || 0}
          />
          
          <div className="grid gap-8 lg:grid-cols-2">
            <LoyaltyCard />
            <GiftCardSection />
          </div>
          
          <FavoriteFlorists
            favorites={favorites || []}
            isLoading={favoritesLoading}
          />
          <RecentOrders
            orders={orders || []}
            isLoading={ordersLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;