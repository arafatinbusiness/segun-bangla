/**
 * Analytics Service
 * Tracks user interactions and article engagement
 * Data can be sent to analytics providers like Google Analytics, Mixpanel, or custom backend
 */

export interface PageViewEvent {
  pageUrl: string
  referrer?: string
  pageTitle: string
  timestamp: Date
}

export interface ArticleViewEvent {
  articleId: string
  articleSlug: string
  articleTitle: string
  categoryId: string
  readTime?: number
  scrollDepth?: number
  timestamp: Date
}

export interface UserEngagementEvent {
  eventType: 'click' | 'share' | 'comment' | 'subscribe' | 'login' | 'signup'
  articleId?: string
  categoryId?: string
  metadata?: Record<string, any>
  timestamp: Date
}

/**
 * Track page view event
 */
export function trackPageView(event: PageViewEvent): void {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[v0 Analytics] Page View:', event)
    }

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', 'page_view', {
        page_path: event.pageUrl,
        page_title: event.pageTitle,
        referrer: event.referrer,
      })
    }

    // Send to custom analytics endpoint
    sendAnalyticsEvent('page_view', event)
  } catch (error) {
    console.error('[v0] Analytics error:', error)
  }
}

/**
 * Track article view event
 */
export function trackArticleView(event: ArticleViewEvent): void {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[v0 Analytics] Article View:', event)
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', 'view_item', {
        items: [
          {
            item_id: event.articleId,
            item_name: event.articleTitle,
            item_category: event.categoryId,
          },
        ],
      })
    }

    sendAnalyticsEvent('article_view', event)
  } catch (error) {
    console.error('[v0] Analytics error:', error)
  }
}

/**
 * Track user engagement events
 */
export function trackUserEngagement(event: UserEngagementEvent): void {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[v0 Analytics] User Engagement:', event)
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('event', event.eventType, {
        article_id: event.articleId,
        category_id: event.categoryId,
        ...event.metadata,
      })
    }

    sendAnalyticsEvent('user_engagement', event)
  } catch (error) {
    console.error('[v0] Analytics error:', error)
  }
}

/**
 * Track article share event
 */
export function trackArticleShare(articleId: string, platform: string): void {
  trackUserEngagement({
    eventType: 'share',
    articleId,
    metadata: { platform },
    timestamp: new Date(),
  })
}

/**
 * Track user login/signup
 */
export function trackUserAuth(eventType: 'login' | 'signup'): void {
  trackUserEngagement({
    eventType,
    timestamp: new Date(),
  })
}

/**
 * Send analytics event to custom backend
 */
async function sendAnalyticsEvent(
  eventName: string,
  eventData: any
): Promise<void> {
  // Only send in production
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // Only if analytics endpoint is configured
  if (!process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    return
  }

  try {
    await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
      }),
      // Don't block page load on analytics
      keepalive: true,
    })
  } catch (error) {
    // Silently fail - don't block user experience
    console.error('[v0] Failed to send analytics:', error)
  }
}

/**
 * Get article view count (from Firestore)
 */
export async function getArticleViewCount(articleId: string): Promise<number> {
  try {
    // This would query Firestore article metrics
    // For now, return 0 as placeholder
    return 0
  } catch (error) {
    console.error('[v0] Error getting view count:', error)
    return 0
  }
}

/**
 * Increment article view count
 */
export async function incrementArticleViews(articleId: string): Promise<void> {
  try {
    // Update article view count in Firestore
    // Placeholder for now
  } catch (error) {
    console.error('[v0] Error incrementing views:', error)
  }
}

/**
 * Analytics Configuration
 */
export const analyticsConfig = {
  // Google Analytics ID (if using)
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  
  // Custom analytics endpoint
  analyticsEndpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
  
  // Whether to track in development
  trackInDevelopment: process.env.NEXT_PUBLIC_ANALYTICS_DEV === 'true',
}
