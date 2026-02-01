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
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, reason: 'no_api_key' }
  }

  if (!data.donorEmail) {
    console.log('No donor email provided')
    return { success: false, reason: 'no_recipient' }
  }

  try {
    const formattedAmount = new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: data.currency || 'MYR',
    }).format(data.amount)

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
      emailOptions.attachments = [
        {
          filename: `YIP-Receipt-${data.receiptNumber}.pdf`,
          content: data.pdfBuffer,
          contentType: 'application/pdf',
        },
      ]
    }

    const { data: responseData, error } = await resend.emails.send(emailOptions)

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    console.log('Donation receipt email sent successfully:', responseData?.id)
    return { success: true, messageId: responseData?.id }
  } catch (error) {
    console.error('Failed to send donation receipt email:', error)
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

  const websiteUrl = org.website.startsWith('http') ? org.website : `https://${org.website}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
        Thank You!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
        Your generosity makes a difference
      </p>
    </div>

    <!-- Content -->
    <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
      <!-- Greeting -->
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Dear ${escapeHtml(data.donorName)},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        Thank you for your generous donation to ${escapeHtml(org.name)}. Your support helps us continue our mission of ${escapeHtml(org.tagline.toLowerCase())}.
      </p>

      <!-- Receipt Card -->
      <div style="background: #f0fdfa; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #99f6e4;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; background: #0d9488; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
            Official Receipt
          </span>
        </div>

        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Amount Donated</div>
          <div style="font-size: 36px; color: #0d9488; font-weight: 700;">${formattedAmount}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #d1fae5;">Receipt Number</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #d1fae5;">${escapeHtml(data.receiptNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #d1fae5;">Reference</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #d1fae5; font-family: monospace;">${escapeHtml(data.paymentReference)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #d1fae5;">Date</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #d1fae5;">${completedDate}</td>
          </tr>
          ${data.projectTitle ? `
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Project</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(data.projectTitle)}</td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Purpose</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">General Fund</td>
          </tr>
          `}
        </table>
      </div>

      <!-- Tax Notice -->
      <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
        <p style="color: #92400e; font-size: 13px; line-height: 1.6; margin: 0;">
          <strong>Tax Deduction Notice:</strong> Your donation may be eligible for tax deduction under Section 44(6) of the Income Tax Act 1967 (Tax Exemption Ref: ${escapeHtml(org.taxExemptionRef)}). Please retain this receipt for your tax records.
        </p>
      </div>

      <!-- PDF Attachment Notice -->
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
        A PDF copy of your receipt is attached to this email.
      </p>

      <!-- CTA -->
      <div style="text-align: center;">
        <a href="${websiteUrl}/donate"
           style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Support Another Cause
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 25px; text-align: center; border-radius: 0 0 12px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none;">
      <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 10px;">
        ${escapeHtml(org.name)}
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px;">
        ${escapeHtml(org.tagline)}
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        <a href="${websiteUrl}" style="color: #0d9488; text-decoration: none;">${escapeHtml(org.website)}</a>
        &nbsp;|&nbsp;
        <a href="mailto:${escapeHtml(org.email)}" style="color: #0d9488; text-decoration: none;">${escapeHtml(org.email)}</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
