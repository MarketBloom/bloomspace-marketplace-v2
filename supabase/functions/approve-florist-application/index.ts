import { createClient } from '@supabase/supabase-js'
import { Database } from '../_shared/database.types'
import { corsHeaders } from '../_shared/cors'

interface ApprovalRequest {
  applicationId: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { applicationId } = await req.json() as ApprovalRequest

    // 1. Get the application details
    const { data: application, error: fetchError } = await supabaseClient
      .from('florist_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      throw new Error('Application not found')
    }

    // 2. Create auth user and profile
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: application.email,
      email_confirm: true,
      password: crypto.randomUUID(),
      user_metadata: {
        full_name: application.full_name,
        role: 'florist'
      }
    })

    if (authError) throw authError

    // 3. Create base profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: application.email,
        full_name: application.full_name,
        phone: application.phone,
        role: 'florist'
      })

    if (profileError) throw profileError

    // 4. Create florist profile with proper types
    const { error: floristError } = await supabaseClient
      .from('florist_profiles')
      .insert({
        user_id: authData.user.id,
        store_name: application.store_name,
        store_status: 'pending',
        about_text: application.about_business,
        contact_email: application.email,
        contact_phone: application.phone || '',
        address_details: {
          street_number: '',
          street_name: '',
          suburb: '',
          state: '',
          postcode: ''
        },
        business_settings: {
          delivery: {
            radius_km: 10,
            fee: 0,
            minimum_order: 0,
            same_day_cutoff: '14:00'
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
        }
      })

    if (floristError) throw floristError

    // 5. Update application status
    const { error: updateError } = await supabaseClient
      .from('florist_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})