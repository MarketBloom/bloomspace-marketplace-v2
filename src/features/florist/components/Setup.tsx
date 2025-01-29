import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';

export function SetupProgress({ floristId }: { floristId: string }) {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSetup = async () => {
      const { data: profile } = await supabase
        .from('florist_profiles')
        .select('*')
        .eq('id', floristId)
        .single();

      if (profile) {
        let setupPoints = 0;
        
        // Check required fields
        if (profile.store_name) setupPoints += 20;
        if (profile.street_address) setupPoints += 20;
        if (profile.operating_hours) setupPoints += 20;
        if (profile.logo_url && profile.banner_url) setupPoints += 20;
        if (profile.delivery_radius && profile.delivery_fee !== null) setupPoints += 20;

        setProgress(setupPoints);
      }
    };

    checkSetup();
  }, [floristId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Store Setup Progress</h3>
      <Progress value={progress} className="w-full" />
      
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate('/dashboard/store-setup')}
          variant={progress === 100 ? 'outline' : 'default'}
        >
          {progress === 100 ? 'Edit Setup' : 'Continue Setup'}
        </Button>
        
        <Button
          onClick={() => navigate('/dashboard/products')}
          variant="outline"
        >
          Manage Products
        </Button>
      </div>
    </div>
  );
} 