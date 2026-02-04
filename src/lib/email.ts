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

interface FormField {
  id: string
  type: string
  label: string
  options?: string[]
}

interface FormNotificationData {
  formName: string
  formTitle: string
  fields: FormField[]
  data: Record<string, unknown>
  sourceUrl?: string
  sourceContentTitle?: string
  notificationEmail?: string
}

/**
 * Send form submission notification email to admin
 */
export async function sendFormNotificationEmail(
  notification: FormNotificationData
): Promise<EmailResult> {
  // Check if email notifications are enabled
  const emailEnabled = await getSettingValue('emailNotificationsEnabled')
  if (emailEnabled === false) {
    console.log('Email notifications are disabled')
    return { success: false, reason: 'disabled' }
  }

  // Get notification email recipient (use form-specific email or global setting)
  let recipientEmail = notification.notificationEmail
  if (!recipientEmail) {
    const globalEmail = await getSettingValue('notificationEmail')
    if (globalEmail && typeof globalEmail === 'string') {
      recipientEmail = globalEmail
    }
  }

  if (!recipientEmail) {
    console.log('No notification email configured')
    return { success: false, reason: 'no_recipient' }
  }

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, reason: 'no_api_key' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: recipientEmail,
      subject: `New Form Submission: ${notification.formTitle}`,
      html: generateFormEmailHtml(notification),
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    console.log('Form notification email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Failed to send form notification email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate HTML email content for form notifications
 */
function generateFormEmailHtml(notification: FormNotificationData): string {
  const submissionTime = new Date().toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  // Build fields table
  const fieldsHtml = notification.fields
    .map((field) => {
      let value = notification.data[field.id]

      // Handle checkbox fields (multiple values)
      if (field.type === 'checkbox' && field.options) {
        const selectedOptions = field.options.filter((_, i) =>
          notification.data[`${field.id}_${i}`]
        )
        value = selectedOptions.length > 0 ? selectedOptions.join(', ') : 'None selected'
      }

      // Handle empty values
      if (value === undefined || value === null || value === '') {
        value = '-'
      }

      return `
        <tr>
          <td style="padding: 12px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb; width: 35%; vertical-align: top;">
            ${escapeHtml(field.label)}
          </td>
          <td style="padding: 12px; color: #1f2937; font-size: 14px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">
            ${escapeHtml(String(value))}
          </td>
        </tr>
      `
    })
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
        New Form Submission
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
        ${submissionTime}
      </p>
    </div>

    <!-- Content -->
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
      <!-- Form Name Badge -->
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; background: #f0fdfa; color: #0d9488; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
          ${escapeHtml(notification.formTitle)}
        </span>
        ${notification.sourceContentTitle ? `
        <span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; margin-left: 8px;">
          from: ${escapeHtml(notification.sourceContentTitle)}
        </span>
        ` : ''}
      </div>

      <!-- Submission Data -->
      <div style="background: #f9fafb; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${fieldsHtml}
        </table>
      </div>

      ${notification.sourceUrl ? `
      <!-- Source URL -->
      <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Submitted from: <a href="${escapeHtml(notification.sourceUrl)}" style="color: #0d9488; text-decoration: none;">${escapeHtml(notification.sourceUrl)}</a>
        </p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="padding: 20px; text-align: center; border-radius: 0 0 12px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        This email was sent from a form on<br>
        <a href="https://insanprihatin.org" style="color: #0d9488; text-decoration: none;">
          insanprihatin.org
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ============================================
// DONATION RECEIPT EMAIL
// ============================================

import { type OrganizationConfig, getDefaultOrganizationConfig } from './organization-config'

interface DonationReceiptData {
  receiptNumber: string
  donorName: string
  donorEmail: string
  amount: number
  currency: string
  projectTitle?: string
  paymentReference: string
  completedAt: Date
  pdfBuffer?: Buffer
  organization?: OrganizationConfig
}

/**
 * Send donation receipt email with PDF attachment
 */
export async function sendDonationReceiptEmail(
  data: DonationReceiptData
): Promise<EmailResult> {
  console.log('========== SENDING DONATION RECEIPT EMAIL ==========')
  console.log('Receipt Number:', data.receiptNumber)
  console.log('Donor Email:', data.donorEmail)
  console.log('Amount:', data.amount, data.currency)
  console.log('Has PDF:', !!data.pdfBuffer)

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured!')
    console.error('Please add RESEND_API_KEY to your .env.local file')
    console.error('Get your API key from: https://resend.com/api-keys')
    return { success: false, reason: 'no_api_key', error: 'RESEND_API_KEY is not configured. Please add it to your environment variables.' }
  }

  // Check if using test domain
  const isTestDomain = DEFAULT_FROM.includes('@resend.dev')
  if (isTestDomain) {
    console.warn('⚠️ Using Resend test domain (onboarding@resend.dev)')
    console.warn('⚠️ Emails can only be sent to the Resend account owner email')
    console.warn('⚠️ To send to any email, verify your domain at: https://resend.com/domains')
  }

  if (!data.donorEmail) {
    console.error('❌ No donor email provided')
    return { success: false, reason: 'no_recipient', error: 'No donor email address provided' }
  }

  try {
    const formattedAmount = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: data.currency || 'MYR',
    }).format(data.amount)

    console.log('Preparing email...')
    console.log('From:', DEFAULT_FROM)
    console.log('To:', data.donorEmail)

    const emailOptions: {
      from: string
      to: string
      subject: string
      html: string
      attachments?: Array<{
        filename: string
        content: Buffer
        contentType: string
      }>
    } = {
      from: DEFAULT_FROM,
      to: data.donorEmail,
      subject: `Thank You for Your Donation - Receipt ${data.receiptNumber}`,
      html: generateDonationReceiptEmailHtml(data, formattedAmount),
    }

    // Add PDF attachment if provided
    if (data.pdfBuffer) {
      console.log('Adding PDF attachment:', `YIP-Receipt-${data.receiptNumber}.pdf`)
      console.log('PDF size:', Math.round(data.pdfBuffer.length / 1024), 'KB')
      emailOptions.attachments = [
        {
          filename: `YIP-Receipt-${data.receiptNumber}.pdf`,
          content: data.pdfBuffer,
          contentType: 'application/pdf',
        },
      ]
    }

    console.log('Sending email via Resend...')
    const { data: responseData, error } = await resend.emails.send(emailOptions)

    if (error) {
      console.error('❌ Resend API error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))

      // Provide helpful error messages
      if (error.message?.includes('domain')) {
        console.error('💡 TIP: You may need to verify your domain at https://resend.com/domains')
      }
      if (error.message?.includes('API key')) {
        console.error('💡 TIP: Check your RESEND_API_KEY in .env.local')
      }

      return { success: false, error: error.message }
    }

    console.log('✅ Donation receipt email sent successfully!')
    console.log('Message ID:', responseData?.id)
    console.log('====================================================')
    return { success: true, messageId: responseData?.id }
  } catch (error) {
    console.error('❌ Failed to send donation receipt email:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate HTML email content for donation receipt
 */
function generateDonationReceiptEmailHtml(
  data: DonationReceiptData,
  formattedAmount: string
): string {
  // Use organization config from data if available, fallback to defaults
  const org = data.organization || getDefaultOrganizationConfig()

  const completedDate = new Date(data.completedAt).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const completedTime = new Date(data.completedAt).toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const websiteUrl = org.website.startsWith('http') ? org.website : `https://${org.website}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt - ${org.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0fdfa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Logo & Header -->
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <div style="margin-bottom: 20px;">
        <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">🤲</span>
        </div>
      </div>
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">
        Thank You!
      </h1>
      <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0; font-size: 18px; font-weight: 400;">
        Your generosity makes a difference
      </p>
    </div>

    <!-- Main Content -->
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">

      <!-- Greeting -->
      <p style="color: #1f2937; font-size: 17px; line-height: 1.7; margin: 0 0 16px;">
        Assalamualaikum <strong>${escapeHtml(data.donorName)}</strong>,
      </p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">
        Jazakallahu Khairan for your generous donation to <strong>${escapeHtml(org.name)}</strong>. Your contribution helps us continue our mission of empowering communities and transforming lives.
      </p>

      <!-- Amount Highlight -->
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center; border: 2px solid #99f6e4;">
        <div style="margin-bottom: 8px;">
          <span style="display: inline-block; background: #0d9488; color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Donation Amount
          </span>
        </div>
        <div style="font-size: 48px; color: #0d9488; font-weight: 800; letter-spacing: -1px; margin: 16px 0;">
          ${formattedAmount}
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          ${completedDate} at ${completedTime}
        </div>
      </div>

      <!-- Receipt Details Card -->
      <div style="background: #f9fafb; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
        <div style="background: #1f2937; padding: 16px 20px;">
          <h3 style="color: white; margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            📄 Receipt Details
          </h3>
        </div>
        <div style="padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 14px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Receipt Number</td>
              <td style="padding: 14px 0; color: #0d9488; font-size: 14px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb; font-family: 'Courier New', monospace;">${escapeHtml(data.receiptNumber)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Payment Reference</td>
              <td style="padding: 14px 0; color: #1f2937; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb; font-family: 'Courier New', monospace;">${escapeHtml(data.paymentReference)}</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Payment Method</td>
              <td style="padding: 14px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">Online Banking (FPX)</td>
            </tr>
            <tr>
              <td style="padding: 14px 0; color: #6b7280; font-size: 14px;">Purpose</td>
              <td style="padding: 14px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${data.projectTitle ? escapeHtml(data.projectTitle) : 'General Fund'}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Organization Info -->
      <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #f59e0b;">
        <div style="display: flex; align-items: flex-start;">
          <span style="font-size: 20px; margin-right: 12px;">ℹ️</span>
          <div>
            <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
              <strong>Organization Registration:</strong> ${escapeHtml(org.registrationNumber)}<br>
              Please retain this receipt for your records.
            </p>
          </div>
        </div>
      </div>

      <!-- PDF Notice -->
      <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 32px; text-align: center; border: 1px solid #bfdbfe;">
        <span style="font-size: 24px; display: block; margin-bottom: 8px;">📎</span>
        <p style="color: #1e40af; font-size: 14px; font-weight: 600; margin: 0 0 4px;">
          PDF Receipt Attached
        </p>
        <p style="color: #3b82f6; font-size: 13px; margin: 0;">
          A PDF copy of your official receipt is attached to this email
        </p>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${websiteUrl}/donate"
           style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; padding: 16px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4);">
          Donate Again
        </a>
      </div>
      <div style="text-align: center;">
        <a href="${websiteUrl}/projects"
           style="display: inline-block; color: #0d9488; padding: 12px 24px; text-decoration: none; font-weight: 500; font-size: 14px;">
          View Our Projects →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 32px; text-align: center; border-radius: 0 0 16px 16px; background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
      <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 8px;">
        ${escapeHtml(org.name)}
      </p>
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 16px;">
        ${escapeHtml(org.tagline)}
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 16px;">
        ${escapeHtml(org.address.join(' • '))}
      </p>
      <div style="border-top: 1px solid #374151; padding-top: 16px; margin-top: 16px;">
        <a href="${websiteUrl}" style="color: #14b8a6; text-decoration: none; font-size: 13px; margin: 0 12px;">${escapeHtml(org.website)}</a>
        <span style="color: #4b5563;">|</span>
        <a href="mailto:${escapeHtml(org.email)}" style="color: #14b8a6; text-decoration: none; font-size: 13px; margin: 0 12px;">${escapeHtml(org.email)}</a>
        <span style="color: #4b5563;">|</span>
        <a href="tel:${escapeHtml(org.phone.replace(/\s/g, ''))}" style="color: #14b8a6; text-decoration: none; font-size: 13px; margin: 0 12px;">${escapeHtml(org.phone)}</a>
      </div>
      <p style="color: #4b5563; font-size: 11px; margin: 16px 0 0;">
        © ${new Date().getFullYear()} ${escapeHtml(org.name)}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
