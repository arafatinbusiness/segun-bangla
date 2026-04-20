# Analytics and Sitemap Guide

## Overview

Comprehensive analytics tracking and SEO optimization features for the Segun Bangla news portal, including sitemap generation, robots.txt configuration, and user engagement tracking.

## Sitemap Implementation

### Dynamic Sitemap Generation

The application automatically generates a dynamic sitemap at `/sitemap.xml` that includes:

**Static URLs:**
- Homepage (priority 1.0, hourly updates)
- Login page (priority 0.5)
- Register page (priority 0.5)

**Dynamic URLs:**
- All category pages (priority 0.8, daily updates)
- All published articles (priority 0.7, weekly updates)

### Sitemap Features

- **Last Modified Dates**: Uses article publish/update dates
- **Change Frequency**: Appropriate for each content type
- **Priority Levels**: Helps search engines prioritize crawling
- **URL Count**: Supports up to 1000+ articles
- **Error Handling**: Falls back to static sitemap if database unavailable

### Accessing Sitemap

```
https://yourdomain.com/sitemap.xml
```

Register with search engines:
- Google Search Console
- Bing Webmaster Tools
- Yandex Webmaster

## Robots.txt Configuration

File: `/public/robots.txt`

### Rules Configured

```
User-agent: *
Allow: /                          # Allow all by default
Disallow: /admin/                 # Hide admin pages
Disallow: /profile/               # Hide user profiles
Disallow: /api/                   # Hide API endpoints
Disallow: /*.json$                # Hide JSON files
```

### Search Engine Specific Rules

- **Googlebot**: Full access to public content
- **Bingbot**: Full access to public content
- **Slurp**: Full access to public content

### Crawl Settings

- Crawl delay: 1 second (prevents server overload)
- Sitemap reference included

## Analytics Tracking

### Analytics Service (`lib/services/analytics.ts`)

Core functions for tracking user interactions:

```typescript
trackPageView(event)           // Track page loads
trackArticleView(event)        // Track article reads
trackUserEngagement(event)     // Track clicks, shares, etc.
trackArticleShare(articleId, platform)    // Track sharing
trackUserAuth(eventType)       // Track login/signup
```

### Event Types

#### Page View Events
```typescript
{
  pageUrl: string
  referrer: string
  pageTitle: string
  timestamp: Date
}
```

#### Article View Events
```typescript
{
  articleId: string
  articleSlug: string
  articleTitle: string
  categoryId: string
  readTime: number
  scrollDepth: number
  timestamp: Date
}
```

#### User Engagement Events
```typescript
{
  eventType: 'click' | 'share' | 'comment' | 'subscribe' | 'login' | 'signup'
  articleId: string
  categoryId: string
  metadata: Record<string, any>
  timestamp: Date
}
```

## Google Analytics Integration

### Setup

1. Create Google Analytics property at https://analytics.google.com
2. Get Measurement ID (format: G-XXXXXXXXXX)
3. Add to environment variables:
   ```
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

4. Add Google Analytics script to layout.tsx:
   ```tsx
   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
     strategy="afterInteractive"
   />
   <Script id="google-analytics" strategy="afterInteractive">
     {`
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
     `}
   </Script>
   ```

### Tracked Events

The analytics service automatically sends:
- Page views with URL, title, and referrer
- Article views with article metadata
- User engagements (shares, clicks, logins)
- User authentication events

## Custom Analytics Backend

### Configuration

To send events to a custom analytics backend:

1. Add to environment variables:
   ```
   NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-api.com/events
   ```

2. The service will POST events in this format:
   ```json
   {
     "event": "page_view",
     "data": { /* event details */ },
     "timestamp": "2026-04-19T10:00:00Z"
   }
   ```

### Backend Requirements

Your analytics endpoint should:
- Accept POST requests with JSON body
- Return 200 status for successful events
- Handle async/keepalive requests
- Store events for analysis

## Alternative Analytics Providers

### Mixpanel

```typescript
// Add Mixpanel SDK
<script src="https://cdn.mxpnl.com/libs/mixpanel-latest.min.js"></script>

// Use in analytics service
if (window.mixpanel) {
  window.mixpanel.track('Article View', {
    article_id: articleId,
    article_title: articleTitle,
  })
}
```

### Amplitude

```typescript
// Add Amplitude SDK
<script src="https://cdn.amplitude.com/libs/amplitude-8.0.0-min.gz.js"></script>

