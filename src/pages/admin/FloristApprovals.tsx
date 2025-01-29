import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function FloristApprovals() {
  const [pendingFlorists, setPendingFlorists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPendingFlorists();
  }, []);

  const loadPendingFlorists = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('florist_profiles')
        .select('*')
        .eq('store_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingFlorists(data || []);
    } catch (error) {
      console.error('Error loading pending florists:', error);
      toast.error('Failed to load pending applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (floristId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('florist_profiles')
        .update({ 
          store_status: approved ? 'active' : 'rejected',
          setup_completed_at: approved ? new Date().toISOString() : null
        })
        .eq('id', floristId);

      if (error) throw error;

      toast.success(approved ? 'Florist approved successfully' : 'Application rejected');
      loadPendingFlorists();
    } catch (error) {
      console.error('Error updating florist status:', error);
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Pending Approvals</h2>

      {pendingFlorists.length === 0 ? (
        <Card className="p-6">
          <p>No pending applications</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingFlorists.map((florist) => (
            <Card key={florist.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{florist.store_name}</h3>
                  <p className="text-sm text-muted-foreground">{florist.street_address}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">Delivery Radius: {florist.delivery_distance_km}km</p>
                    <p className="text-sm">Phone: {florist.contact_phone}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleApproval(florist.id, false)}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproval(florist.id, true)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 