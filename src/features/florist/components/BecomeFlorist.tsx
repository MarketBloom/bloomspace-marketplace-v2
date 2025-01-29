import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Header } from '@/components/Header'
import { StoreDetailsForm } from '@/components/become-florist/StoreDetailsForm'
import { DeliverySettingsForm } from '@/components/become-florist/DeliverySettingsForm'
import { ImageUploadForm } from '@/components/become-florist/ImageUploadForm'
import { OperatingHoursForm } from '@/components/become-florist/OperatingHoursForm'
import { StepIndicator } from '@/components/become-florist/StepIndicator'
import { Button } from '@/components/ui/button'
import { ProductSetupForm } from '@/components/become-florist/ProductSetupForm'

interface FloristProfileData {
  id: string
  store_name: string
  street_address: string
  about_text: string
  suburb: string | null
  state: string | null
  postcode: string | null
  operating_hours: string | null
  delivery_cutoff: string | null
  delivery_start_time: string
  delivery_end_time: string
  delivery_slot_duration: string
  logo_url: string | null
  banner_url: string | null
  social_links: {
    website?: string
    facebook?: string
    instagram?: string
  } | null
  delivery_fee: number
  delivery_radius: number
  minimum_order_amount: number
  store_status: 'draft' | 'pending' | 'approved' | 'rejected'
  delivery_days: string[]
  pickup_only_days: string | null
  delivery_cutoff_times: Record<string, string>
  same_day_enabled: boolean
  delivery_time_frames: Record<string, boolean>
  coordinates: {
    lat: number
    lng: number
  } | null
  geocoded_address: string | null
  delivery_distance_km: number
  setup_progress: number
}

export default function BecomeFlorist() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FloristProfileData>({
    id: user?.id || '',
    store_name: '',
    street_address: '',
    about_text: '',
    suburb: null,
    state: null,
    postcode: null,
    operating_hours: null,
    delivery_cutoff: null,
    delivery_start_time: '09:00',
    delivery_end_time: '17:00',
    delivery_slot_duration: '00:30:00',
    logo_url: null,
    banner_url: null,
    social_links: null,
    delivery_fee: 0,
    delivery_radius: 5,
    minimum_order_amount: 0,
    store_status: 'draft',
    delivery_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    pickup_only_days: null,
    delivery_cutoff_times: {},
    same_day_enabled: false,
    delivery_time_frames: {
      morning: false,
      midday: false,
      afternoon: false
    },
    coordinates: null,
    geocoded_address: null,
    delivery_distance_km: 5,
    setup_progress: 0
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signup?redirect=/become-florist')
    }
  }, [user, navigate])

  // Load existing draft if available
  useEffect(() => {
    const loadDraft = async () => {
      if (!user?.id) return
      
      const { data, error } = await supabase
        .from('florist_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading draft:', error)
        return
      }

      if (data) {
        setFormData(data)
        // Calculate which step to start from based on setup_progress
        const progress = data.setup_progress
        if (progress >= 100) {
          navigate('/dashboard')
        } else {
          setCurrentStep(Math.floor((progress / 100) * steps.length) + 1)
        }
      }
    }

    loadDraft()
  }, [user, navigate])

  const steps = [
    'Store Details',
    'Location & Hours',
    'Delivery Settings',
    'Store Images',
    'Add Products',
    'Review'
  ]

  const handleSaveDraft = async () => {
    try {
      const progress = Math.min(((currentStep - 1) / steps.length) * 100, 95)
      const { error } = await supabase
        .from('florist_profiles')
        .upsert({
          ...formData,
          store_status: 'draft',
          setup_progress: progress,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Progress saved!')
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save progress')
    }
  }

  const handleSubmitForReview = async () => {
    try {
      const { error } = await supabase
        .from('florist_profiles')
        .update({
          ...formData,
          store_status: 'pending',
          setup_progress: 100,
          setup_completed_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Your store has been submitted for review!')
      navigate('/dashboard/pending-approval')
    } catch (error) {
      console.error('Error submitting for review:', error)
      toast.error('Failed to submit store for review')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StoreDetailsForm
            data={formData}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            onNext={() => setCurrentStep(2)}
          />
        )
      case 2:
        return (
          <OperatingHoursForm
            data={formData}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )
      case 3:
        return (
          <DeliverySettingsForm
            data={formData}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )
      case 4:
        return (
          <ImageUploadForm
            data={formData}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )
      case 5:
        return (
          <ProductSetupForm
            data={formData}
            onUpdate={(data) => setFormData({ ...formData, ...data })}
            onNext={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
          />
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="prose max-w-none">
              <h3>Review Your Store</h3>
              <p>
                Please review all your store details before submitting for approval.
                You can go back to any section to make changes.
              </p>
              {/* Add a summary of all the store details here */}
            </div>
            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(5)}>
                Back
              </Button>
              <Button onClick={handleSubmitForReview} variant="default">
                Submit for Review
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
              Set Up Your Store
            </h1>
            <div className="flex justify-between items-center mb-6">
              <StepIndicator steps={steps} currentStep={currentStep} />
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              {renderStep()}
            </form>
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              {currentStep < steps.length && (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}