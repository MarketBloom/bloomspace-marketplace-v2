import { createClient } from '@supabase/supabase-js'
import { Database } from '../_shared/database.types'
import { corsHeaders } from '../_shared/cors'

interface UpdateProfileToFloristParams {
  profile_id: string;
  store_name: string;
  phone_number: string;
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

    const { profile_id, store_name, phone_number } = await req.json() as UpdateProfileToFloristParams

    // First update the profile role to florist
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        role: 'florist',
        phone: phone_number 
      })
      .eq('id', profile_id)

    if (profileError) throw profileError

    // Then create the florist profile with proper structure
    const { error: floristError } = await supabaseClient
      .from('florist_profiles')
      .insert({
        user_id: profile_id,
        store_name,
        store_status: 'pending',
        contact_phone: phone_number,
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
        }
      })

    if (floristError) throw floristError

    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})