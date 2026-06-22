import { Resend } from 'resend'

// Lazy-initialize Resend; falls back to a mock key during development
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key')

const FROM_NO_REPLY = 'Flash Growth <no-reply@flashgrowth.com>'
const FROM_SYSTEM   = 'System Alert <system@flashgrowth.com>'
const TEAM_EMAIL    = process.env.SYSTEM_ALERT_EMAIL || 'marketing@flashgrowth.com'
const BRAND_BLUE    = '#0057FF'

/* ─── Shared HTML helpers ─── */

function baseTemplate(content: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e9ecef;">
      <!-- Header -->
      <div style="background: #000; padding: 28px 36px; display: flex; align-items: center;">
        <span style="font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px;">
          Flash<span style="color: ${BRAND_BLUE};">Growth</span>
        </span>
      </div>
      <!-- Body -->
      <div style="padding: 36px; color: #212529;">
        ${content}
      </div>
      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 20px 36px; border-top: 1px solid #e9ecef;">
        <p style="margin: 0; font-size: 12px; color: #868e96;">
          &copy; ${new Date().getFullYear()} Flash Growth — All rights reserved.<br/>
          San Francisco, CA &nbsp;|&nbsp; <a href="mailto:hello@flashgrowth.com" style="color: ${BRAND_BLUE};">hello@flashgrowth.com</a>
        </p>
      </div>
    </div>
  `
}

function serviceListHTML(services: Array<{ name: string; price: number }>): string {
  return services
    .map(s => `<li style="padding: 6px 0; border-bottom: 1px solid #f1f3f5;">${s.name} — <strong>$${s.price.toLocaleString()}</strong></li>`)
    .join('')
}

/* ─── 1. Client inquiry confirmation ─── */

export interface InquiryEmailPayload {
  to: string
  fullName: string
  services: Array<{ name: string; price: number }>
  totalQuote: number
  companyName?: string
}

export async function sendInquiryConfirmation(payload: InquiryEmailPayload): Promise<void> {
  const { to, fullName, services, totalQuote, companyName } = payload

  const body = `
    <h2 style="margin-top: 0; color: ${BRAND_BLUE};">Thank you, ${fullName}!</h2>
    <p>We have received your proposal request${companyName ? ` for <strong>${companyName}</strong>` : ''}. Our senior growth advisor will reach out within <strong>2 business hours</strong>.</p>

    <div style="background: #f8f9fa; border-left: 4px solid ${BRAND_BLUE}; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h4 style="margin-top: 0; color: #212529;">Your Selected Services</h4>
      <ul style="padding-left: 16px; margin: 0;">
        ${serviceListHTML(services)}
      </ul>
      <p style="font-size: 18px; font-weight: 700; margin: 16px 0 0; color: ${BRAND_BLUE};">
        Total Estimate: $${totalQuote.toLocaleString()}
      </p>
    </div>

    <p>While you wait, feel free to explore our <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#portfolio" style="color: ${BRAND_BLUE};">case studies</a> to see the results we deliver.</p>
    <p style="margin-bottom: 0;">We look forward to accelerating your growth! 🚀</p>
  `

  await resend.emails.send({
    from: FROM_NO_REPLY,
    to,
    subject: '✅ Your Flash Growth Proposal Request — Confirmation',
    html: baseTemplate(body),
  })
}

/* ─── 2. Internal lead alert ─── */

export interface LeadAlertPayload {
  fullName: string
  email: string
  mobileNumber: string
  companyName?: string
  businessType: string
  projectDescription: string
  services: Array<{ name: string; price: number }>
  totalQuote: number
  inquiryId: string
}

export async function sendLeadAlert(payload: LeadAlertPayload): Promise<void> {
  const {
    fullName, email, mobileNumber, companyName,
    businessType, projectDescription, services, totalQuote, inquiryId
  } = payload

  const rows = [
    ['Inquiry ID', `<code>${inquiryId}</code>`],
    ['Client Name', fullName],
    ['Company', companyName || '—'],
    ['Email', `<a href="mailto:${email}" style="color:${BRAND_BLUE}">${email}</a>`],
    ['Mobile', mobileNumber],
    ['Business Type', businessType],
    ['Total Quote', `<strong>$${totalQuote.toLocaleString()}</strong>`],
    ['Project Goals', projectDescription],
  ]
    .map(([label, value]) => `<tr><td style="padding:8px 12px; background:#f8f9fa; font-weight:600; white-space:nowrap;">${label}</td><td style="padding:8px 12px; border-bottom:1px solid #e9ecef;">${value}</td></tr>`)
    .join('')

  const body = `
    <h2 style="margin-top: 0;">🔔 New Lead Inquiry</h2>
    <table style="width:100%; border-collapse: collapse; font-size: 14px;">
      ${rows}
    </table>
    <div style="background: #f8f9fa; border-left: 4px solid ${BRAND_BLUE}; border-radius: 8px; padding: 16px; margin-top: 20px;">
      <h4 style="margin: 0 0 10px;">Selected Services</h4>
      <ul style="padding-left: 16px; margin: 0;">${serviceListHTML(services)}</ul>
    </div>
  `

  await resend.emails.send({
    from: FROM_SYSTEM,
    to: TEAM_EMAIL,
    subject: `🔔 New Lead: ${fullName}${companyName ? ` (${companyName})` : ''} — $${totalQuote.toLocaleString()}`,
    html: baseTemplate(body),
  })
}

/* ─── 3. Payment success notification ─── */

export interface PaymentSuccessEmailPayload {
  to: string
  fullName: string
  totalQuote: number
  gateway: string
  gatewayId: string
}

export async function sendPaymentSuccessEmail(payload: PaymentSuccessEmailPayload): Promise<void> {
  const { to, fullName, totalQuote, gateway, gatewayId } = payload

  const body = `
    <h2 style="margin-top: 0; color: #1a7f4b;">Payment Confirmed ✓</h2>
    <p>Hi ${fullName}, your payment of <strong>$${totalQuote.toLocaleString()}</strong> has been successfully processed via <strong>${gateway}</strong>.</p>
    <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #6c757d;">Transaction Reference: <code>${gatewayId}</code></p>
    </div>
    <p>Our team has been notified and will be in touch shortly to begin your onboarding. Thank you for choosing Flash Growth!</p>
  `

  await resend.emails.send({
    from: FROM_NO_REPLY,
    to,
    subject: '🎉 Payment Successful — Flash Growth',
    html: baseTemplate(body),
  })
}

/* ─── 4. Project status update ─── */

export interface StatusUpdateEmailPayload {
  to: string
  fullName: string
  companyName?: string
  status: string
  notes?: string
}

export async function sendStatusUpdateEmail(payload: StatusUpdateEmailPayload): Promise<void> {
  const { to, fullName, companyName, status, notes } = payload

  const body = `
    <h2 style="margin-top: 0; color: ${BRAND_BLUE};">Project Status Update</h2>
    <p>Hello ${fullName},</p>
    <p>The status of your project at <strong>Flash Growth</strong>${companyName ? ` (for ${companyName})` : ''} has been updated to:</p>
    
    <div style="background: #f8f9fa; border-left: 4px solid ${BRAND_BLUE}; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <span style="font-size: 20px; font-weight: 700; color: #000; letter-spacing: 0.5px; text-transform: uppercase;">
        ${status.replace('_', ' ')}
      </span>
    </div>

    ${notes ? `
    <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <h4 style="margin: 0 0 8px; color: #495057;">Update Notes from the Team:</h4>
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #212529; white-space: pre-wrap;">${notes}</p>
    </div>
    ` : ''}

    <p>You can check the full details of your project deliverables at any time in your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="color: ${BRAND_BLUE}; font-weight: 600;">Client Dashboard</a>.</p>
    <p style="margin-bottom: 0;">Best regards,<br/>The Flash Growth Operations Team</p>
  `

  await resend.emails.send({
    from: FROM_NO_REPLY,
    to,
    subject: `🔔 Project Status Update: ${status.replace('_', ' ')} — Flash Growth`,
    html: baseTemplate(body),
  }).catch(e => console.error('[Status Update Email Error]:', e))
}

export interface ContactFormEmailPayload {
  name: string
  email: string
  phone: string
  message: string
}

export async function sendContactFormSubmission(payload: ContactFormEmailPayload): Promise<void> {
  const { name, email, phone, message } = payload

  const body = `
    <h2 style="margin-top: 0; color: ${BRAND_BLUE};">✉️ New Contact Form Message</h2>
    <p>You have received a new message from the contact form on your website.</p>
    
    <table style="width:100%; border-collapse: collapse; font-size: 14px; margin-top: 20px; border: 1px solid #dee2e6;">
      <tr>
        <td style="padding:10px 14px; background:#f8f9fa; font-weight:600; width:140px; border-right:1px solid #dee2e6; border-bottom:1px solid #dee2e6;">Sender Name</td>
        <td style="padding:10px 14px; border-bottom:1px solid #dee2e6;">${name}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px; background:#f8f9fa; font-weight:600; border-right:1px solid #dee2e6; border-bottom:1px solid #dee2e6;">Email Address</td>
        <td style="padding:10px 14px; border-bottom:1px solid #dee2e6;"><a href="mailto:${email}" style="color:${BRAND_BLUE}; text-decoration:none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 14px; background:#f8f9fa; font-weight:600; border-right:1px solid #dee2e6; border-bottom:1px solid #dee2e6;">Phone Number</td>
        <td style="padding:10px 14px; border-bottom:1px solid #dee2e6;">${phone}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px; background:#f8f9fa; font-weight:600; border-right:1px solid #dee2e6; vertical-align:top;">Message</td>
        <td style="padding:10px 14px; white-space:pre-wrap; line-height:1.5;">${message}</td>
      </tr>
    </table>
  `

  await resend.emails.send({
    from: FROM_SYSTEM,
    to: 'flashgrowth06@gmail.com',
    subject: `✉️ New Contact Form: ${name}`,
    html: baseTemplate(body),
  }).catch(e => console.error('[Contact Form Email Error]:', e))
}
