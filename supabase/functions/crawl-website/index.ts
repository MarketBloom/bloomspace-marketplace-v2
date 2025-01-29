import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, floristId } = await req.json()
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY')

    if (!apiKey) {
      console.error('Firecrawl API key not configured')
      throw new Error('API configuration error')
    }

    console.log('Starting crawl for URL:', url)

    // Validate and format URL
    let formattedUrl: string
    try {
      const urlObj = new URL(url)
      // Remove any trailing slashes and ensure proper protocol
      formattedUrl = urlObj.toString().replace(/\/$/, '')
      
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol')
      }

      console.log('Formatted URL:', formattedUrl)
    } catch (error) {
      console.error('URL validation error:', error)
      throw new Error('Invalid URL format')
    }

    // First try to fetch the URL to validate it's accessible
    try {
      const testResponse = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FirecrawlBot/1.0)'
        }
      })
      
      if (!testResponse.ok) {
        throw new Error(`URL returned status ${testResponse.status}`)
      }
      
      console.log('URL validation successful')
    } catch (error) {
      console.error('URL accessibility error:', error)
      throw new Error('Website is not accessible')
    }

    // Prepare the request body
    const requestBody = {
      url: formattedUrl,
      limit: 1,
      scrapeOptions: {
        formats: ['html'],
        selectors: {
          title: 'h1, title',
          description: 'meta[name="description"]',
          products: '.product'
        }
      }
    }

    console.log('Making request to Firecrawl API with body:', JSON.stringify(requestBody))
    
    // Make the request to Firecrawl API
    const response = await fetch('https://api.firecrawl.com/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FirecrawlBot/1.0)'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Firecrawl API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Firecrawl API error response:', errorText)
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Firecrawl API success response:', JSON.stringify(data, null, 2))

    return new Response(
      JSON.stringify({
        crawlResult: {
          success: true,
          status: 'completed',
          data: {
            url: formattedUrl,
            crawledAt: new Date().toISOString(),
            content: data
          }
        }
      }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error in crawl-website function:', error)
    return new Response(
      JSON.stringify({
        crawlResult: {
          success: false,
          status: 'error',
          error: error.message || 'Failed to crawl website',
          details: {
            timestamp: new Date().toISOString(),
            errorType: error.name,
            message: error.message,
            stack: error.stack
          }
        }
      }),
      { headers: corsHeaders }
    )
  }
})