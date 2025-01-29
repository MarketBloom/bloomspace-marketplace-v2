import { supabase } from '@/integrations/supabase/client'
import { validateApplication } from './validateApplication'
import type { Database } from '@/types/database.types'

interface ApprovalOptions {
  applicationId: string
  adminNotes?: string
  overrideValidation?: boolean
  commissionRate?: number
}

export async function approveFloristApplication({
  applicationId,
  adminNotes = '',
  overrideValidation = false,
  commissionRate = 10
}: ApprovalOptions) {
  try {
    // 1. Fetch application data
    const { data: application, error: fetchError } = await supabase
      .from('florist_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError) throw fetchError

    // 2. Validate application unless override is set
    if (!overrideValidation) {
      const validationResult = validateApplication(application)
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`)
      }
    }

    // 3. Begin transaction
    const { error: transactionError } = await supabase.rpc('approve_florist_application', {
      p_application_id: applicationId,
      p_admin_notes: adminNotes,
      p_commission_rate: commissionRate
    })

    if (transactionError) throw transactionError

    // 4. Send approval notification
    const { error: notificationError } = await supabase.functions.invoke('notify-florist-application', {
      body: {
        applicationId,
        type: 'approved'
      }
    })

    if (notificationError) {
      console.error('Failed to send approval notification:', notificationError)
      // Continue as this is not critical
    }

    return { success: true }

  } catch (error) {
    console.error('Error approving florist application:', error)
    throw new Error('Failed to approve application')
  }
} 