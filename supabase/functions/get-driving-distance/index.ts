import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Loading get-driving-distance function...")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { origin, destination } = await req.json()
    
    console.log("Request received:", { origin, destination })

    if (!origin || !destination) {
      console.error("Missing required parameters:", { origin, destination })
      return new Response(
        JSON.stringify({ error: "Missing origin or destination coordinates" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const apiKey = Deno.env.get('HERE_API_KEY')
    if (!apiKey) {
      console.error("HERE API key not configured")
      return new Response(
        JSON.stringify({ error: "HERE API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    // Format coordinates properly for HERE API
    const originStr = `${origin.lat},${origin.lng}`
    const destinationStr = `${destination.lat},${destination.lng}`

    console.log("Making request to HERE API with coordinates:", {
      origin: originStr,
      destination: destinationStr
    })

    // Using the newer v8 Routing API
    const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${originStr}&destination=${destinationStr}&return=summary&apiKey=${apiKey}`
    
    console.log("Request URL (without API key):", url.replace(apiKey, 'API_KEY'))
    const response = await fetch(url)
    const data = await response.json()

    console.log("HERE API response:", data)

    if (data.status === 400 || data.status === 401) {
      console.error("HERE API request failed:", data.title || data.error_message)
      return new Response(
        JSON.stringify({ 
          error: "HERE API request failed", 
          details: data.title || data.error_message 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    if (!data.routes?.[0]?.sections?.[0]?.summary?.length) {
      console.error("Invalid response from HERE API:", data)
      return new Response(
        JSON.stringify({ 
          error: "Invalid response from HERE API", 
          details: data 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const distance = data.routes[0].sections[0].summary.length / 1000 // Convert to km
    console.log("Calculated distance:", distance, "km")
    
    return new Response(
      JSON.stringify({ distance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error in get-driving-distance:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})