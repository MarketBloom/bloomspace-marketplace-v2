import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AddFloristProductsParams {
  florist_id: string;
}

const SAMPLE_PRODUCTS = [
  {
    title: 'Spring Bouquet',
    description: 'A beautiful arrangement of seasonal spring flowers',
    price: 89.99,
    category: 'bouquet',
    occasion: ['birthday', 'congratulations'],
    images: ['https://example.com/spring-bouquet.jpg']
  },
  {
    title: 'Rose Bundle',
    description: 'Classic red roses, perfect for any romantic occasion',
    price: 129.99,
    category: 'roses',
    occasion: ['anniversary', 'valentine'],
    images: ['https://example.com/rose-bundle.jpg']
  },
  {
    title: 'Sympathy Arrangement',
    description: 'A thoughtful arrangement for difficult times',
    price: 149.99,
    category: 'arrangement',
    occasion: ['sympathy'],
    images: ['https://example.com/sympathy.jpg']
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { florist_id } = await req.json() as AddFloristProductsParams

    // Add sample products for the florist
    const productsToInsert = SAMPLE_PRODUCTS.map(product => ({
      ...product,
      florist_id
    }))

    const { error } = await supabaseClient
      .from('products')
      .insert(productsToInsert)

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})