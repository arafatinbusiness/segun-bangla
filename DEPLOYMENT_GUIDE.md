# Deployment and Performance Monitoring Guide

## Overview

Complete guide for deploying the Segun Bangla news portal to production and monitoring performance using industry-standard tools and practices.

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Environment variables configured
- [ ] All tests pass (if implemented)

### Security
- [ ] All sensitive data in environment variables
- [ ] No secrets in code or Git
- [ ] Firebase security rules reviewed
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS properly configured
- [ ] Content Security Policy headers set

### Performance
- [ ] Images optimized (WebP format)
- [ ] Bundle size acceptable
- [ ] Database indexes created
- [ ] Caching strategy implemented
- [ ] CDN configured

### Configuration
- [ ] Firebase project created and configured
- [ ] Resend email API key obtained
- [ ] Environment variables documented
- [ ] DNS configured for custom domain
- [ ] SSL certificate active

## Deployment to Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Install Vercel GitHub app
4. Grant necessary permissions

### Step 2: Connect Repository

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select GitHub repository
4. Choose project root directory: `/`
5. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

**Firebase Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Email Variables:**
```
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@segunbangla.com
```

**Analytics Variables (optional):**
```
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXX
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://api.example.com/events
```

**Site Configuration:**
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 4: Configure Domain

1. In Vercel → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 24 hours)

## Performance Optimization

### Core Web Vitals

Monitor and optimize:
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

### Optimization Strategies

**1. Image Optimization**
```typescript
// Use OptimizedImage component
<OptimizedImage
  src={imageUrl}
  alt="Description"
  width={400}
  height={250}
  quality={75}
/>
```

**2. Code Splitting**
```typescript
// Lazy load heavy components
const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => <Skeleton />,
})
```

**3. ISR (Incremental Static Regeneration)**
```typescript
// Revalidate at 3600 seconds
export const revalidate = 3600
```

**4. Database Indexing**
In Firestore, create indexes on:
- `articles.publishedAt` (descending)
- `articles.categoryId`
- `articles.slug`

### Monitoring Performance

**Google PageSpeed Insights:**
1. Go to https://pagespeed.web.dev/
2. Enter your domain
3. Check mobile and desktop scores
4. Follow optimization suggestions

**Vercel Analytics:**
- Automatic tracking of Core Web Vitals
- Available in Vercel Dashboard
- Real user monitoring data
- Performance insights

**Google Search Console:**
1. Go to https://search.google.com/search-console
2. Add and verify property
3. Monitor Core Web Vitals
4. Review indexing status

## Error Monitoring

### Sentry Integration (Optional)

```typescript
// Install Sentry
import * as Sentry from "@sentry/nextjs"

// Initialize in next.config.mjs
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Error Tracking Best Practices

1. **Set up error alerts**
   - Critical errors: immediate notification
   - Warnings: daily digest
   - Info: weekly summary

2. **Monitor error rates**
   - API errors
   - Client-side errors
   - Database timeouts

3. **Error recovery**
   - Graceful degradation
   - User-friendly error messages
   - Automatic retry logic

## Database Monitoring

### Firebase Console

Monitor:
- Firestore usage (reads, writes)
- Storage usage
- Authentication metrics
- Real-time database size

### Performance Tips

```typescript
// Use batch writes
const batch = writeBatch(db)
batch.set(doc1, data1)
batch.set(doc2, data2)
await batch.commit()

// Use pagination
const q = query(collection, limit(20))

// Create composite indexes
// (Firestore will suggest these automatically)
```

## Security Monitoring

### Regular Audits

1. **Code Security**
   - Run `npm audit` regularly
   - Update dependencies monthly
   - Review dependency vulnerabilities

2. **Environment Security**
   - Rotate API keys quarterly
   - Audit access logs
   - Review Firebase security rules

3. **Data Security**
   - Enable encryption at rest
   - Use HTTPS only
   - Implement rate limiting

### Security Headers

Configure in Vercel headers (vercel.json):
```json
{
  "headers": [
    {
      "source": "/:path*",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Scaling Strategy

### When to Scale

Scale database when:
- Firestore reads exceed 50k/day
- Storage exceeds 1GB
- Authentication users exceed 10k

Scale frontend when:
- Page load times > 3 seconds
- Bounce rate increasing
- User complaints about speed

### Scaling Options

**1. Firestore Scaling**
- Upgrade to dedicated capacity
- Enable automatic scaling
- Implement caching layer (Redis)

**2. Storage Scaling**
- Enable image CDN
- Implement image resizing pipeline
- Archive old content

**3. Frontend Scaling**
- Use Vercel Edge Functions
- Implement service workers
- Use regional deployment

## Backup and Disaster Recovery

### Firestore Backups

```bash
# Export data regularly
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)

# Restore from backup
gcloud firestore import gs://your-bucket/backup-20240101
```

### Automated Backup Strategy

1. **Daily backups** to Google Cloud Storage
2. **Weekly exports** to secondary location
3. **Monthly snapshots** for long-term retention
4. **Test recovery** quarterly

### Disaster Recovery Plan

**RTO (Recovery Time Objective):** 1 hour
**RPO (Recovery Point Objective):** 24 hours

Recovery steps:
1. Identify the issue
2. Restore from backup
3. Verify data integrity
4. Resume operations

## Monitoring Checklist

### Daily
- [ ] Check error rates in Sentry
- [ ] Monitor error logs
- [ ] Verify uptime (status page)

### Weekly
- [ ] Review analytics
- [ ] Check Core Web Vitals
- [ ] Review database metrics

### Monthly
- [ ] Update dependencies
- [ ] Review security
- [ ] Analyze performance trends
- [ ] Update documentation

## Deployment Automation

### GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm build
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Automated Testing

```bash
# Run tests before deployment
pnpm test

# Run linting
pnpm lint

# Check types
pnpm type-check
```

## Monitoring Tools Summary

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Vercel Analytics | Performance monitoring | Yes |
| Google Search Console | SEO monitoring | Yes |
| Google PageSpeed Insights | Performance analysis | Yes |
| Firebase Console | Database monitoring | Yes |
| Sentry | Error tracking | 5k events/month |
| Cloudflare | CDN & security | Yes (basic) |

## Rollback Strategy

If deployment causes issues:

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push
```

## Post-Deployment Tasks

After going live:

1. **Verify functionality**
   - Test all major features
   - Check authentication
   - Verify email sending

2. **Monitor metrics**
   - Set up alerts
   - Monitor uptime
   - Track Core Web Vitals

3. **User communication**
   - Announce launch
   - Provide feedback form
   - Monitor user reports

## Support and Troubleshooting

### Common Issues

**Deployment fails:**
- Check environment variables
- Verify build succeeds locally
- Check Node.js version compatibility

**Slow performance:**
- Check database indexes
- Review image optimization
- Monitor API response times

**Authentication issues:**
- Verify Firebase configuration
- Check CORS settings
- Review security rules

## Contact and Resources

- **Vercel Support:** https://vercel.com/help
- **Firebase Support:** https://firebase.google.com/support
- **Next.js Docs:** https://nextjs.org/docs
- **GitHub Actions:** https://docs.github.com/en/actions

## Deployment Summary

Segun Bangla is now ready for production deployment with:
- ✅ Vercel hosting configured
- ✅ Firebase integration complete
- ✅ Email notifications ready
- ✅ Analytics and monitoring enabled
- ✅ Performance optimizations implemented
- ✅ Security best practices in place
- ✅ Backup and disaster recovery planned
