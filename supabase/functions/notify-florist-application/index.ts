import { createClient } from '@supabase/supabase-js'
import { Database } from '../_shared/database.types'
import { corsHeaders } from '../_shared/cors'

interface NotificationRequest {
  applicationId: string
  type: 'new' | 'approved' | 'rejected'
}

const EMAIL_TEMPLATES = {
  new: {
    subject: 'New Florist Application Received',
    html: (application: any) => `
      <h1>New Florist Application</h1>
      <p>Business Name: ${application.store_name}</p>
      <p>Applicant: ${application.full_name}</p>
      <p>Email: ${application.email}</p>
      <p>Phone: ${application.phone || 'Not provided'}</p>
      <p>Experience: ${application.years_experience} years</p>
      <p>About: ${application.about_business || 'Not provided'}</p>
      <p><a href="${Deno.env.get('ADMIN_URL')}/applications/${application.id}">View Application</a></p>
    `
  },
  approved: {
    subject: 'Welcome to Lovable Flowers - Your Application is Approved!',
    html: (application: any) => `
      <h1>Welcome to Lovable Flowers!</h1>
      <p>Dear ${application.full_name},</p>
      <p>We're excited to inform you that your application has been approved!</p>
      <p>You can now log in to your account and start setting up your store.</p>
      <p><a href="${Deno.env.get('FRONTEND_URL')}/login">Get Started</a></p>
    `
  },
  rejected: {
    subject: 'Update on Your Lovable Flowers Application',
    html: (application: any) => `
      <h1>Application Update</h1>
      <p>Dear ${application.full_name},</p>
      <p>Thank you for your interest in joining Lovable Flowers.</p>
      <p>After careful review, we regret to inform you that we cannot proceed with your application at this time.</p>
      <p>We wish you the best in your future endeavors.</p>
    `
  }
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

    const { applicationId, type } = await req.json() as NotificationRequest

    // Get the application details
    const { data: application, error: fetchError } = await supabaseClient
      .from('florist_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      throw new Error('Application not found')
    }

    const template = EMAIL_TEMPLATES[type]
    
    // Send email via the send-notification function
    const { error: emailError } = await supabaseClient.functions.invoke('send-notification', {
      body: {
        to: type === 'new' ? [Deno.env.get('ADMIN_EMAIL')] : [application.email],
        subject: template.subject,
        html: template.html(application)
      }
    })

    if (emailError) throw emailError

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