# Email Notifications System - Implementation Guide

## Overview

A comprehensive email notification system has been implemented using Resend API, providing transactional and marketing emails for user engagement and account management.

## Features Implemented

### 1. Welcome Emails
Sent when new users register an account with:
- Personalized greeting in Bengali
- Account confirmation message
- Link to profile page
- Security notice about account creation

### 2. Article Published Notifications
Sent to admins when articles are published with:
- Article title and link
- Author name
- Direct link to published article
- Quick dashboard navigation

### 3. Subscription Confirmation Emails
Sent when users subscribe to categories with:
- Category confirmation
- Subscription details
- Link to category page
- Unsubscribe instructions

### 4. Password Reset Emails
Sent when users request password reset with:
- Password reset link
- Expiration time (1 hour)
- Security warning if not requested by user
- Alternative action steps

### 5. Email Preferences
User control panel at `/profile/email-preferences` with:
- New articles notifications toggle
- Weekly digest toggle
- Security alerts (always on)
- Marketing emails toggle
- Privacy information

## Architecture

### Email Service (`lib/services/email.ts`)

Core functions:
```typescript
sendWelcomeEmail(email, displayName)
sendArticlePublishedNotification(email, title, url, author)
sendSubscriptionConfirmationEmail(email, category)
sendPasswordResetEmail(email, resetLink)
sendBulkEmails(recipients, subject, html)
```

### Email Templates

All templates are:
- Responsive and mobile-friendly
- Written in Bengali for primary audience
- Branded with Segun Bangla styling
- Include unsubscribe options
- Professional HTML formatting

## Setup Instructions

### 1. Resend Account Setup

1. Go to [Resend.com](https://resend.com)
2. Sign up for free account
3. Create API key from dashboard
4. Add verified sender domain or use default

### 2. Environment Variables

Add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@segunbangla.com
```

### 3. Configure Sender Email

**Option A: Default (Free)**
- Uses Resend's default sender domain
- No additional setup required
- Format: `name@resend.dev`

**Option B: Custom Domain (Recommended)**
1. Add your domain in Resend dashboard
2. Verify DNS records
3. Update `EMAIL_FROM` in `.env.local`

### 4. Email Templates Customization

Edit HTML templates in `lib/services/email.ts`:
- Modify colors to match brand
- Update logo and company info
- Change contact information
- Adjust greeting language if needed

## Integration Points

### User Registration
```typescript
import { sendWelcomeEmail } from '@/lib/services/email'

// After user registration succeeds
await sendWelcomeEmail(user.email, user.displayName)
```

### Article Publishing
```typescript
import { sendArticlePublishedNotification } from '@/lib/services/email'

// When admin publishes article
await sendArticlePublishedNotification(
  adminEmail,
  article.title,
  `${siteUrl}/article/${article.slug}`,
  article.authorName
)
```

### Category Subscription
```typescript
import { sendSubscriptionConfirmationEmail } from '@/lib/services/email'

// When user subscribes to category
await sendSubscriptionConfirmationEmail(user.email, category.name)
```

### Password Reset
```typescript
import { sendPasswordResetEmail } from '@/lib/services/email'

// When user requests password reset
const resetLink = `${siteUrl}/reset-password?token=${resetToken}`
await sendPasswordResetEmail(user.email, resetLink)
```

## Email Preferences Page

Located at `/profile/email-preferences`

Features:
- Toggle notifications per type
- Save preferences to localStorage (demo) or Firestore (production)
- Privacy information display
- User-friendly Bengali interface

## Demo Mode

If `RESEND_API_KEY` is not configured:
- Emails log to console instead of sending
- System returns success to prevent errors
- Perfect for development/testing
- Production ready once API key added

## Production Considerations

### Email Deliverability

1. **SPF/DKIM Setup**
   - Configure DNS records in Resend dashboard
   - Improves email delivery rate
   - Prevents spam filtering

2. **Unsubscribe Compliance**
   - All marketing emails include unsubscribe links
   - Required by CAN-SPAM and GDPR
   - Never remove unsubscribe option

3. **Bounce Handling**
   - Monitor bounce rates in Resend dashboard
   - Remove bounced emails from list
   - Implement bounce handling API

### Email Rate Limiting

For bulk operations:
```typescript
// Don't send more than 100 emails per second
const chunk = 100
for (let i = 0; i < recipients.length; i += chunk) {
  const batch = recipients.slice(i, i + chunk)
  await sendBulkEmails(batch, subject, html)
  await new Promise(resolve => setTimeout(resolve, 1000))
}
```

### Testing Email Sending

Use Resend's test feature:
1. Use `test@resend.dev` as recipient
2. Emails won't actually send but will show in dashboard
3. Test all templates before production

## Alternative Email Providers

This system can easily switch to other providers:

### SendGrid
```typescript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
await sgMail.send({ to, from, subject, html })
```

### Mailgun
```typescript
const mailgun = require('mailgun.js')
const client = new mailgun.Mailgun(...)
await client.messages.create(domain, message)
```

### AWS SES
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
const client = new SESClient({})
await client.send(new SendEmailCommand(params))
```

## Email Analytics

Available in Resend dashboard:
- Delivery rate
- Open rate
- Click rate
- Bounce rate
- Complaint rate
- Sent emails history

Monitor these metrics for:
- Quality assessment
- List hygiene
- Content effectiveness
- Compliance issues

## Troubleshooting

### Emails not sending

**Check API key:**
```bash
echo $RESEND_API_KEY  # Should show key, not empty
```

**Verify configuration:**
- Check `.env.local` has `RESEND_API_KEY`
- Confirm Resend account has API key created
- Check API key is valid and not expired

### Emails going to spam

**Improve deliverability:**
1. Verify sender domain
2. Add SPF/DKIM records
3. Ensure reply-to is set
4. Avoid spam trigger words
5. Check email list quality

### Template rendering issues

**Check HTML:**
- Use inline styles (not CSS classes)
- Test responsive design
- Verify all links are valid
- Check image sizes for mobile

## Future Enhancements

### Phase 1 - User Preferences
- ✅ Email preference center
- Category-specific subscriptions
- Frequency control (daily/weekly/monthly)
- Batch digest emails

### Phase 2 - Advanced Features
- Email scheduling
- A/B testing
- Dynamic content personalization
- Multi-language support

### Phase 3 - Compliance
- GDPR consent management
- Double opt-in verification
- Automated unsubscribe processing
- Bounce/complaint handling

### Phase 4 - Analytics
- Email performance dashboard
- Engagement tracking
- Conversion attribution
- Subscriber segmentation

## Best Practices

1. **Always get consent** before sending emails
2. **Provide unsubscribe option** in every email
3. **Use responsive templates** for mobile
4. **Test templates** thoroughly before sending
5. **Monitor bounce rates** and remove bad emails
6. **Personalize content** when possible
7. **Clear call-to-action** buttons
8. **Respect send frequency** to avoid spam complaints

## Support Resources

- [Resend Documentation](https://resend.com/docs)
- [Email Best Practices](https://www.resend.com/docs/best-practices)
- [GDPR Compliance Guide](https://www.resend.com/docs/gdpr)
- [API Reference](https://resend.com/docs/api-reference)

## Summary

Email notifications system provides:
- ✅ Welcome emails for new users
- ✅ Article notifications for admins
- ✅ Subscription confirmations
- ✅ Password reset emails
- ✅ User preference management
- ✅ Multiple email provider support
- ✅ Demo mode for development
- ✅ Production-ready implementation
