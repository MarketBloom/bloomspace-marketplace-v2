import { supabase } from '@/integrations/supabase/client'

interface RejectionReason {
  code: string
  description: string
}

export const REJECTION_REASONS = {
  INCOMPLETE_INFO: {
    code: 'INCOMPLETE_INFO',
    description: 'Application information is incomplete or incorrect'
  },
  INSUFFICIENT_EXPERIENCE: {
    code: 'INSUFFICIENT_EXPERIENCE',
    description: 'Does not meet minimum experience requirements'
  },
  LOCATION_COVERAGE: {
    code: 'LOCATION_COVERAGE',
    description: 'Location not currently supported'
  },
  BUSINESS_VERIFICATION: {
    code: 'BUSINESS_VERIFICATION',
    description: 'Unable to verify business details'
  },
  OTHER: {
    code: 'OTHER',
    description: 'Other reason - see notes'
  }
} as const

interface RejectOptions {
  applicationId: string
  reason: keyof typeof REJECTION_REASONS
  adminNotes: string
  canReapply?: boolean
  reapplyAfterDays?: number
}

export async function rejectFloristApplication({
  applicationId,
  reason,
  adminNotes,
  canReapply = true,
  reapplyAfterDays = 30
}: RejectOptions) {
  try {
    const { error } = await supabase
      .from('florist_applications')
      .update({
        status: 'rejected',
        rejection_reason: REJECTION_REASONS[reason].code,
        admin_notes: adminNotes,
        can_reapply: canReapply,
        reapply_after: canReapply 
          ? new Date(Date.now() + reapplyAfterDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (error) throw error

    // Send rejection notification
    await supabase.functions.invoke('notify-florist-application', {
      body: {
        applicationId,
        type: 'rejected',
        reason: REJECTION_REASONS[reason].description,
        notes: adminNotes,
        canReapply,
        reapplyAfter: reapplyAfterDays
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error rejecting application:', error)
    throw new Error('Failed to reject application')
  }
} 