import { supabase } from '@/integrations/supabase/client'
import type { ApplicationFormData } from '@/components/florist-application/FloristApplicationForm'
import { Database } from '@/types/database.types'

export async function processFloristApplication(applicationData: ApplicationFormData) {
  try {
    // 1. Create the application record
    const { data: application, error: applicationError } = await supabase
      .from('florist_applications')
      .insert({
        full_name: applicationData.full_name,
        email: applicationData.email,
        phone: applicationData.phone,
        store_name: applicationData.store_name,
        address_details: applicationData.address_details,
        about_business: applicationData.about_business,
        years_experience: applicationData.years_experience,
        website_url: applicationData.website_url,
        social_links: applicationData.social_links,
        specialties: applicationData.specialties,
        business_capabilities: applicationData.business_capabilities,
        status: 'pending'
      })
      .select()
      .single()

    if (applicationError) throw applicationError

    // 2. Notify admin of new application
    const { error: notificationError } = await supabase.functions.invoke('notify-florist-application', {
      body: {
        applicationId: application.id,
        type: 'new'
      }
    })

    if (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Continue processing as this is not critical
    }

    // 3. Create initial profile structure (pending approval)
    const { error: profileError } = await supabase
      .from('florist_profiles')
      .insert({
        store_name: applicationData.store_name,
        store_status: 'pending',
        about_text: applicationData.about_business,
        contact_email: applicationData.email,
        contact_phone: applicationData.phone,
        address_details: applicationData.address_details,
        website_url: applicationData.website_url,
        social_links: applicationData.social_links,
        business_settings: {
          delivery: {
            radius_km: 10,
            fee: 0,
            minimum_order: 0,
            same_day_cutoff: '14:00',
            next_day_cutoff_enabled: false
          },
          hours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '09:00', close: '17:00', closed: true }
          }
        },
        setup_progress: 0
      })

    if (profileError) throw profileError

    return { success: true, applicationId: application.id }

  } catch (error) {
    console.error('Error processing florist application:', error)
    throw new Error('Failed to process application')
  }
}

// Helper function to validate application data
export function validateApplicationData(data: ApplicationFormData) {
  const requiredFields = [
    'full_name',
    'email',
    'phone',
    'store_name',
    'address_details',
    'about_business'
  ] as const

  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }

  // Validate address details
  const requiredAddressFields = [
    'street_number',
    'street_name',
    'suburb',
    'state',
    'postcode'
  ] as const

  const missingAddressFields = requiredAddressFields.filter(
    field => !data.address_details[field]
  )

  if (missingAddressFields.length > 0) {
    throw new Error(`Missing required address fields: ${missingAddressFields.join(', ')}`)
  }

  return true
} 