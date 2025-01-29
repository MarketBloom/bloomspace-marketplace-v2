import { useEffect, useState } from 'react';
import { useFloristProfile } from '@/hooks/useFloristProfile';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessHoursForm } from '@/components/forms/BusinessHoursForm';
import { ProfileDetailsForm } from '@/components/forms/ProfileDetailsForm';
import { DeliverySettingsForm } from '@/components/forms/DeliverySettingsForm';
import { DeliverySlotsForm } from '@/components/forms/DeliverySlotsForm';
import { SocialLinksForm } from '@/components/forms/SocialLinksForm';
import { SetupProgressForm } from '@/components/forms/SetupProgressForm';
import { DashboardLayout } from '@/components/florist-dashboard/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { useConfirmDialog } from '@/hooks/useConfirmDialog.tsx';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { 
  FloristProfile, 
  BusinessHoursJson, 
  DeliverySettingsJson,
  DeliverySlotsJson
} from '@/types/florist';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

function FormErrorFallback({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 rounded-md bg-destructive/10 text-destructive">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-semibold">Something went wrong</h3>
      </div>
      <p className="text-sm mb-4">{error.message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={resetErrorBoundary}
      >
        Try again
      </Button>
    </div>
  );
}

export function StoreManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState('setup');

  const { profile, updateProfile, isLoading, error } = useFloristProfile(user?.id);

  useEffect(() => {
    if (error) {
      console.error('StoreManagement - Profile Error:', error);
      toast({
        title: "Error Loading Profile",
        description: error instanceof Error ? error.message : 'Failed to load profile',
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleProfileUpdate = async (
    section: string, 
    data: Partial<FloristProfile>
  ) => {
    try {
      console.log(`Updating ${section} with data:`, data);
      await updateProfile(data);
      toast({
        title: `${section} Updated`,
        description: `Your ${section.toLowerCase()} has been updated successfully.`,
      });
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${section.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSetupStepClick = (stepId: string) => {
    switch (stepId) {
      case 'store_details':
        setActiveTab('profile');
        break;
      case 'business_hours':
        setActiveTab('hours');
        break;
      case 'delivery_settings':
        setActiveTab('delivery');
        break;
      case 'delivery_slots':
        setActiveTab('slots');
        break;
      case 'social_links':
        setActiveTab('social');
        break;
      default:
        setActiveTab('profile');
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Please sign in to manage your store</h2>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Setup Progress */}
          <div className="md:col-span-1">
            <ErrorBoundary FallbackComponent={FormErrorFallback}>
              <SetupProgressForm onStepClick={handleSetupStepClick} />
            </ErrorBoundary>
          </div>

          {/* Forms */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="setup">Setup Progress</TabsTrigger>
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="hours">Business Hours</TabsTrigger>
                <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
                <TabsTrigger value="slots">Delivery Slots</TabsTrigger>
                <TabsTrigger value="social">Social Links</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card className="p-6">
                  <ErrorBoundary FallbackComponent={FormErrorFallback}>
                    <ProfileDetailsForm
                      profile={profile}
                      onSubmit={async (data) => handleProfileUpdate('Profile Details', data)}
                    />
                  </ErrorBoundary>
                </Card>
              </TabsContent>

              <TabsContent value="hours" className="space-y-4">
                <Card className="p-6">
                  <ErrorBoundary FallbackComponent={FormErrorFallback}>
                    <BusinessHoursForm
                      initialData={profile?.business_hours}
                      onSubmit={async (hours: BusinessHoursJson) => {
                        const update: Partial<FloristProfile> = {
                          business_hours: hours
                        };
                        await handleProfileUpdate('Business Hours', update);
                      }}
                    />
                  </ErrorBoundary>
                </Card>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4">
                <Card className="p-6">
                  <ErrorBoundary FallbackComponent={FormErrorFallback}>
                    <DeliverySettingsForm
                      initialData={profile?.delivery_settings}
                      onSubmit={async (settings: DeliverySettingsJson) => {
                        const update: Partial<FloristProfile> = {
                          delivery_settings: settings
                        };
                        await handleProfileUpdate('Delivery Settings', update);
                      }}
                    />
                  </ErrorBoundary>
                </Card>
              </TabsContent>

              <TabsContent value="slots" className="space-y-4">
                <Card className="p-6">
                  <ErrorBoundary FallbackComponent={FormErrorFallback}>
                    <DeliverySlotsForm
                      initialData={profile?.delivery_slots}
                      onSubmit={async (slots: DeliverySlotsJson) => {
                        const update: Partial<FloristProfile> = {
                          delivery_slots: slots
                        };
                        await handleProfileUpdate('Delivery Slots', update);
                      }}
                    />
                  </ErrorBoundary>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <Card className="p-6">
                  <ErrorBoundary FallbackComponent={FormErrorFallback}>
                    <SocialLinksForm
                      initialData={profile?.social_links}
                      onSubmit={async (links) => {
                        const update: Partial<FloristProfile> = {
                          social_links: links
                        };
                        await handleProfileUpdate('Social Links', update);
                      }}
                    />
                  </ErrorBoundary>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default StoreManagement;