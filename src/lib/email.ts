import { Resend } from 'resend'
import { db, siteSettings } from '@/db'
import { eq } from 'drizzle-orm'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender - using Resend's test domain for development
// In production, use your verified domain: 'Yayasan Insan Prihatin <noreply@insanprihatin.org>'
const DEFAULT_FROM = process.env.EMAIL_FROM || 'Yayasan Insan Prihatin <onboarding@resend.dev>'

interface ContactSubmission {
  id?: string
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  reason?: string
}

/**
 * Get a site setting value by key
 */
async function getSettingValue(key: string): Promise<unknown> {
  try {
    const setting = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.key, key),
    })
    return setting?.value
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error)
    return null
  }
}

/**
 * Send contact form notification email to admin
 */
export async function sendContactNotificationEmail(
  submission: ContactSubmission
): Promise<EmailResult> {
  // Check if email notifications are enabled
  const emailEnabled = await getSettingValue('emailNotificationsEnabled')
  if (emailEnabled === false) {
    console.log('Email notifications are disabled')
    return { success: false, reason: 'disabled' }
  }

  // Get notification email recipient
  const notificationEmail = await getSettingValue('notificationEmail')
  if (!notificationEmail || typeof notificationEmail !== 'string') {
    console.log('No notification email configured')
    return { success: false, reason: 'no_recipient' }
  }

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, reason: 'no_api_key' }
  }

  try {
    const inquiryTypeLabels: Record<string, string> = {
      general: 'General Inquiry',
      donation: 'Donation Question',
      volunteer: 'Volunteering',
      partnership: 'Partnership Opportunity',
      media: 'Media Inquiry',
      other: 'Other',
    }

    const subjectLabel = inquiryTypeLabels[submission.subject] || submission.subject

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: notificationEmail,
      replyTo: submission.email,
      subject: `New Contact Form Submission: ${subjectLabel}`,
      html: generateContactEmailHtml(submission, subjectLabel),
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Failed to send contact notification email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(toEmail: string): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, reason: 'no_api_key' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: toEmail,
      subject: 'Test Email from Yayasan Insan Prihatin',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Test Email Successful!</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              This is a test email from Yayasan Insan Prihatin's contact form notification system.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              If you're receiving this email, your email configuration is working correctly!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Sent from Yayasan Insan Prihatin Admin Panel
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Test email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Failed to send test email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate HTML email content for contact notifications
 */
function generateContactEmailHtml(
  submission: ContactSubmission,
  subjectLabel: string
): string {
  const submissionTime = new Date().toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
        New Contact Form Submission
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
        ${submissionTime}
      </p>
    </div>

    <!-- Content -->
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
      <!-- Inquiry Type Badge -->
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; background: #f0fdfa; color: #0d9488; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
          ${subjectLabel}
        </span>
      </div>

      <!-- Sender Info -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; font-size: 16px; margin: 0 0 15px; font-weight: 600;">
          Contact Information
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Name:</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${escapeHtml(submission.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${escapeHtml(submission.email)}" style="color: #0d9488; text-decoration: none; font-size: 14px;">
                ${escapeHtml(submission.email)}
              </a>
            </td>
          </tr>
          ${submission.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Phone:</td>
            <td style="padding: 8px 0;">
              <a href="tel:${escapeHtml(submission.phone)}" style="color: #0d9488; text-decoration: none; font-size: 14px;">
                ${escapeHtml(submission.phone)}
              </a>
            </td>
          </tr>
          ` : ''}
        </table>
      </div>

      <!-- Message -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #1f2937; font-size: 16px; margin: 0 0 15px; font-weight: 600;">
          Message
        </h2>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; border-left: 4px solid #0d9488;">
          <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${escapeHtml(submission.message)}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="text-align: center; margin-top: 30px;">
        <a href="mailto:${escapeHtml(submission.email)}?subject=Re: ${encodeURIComponent(subjectLabel)}"
           style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
          Reply to ${escapeHtml(submission.name.split(' ')[0])}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 20px; text-align: center; border-radius: 0 0 12px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        This email was sent from the contact form on<br>
        <a href="https://insanprihatin.org" style="color: #0d9488; text-decoration: none;">
          insanprihatin.org
        </a>
      </p>
      ${submission.id ? `
      <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0;">
        Reference ID: ${submission.id}
      </p>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char])
}
