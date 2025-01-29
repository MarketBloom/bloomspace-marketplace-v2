import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingApplications: 0,
    totalFlorists: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: pendingApplications },
        { count: totalFlorists },
        { count: totalOrders },
        { count: totalCustomers },
      ] = await Promise.all([
        supabase
          .from("florist_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("florist_profiles")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "customer"),
      ]);

      setStats({
        pendingApplications: pendingApplications || 0,
        totalFlorists: totalFlorists || 0,
        totalOrders: totalOrders || 0,
        totalCustomers: totalCustomers || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout currentPage="Dashboard">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending Applications
          </h3>
          <p className="text-2xl font-bold mt-2">{stats.pendingApplications}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Florists
          </h3>
          <p className="text-2xl font-bold mt-2">{stats.totalFlorists}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Orders
          </h3>
          <p className="text-2xl font-bold mt-2">{stats.totalOrders}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Customers
          </h3>
          <p className="text-2xl font-bold mt-2">{stats.totalCustomers}</p>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;