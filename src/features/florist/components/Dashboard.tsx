import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/florist-dashboard/DashboardLayout";
import { SetupProgress } from "@/components/dashboard/SetupProgress";
import { StoreVisibility } from "@/components/florist-dashboard/StoreVisibility";
import { DashboardStats } from "@/components/florist-dashboard/DashboardStats";
import { RecentOrders } from "@/components/florist-dashboard/RecentOrders";
import { Feature } from "@/components/ui/feature-section-with-bento-grid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const FloristDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFloristProfile();
    }
  }, [user]);

  const loadFloristProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('florist_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to Florist Dashboard</h2>
        <p>Please complete your store setup to get started.</p>
        <Button 
          onClick={() => window.location.href = '/become-florist'}
          className="mt-4"
        >
          Complete Setup
        </Button>
      </div>
    );
  }

  if (profile.store_status === 'pending') {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Application Under Review</h2>
          <p>
            Thank you for submitting your application. Our team is currently reviewing your details.
            We'll notify you once your store is approved.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <Feature />
          
          {/* Header Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold mb-1">
                  Welcome back, {profile?.store_name || "New Florist"}
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your store today
                </p>
              </div>
              
              <SetupProgress floristId={user?.id} />
              
              {profile && (
                <StoreVisibility
                  storeId={user?.id}
                  initialStatus={profile?.store_status as "private" | "published"}
                  onStatusChange={() => {}}
                />
              )}
            </div>
          </div>

          {/* Stats Section */}
          <DashboardStats floristId={user?.id} />

          {/* Recent Orders Section */}
          <RecentOrders floristId={user?.id} />

          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{profile.store_name}</h2>
              <Button 
                variant={profile.store_status === 'active' ? 'default' : 'outline'}
              >
                {profile.store_status === 'active' ? 'Store Active' : 'Store Private'}
              </Button>
            </div>

            {profile.setup_progress < 100 && (
              <SetupProgress floristId={user?.id} />
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-medium mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/dashboard/products'}
                  >
                    Manage Products
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/dashboard/orders'}
                  >
                    View Orders
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/dashboard/settings'}
                  >
                    Store Settings
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium mb-4">Store Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Delivery Zone</div>
                    <div>{profile.delivery_distance_km}km radius</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Operating Hours</div>
                    <div>
                      {profile.operating_hours ? 
                        'Set up' : 
                        <Button 
                          variant="link" 
                          onClick={() => window.location.href = '/dashboard/settings'}
                        >
                          Set up operating hours
                        </Button>
                      }
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FloristDashboard;