// Use in analytics service
if (window.amplitude) {
  amplitude.getInstance().logEvent('Article View', {
    articleId: articleId,
    articleTitle: articleTitle,
  })
}
```

### Plausible Analytics

```typescript
// Simple script-based tracking
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## SEO Optimization Features

### Meta Tags

All pages include optimized meta tags:
- Title (60 chars max)
- Description (160 chars max)
- Keywords
- OG tags for social sharing
- Twitter card tags
- Canonical URLs

### Schema Markup

Structured data for search engines:
- Article schema with author, date, category
- Organization schema for site identity
- Breadcrumb navigation schema

### Mobile Optimization

- Responsive viewport configuration
- Touch-friendly interface
- Fast load times
- Mobile-first design

## Monitoring & Analytics

### Key Metrics to Track

1. **Traffic Metrics**
   - Page views
   - Unique visitors
   - Session duration
   - Bounce rate

2. **Content Metrics**
   - Article views
   - Read time
   - Scroll depth
   - Share count

3. **Engagement Metrics**
   - Click-through rate
   - Category popularity
   - Search keywords
   - Referrer sources

4. **Conversion Metrics**
   - User registrations
   - Login rate
   - Email subscriptions
   - Newsletter signups

### Google Search Console

Monitor search performance:
1. Register site at https://search.google.com/search-console
2. Verify ownership via DNS or HTML file
3. Submit sitemap
4. Monitor:
   - Impressions and clicks
   - Average position
   - Top queries
   - Coverage issues

## Performance Monitoring

### Vercel Analytics

Monitor performance automatically on Vercel:
- Core Web Vitals
- Page load times
- Response times
- Error rates

### Real User Monitoring (RUM)

Add to layout.tsx:
```tsx
<script defer src="https://analytics.example.com/rum.js"></script>
```

## Best Practices

### For Sitemaps

1. Update frequency based on content type
2. Include lastModified dates
3. Set appropriate priority levels
4. Keep under 50MB and 50,000 URLs
5. Submit to search engines

### For Robots.txt

1. Disallow sensitive areas
2. Set crawl delays appropriately
3. Include sitemap reference
4. Test with Google Search Console
5. Update when site structure changes

### For Analytics

1. Respect user privacy (GDPR, CCPA)
2. Include clear privacy policy
3. Provide opt-out options
4. Don't track sensitive data
5. Use secure HTTPS only

## Privacy Considerations

### GDPR Compliance

- Add cookie banner for analytics
- Provide opt-in for tracking
- Include privacy policy link
- Allow users to delete data
- Implement right to be forgotten

### CCPA Compliance

- Disclose data collection
- Provide opt-out mechanism
- Respect do-not-sell preference
- Allow data access/deletion

## Configuration Files

### sitemap.ts
- Dynamic sitemap generation
- Includes all public content
- Respects published status

### robots.txt
- Search engine crawling rules
- Sitemap location
- Crawl delays

### analytics.ts
- Event tracking functions
- Analytics provider integration
- Google Analytics support

## Troubleshooting

### Sitemap Issues

**Q: Sitemap not generating**
- Check Firebase connection in build logs
- Verify articles collection exists
- Check for error messages in console

**Q: Incorrect URLs in sitemap**
- Verify NEXT_PUBLIC_SITE_URL is set correctly
- Check article slugs are properly formatted
- Ensure published articles have dates

### Analytics Issues

**Q: Events not tracked**
- Check if analytics provider is initialized
- Verify network requests in browser DevTools
- Check for JavaScript errors

**Q: Google Analytics shows no data**
- Confirm Measurement ID is correct
- Check tracking script loads
- Verify GDPR compliance

## Future Enhancements

### Phase 1 - Advanced Analytics
- User journey tracking
- Conversion funnel analysis
- A/B testing framework
- Cohort analysis

### Phase 2 - Custom Dashboards
- Admin analytics dashboard
- Real-time visitor stats
- Revenue tracking
- Content performance

### Phase 3 - Automation
- Automated alerts for anomalies
- Smart recommendations
- Auto-optimized sitemap
- Dynamic robots.txt

## Summary

Analytics and SEO features provide:
- ✅ Dynamic sitemap generation
- ✅ SEO-friendly robots.txt
- ✅ User engagement tracking
- ✅ Google Analytics integration
- ✅ Custom analytics backend
- ✅ Multiple provider support
- ✅ Privacy-compliant tracking
- ✅ Performance monitoring
