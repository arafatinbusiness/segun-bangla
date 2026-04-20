/**
 * Email Service
 * Handles sending emails for various notifications
 * Currently configured for Resend API
 */

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send a welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  displayName: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">সেগুন বাংলায় স্বাগতম</h1>
        <p style="color: #666; font-size: 16px;">
          নমস্কার ${displayName},
        </p>
        <p style="color: #666; line-height: 1.6;">
          আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আপনি এখন সেগুন বাংলা পোর্টালের সমস্ত বৈশিষ্ট্য ব্যবহার করতে পারেন।
        </p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/profile" 
             style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            আপনার প্রোফাইল দেখুন
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          যদি আপনি এই অ্যাকাউন্ট তৈরি করেননি, অনুগ্রহ করে এই ইমেইল উপেক্ষা করুন।
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          সেগুন বাংলা © 2026. সকল অধিকার সংরক্ষিত।
        </p>
      </div>
    `

    return await sendEmail({
      to: email,
      subject: 'সেগুন বাংলায় স্বাগতম',
      html,
    })
  } catch (error) {
    console.error('[v0] Welcome email error:', error)
    return false
  }
}

/**
 * Send article published notification to admins
 */
export async function sendArticlePublishedNotification(
  adminEmail: string,
  articleTitle: string,
  articleUrl: string,
  authorName: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">নতুন নিবন্ধ প্রকাশিত হয়েছে</h1>
        <p style="color: #666; font-size: 16px;">
          একটি নতুন নিবন্ধ সেগুন বাংলায় প্রকাশিত হয়েছে।
        </p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">${articleTitle}</h2>
          <p style="color: #666;">লেখক: <strong>${authorName}</strong></p>
          <a href="${articleUrl}" 
             style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            নিবন্ধ দেখুন
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          সেগুন বাংলা প্রশাসক বিজ্ঞপ্তি
        </p>
      </div>
    `

    return await sendEmail({
      to: adminEmail,
      subject: `নতুন নিবন্ধ: ${articleTitle}`,
      html,
    })
  } catch (error) {
    console.error('[v0] Article notification error:', error)
    return false
  }
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  email: string,
  category: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">সাবস্ক্রিপশন নিশ্চিত</h1>
        <p style="color: #666; font-size: 16px;">
          আপনি সফলভাবে <strong>${category}</strong> বিভাগে সাবস্ক্রাইব করেছেন।
        </p>
        <p style="color: #666; line-height: 1.6;">
          আপনি এখন এই বিভাগের সমস্ত নতুন নিবন্ধের জন্য ইমেইল বিজ্ঞপ্তি পাবেন।
        </p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/category/${category.toLowerCase()}" 
             style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            বিভাগ দেখুন
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          আপনার সাবস্ক্রিপশন পরিচালনা করতে আপনার প্রোফাইল পরিদর্শন করুন।
        </p>
      </div>
    `

    return await sendEmail({
      to: email,
      subject: `${category} সাবস্ক্রিপশন নিশ্চিত`,
      html,
    })
  } catch (error) {
    console.error('[v0] Subscription email error:', error)
    return false
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">পাসওয়ার্ড পুনরায় নির্ধারণ করুন</h1>
        <p style="color: #666; font-size: 16px;">
          আপনার সেগুন বাংলা অ্যাকাউন্টের পাসওয়ার্ড পুনরায় নির্ধারণের অনুরোধ পাওয়া গেছে।
        </p>
        <div style="margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            পাসওয়ার্ড পুনরায় নির্ধারণ করুন
          </a>
        </div>
        <p style="color: #999; font-size: 14px;">
          এই লিঙ্কটি 1 ঘন্টার জন্য বৈধ।
        </p>
        <p style="color: #999; font-size: 14px;">
          যদি আপনি এটি অনুরোধ করেননি, অনুগ্রহ করে এই ইমেইল উপেক্ষা করুন।
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          সেগুন বাংলা সিকিউরিটি অ্যালার্ট
        </p>
      </div>
    `

    return await sendEmail({
      to: email,
      subject: 'সেগুন বাংলা - পাসওয়ার্ড পুনরায় নির্ধারণ',
      html,
    })
  } catch (error) {
    console.error('[v0] Password reset email error:', error)
    return false
  }
}

/**
 * Core email sending function
 * Configured for Resend API (https://resend.com)
 * Can be replaced with SendGrid, Mailgun, or other SMTP service
 */
async function sendEmail(template: EmailTemplate): Promise<boolean> {
  // Demo mode - returns true without sending
  if (!process.env.RESEND_API_KEY) {
    console.warn('[v0] RESEND_API_KEY not configured - emails in demo mode')
    console.log('[v0] Email to:', template.to)
    console.log('[v0] Subject:', template.subject)
    return true
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@segunbangla.com',
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] Email send error:', error)
      return false
    }

    console.log('[v0] Email sent successfully to:', template.to)
    return true
  } catch (error) {
    console.error('[v0] Email service error:', error)
    return false
  }
}

/**
 * Send bulk email notification to multiple users
 */
export async function sendBulkEmails(
  recipients: string[],
  subject: string,
  html: string
): Promise<{ success: number; failed: number }> {
  const results = await Promise.all(
    recipients.map((email) => sendEmail({ to: email, subject, html }))
  )

  return {
    success: results.filter((r) => r).length,
    failed: results.filter((r) => !r).length,
  }
}
