import { createClient } from '@supabase/supabase-js'
import { Database } from '../_shared/database.types'
import { corsHeaders } from '../_shared/cors'

interface FloristData {
  email: string;
  password: string;
  storeName: string;
  phone: string;
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

    const { florists } = await req.json() as { florists: FloristData[] }
    const createdFlorists = []

    for (const florist of florists) {
      // 1. Create auth user
      const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
        email: florist.email,
        password: florist.password,
        email_confirm: true,
        user_metadata: {
          full_name: florist.storeName,
          role: 'florist'
        }
      })

      if (userError) throw userError

      if (userData.user) {
        // 2. Create base profile
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .insert({
            id: userData.user.id,
            email: florist.email,
            full_name: florist.storeName,
            phone: florist.phone,
            role: 'florist'
          })

        if (profileError) throw profileError

        // 3. Create florist profile with proper structure
        const { error: floristError } = await supabaseClient
          .from('florist_profiles')
          .insert({
            user_id: userData.user.id,
            store_name: florist.storeName,
            store_status: 'active',
            contact_email: florist.email,
            contact_phone: florist.phone,
            about_text: 'A lovely local florist.',
            address_details: {
              street_number: '123',
              street_name: 'Example St',
              suburb: 'Sydney',
              state: 'NSW',
              postcode: '2000'
            },
            business_settings: {
              delivery: {
                radius_km: 10,
                fee: 10,
                minimum_order: 50,
                same_day_cutoff: '14:00',
                next_day_cutoff_enabled: false,
                next_day_cutoff: null
              },
              hours: {
                monday: { open: '09:00', close: '17:00', closed: false },
                tuesday: { open: '09:00', close: '17:00', closed: false },
                wednesday: { open: '09:00', close: '17:00', closed: false },
                thursday: { open: '09:00', close: '17:00', closed: false },
                friday: { open: '09:00', close: '17:00', closed: false },
                saturday: { open: '09:00', close: '17:00', closed: false },
                sunday: { open: '09:00', close: '17:00', closed: true }
              },
              delivery_slots: {
                weekdays: {
                  slots: [
                    { name: 'morning', start: '09:00', end: '12:00', enabled: true },
                    { name: 'afternoon', start: '12:00', end: '15:00', enabled: true },
                    { name: 'evening', start: '15:00', end: '18:00', enabled: true }
                  ]
                },
                weekends: {
                  slots: [
                    { name: 'morning', start: '10:00', end: '13:00', enabled: true },
                    { name: 'afternoon', start: '13:00', end: '16:00', enabled: true }
                  ]
                }
              }
            }
          })

        if (floristError) throw floristError

        // 4. Add sample products
        const sampleProducts = [
          {
            title: 'Spring Bouquet',
            description: 'A beautiful arrangement of seasonal spring flowers',
            price: 89.99,
            category: 'bouquet',
            occasion: ['birthday', 'congratulations'],
            florist_id: userData.user.id,
            status: 'active'
          },
          {
            title: 'Rose Bundle',
            description: 'Classic red roses, perfect for any romantic occasion',
            price: 129.99,
            category: 'roses',
            occasion: ['anniversary', 'valentine'],
            florist_id: userData.user.id,
            status: 'active'
          }
        ]

        const { error: productsError } = await supabaseClient
          .from('products')
          .insert(sampleProducts)

        if (productsError) throw productsError

        createdFlorists.push(florist.storeName)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        created: createdFlorists 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )

  } catch (error: any) {
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