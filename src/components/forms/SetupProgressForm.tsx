import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFloristProfile } from '@/hooks/useFloristProfile';

const SETUP_STEPS = [
  {
    id: 'store_details',
    title: 'Store Details',
    description: 'Add your store name and description',
    requiredFields: ['store_name', 'about_text'],
  },
  {
    id: 'address',
    title: 'Store Address',
    description: 'Set your store location for deliveries',
    requiredFields: ['address_details', 'location'],
  },
  {
    id: 'business_hours',
    title: 'Business Hours',
    description: 'Set your operating hours',
    requiredFields: ['business_hours'],
  },
  {
    id: 'delivery_settings',
    title: 'Delivery Settings',
    description: 'Configure your delivery zones and fees',
    requiredFields: ['delivery_settings'],
  },
  {
    id: 'delivery_slots',
    title: 'Delivery Slots',
    description: 'Set up your delivery time slots',
    requiredFields: ['delivery_slots'],
  },
  {
    id: 'contact_info',
    title: 'Contact Information',
    description: 'Add your contact details',
    requiredFields: ['contact_email', 'contact_phone'],
  },
  {
    id: 'social_links',
    title: 'Social Media',
    description: 'Link your social media accounts',
    requiredFields: ['social_links'],
    optional: true,
  },
] as const;

interface SetupProgressFormProps {
  onStepClick: (stepId: string) => void;
}

export function SetupProgressForm({ onStepClick }: SetupProgressFormProps) {
  const { toast } = useToast();
  const { profile, updateProfile, isLoading } = useFloristProfile();

  const isStepComplete = (step: typeof SETUP_STEPS[number]) => {
    if (!profile) return false;

    return step.requiredFields.every(field => {
      const value = profile[field as keyof typeof profile];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    });
  };

  const completedSteps = SETUP_STEPS.filter(isStepComplete);
  const progress = (completedSteps.length / SETUP_STEPS.length) * 100;
  const nextIncompleteStep = SETUP_STEPS.find(step => !isStepComplete(step));

  const handleActivateStore = async () => {
    if (!profile) return;

    const incompleteSteps = SETUP_STEPS.filter(step => !step.optional && !isStepComplete(step));
    
    if (incompleteSteps.length > 0) {
      toast({
        title: "Cannot Activate Store",
        description: "Please complete all required steps before activating your store.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfile({
        store_status: 'active',
        setup_completed_at: new Date().toISOString(),
      });

      toast({
        title: "Store Activated",
        description: "Your store is now live and visible to customers!",
      });
    } catch (error) {
      console.error('Error activating store:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to activate store",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Setup Progress</h3>
            <span className="text-sm text-muted-foreground">
              {completedSteps.length} of {SETUP_STEPS.length} steps completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Setup Steps */}
      <div className="space-y-4">
        {SETUP_STEPS.map((step, index) => {
          const isComplete = isStepComplete(step);
          const isCurrent = !isComplete && !SETUP_STEPS.slice(0, index).some(s => !isStepComplete(s));

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={cn(
                "w-full text-left",
                "p-4 rounded-lg border transition-colors duration-200",
                "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isCurrent && "border-primary",
                isComplete && "bg-primary/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className={cn(
                      "h-5 w-5",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "font-medium",
                      isComplete && "text-primary",
                      isCurrent && "text-primary"
                    )}>
                      {step.title}
                    </p>
                    {step.optional && (
                      <span className="text-xs text-muted-foreground">Optional</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Activation Button */}
      {profile?.store_status !== 'active' && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleActivateStore}
          disabled={isLoading || SETUP_STEPS.some(step => !step.optional && !isStepComplete(step))}
        >
          Activate Store
        </Button>
      )}
    </div>
  );
}
