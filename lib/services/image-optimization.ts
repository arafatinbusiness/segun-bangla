/**
 * Image Optimization Service
 * Handles image processing, resizing, and CDN integration
 * Supports Vercel Image Optimization and custom CDN solutions
 */

export interface ImageOptimizationConfig {
  quality: number // 1-100, default 75
  width?: number
  height?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
}

/**
 * Generate optimized image URL for Vercel Image Optimization
 * Uses built-in Next.js Image Optimization
 */
export function getOptimizedImageUrl(
  src: string,
  config: ImageOptimizationConfig = {}
): string {
  // For Firebase Storage URLs, use Vercel Image Optimization
  if (src.includes('firebasestorage')) {
    const params = new URLSearchParams()
    if (config.width) params.append('w', config.width.toString())
    if (config.height) params.append('h', config.height.toString())
    params.append('q', (config.quality || 75).toString())
    params.append('fit', 'cover')

    return `${src}?${params.toString()}`
  }

  return src
}

/**
 * Get responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(src: string) {
  return {
    mobile: getOptimizedImageUrl(src, { width: 400, height: 250, quality: 70 }),
    tablet: getOptimizedImageUrl(src, { width: 600, height: 400, quality: 75 }),
    desktop: getOptimizedImageUrl(src, { width: 800, height: 500, quality: 80 }),
    largeScreen: getOptimizedImageUrl(src, {
      width: 1200,
      height: 750,
      quality: 85,
    }),
  }
}

/**
 * Generate srcset attribute for responsive images
 */
export function generateSrcset(src: string): string {
  const urls = getResponsiveImageUrls(src)
  return `${urls.mobile} 400w, ${urls.tablet} 600w, ${urls.desktop} 800w, ${urls.largeScreen} 1200w`
}

/**
 * Get image dimensions for aspect ratio calculation
 */
export function getImageDimensions(width: number, height: number) {
  const aspectRatio = width / height
  return {
    aspectRatio,
    paddingBottom: `${(height / width) * 100}%`,
  }
}

/**
 * Optimize image for social media sharing
 */
export function getShareImage(src: string): string {
  return getOptimizedImageUrl(src, { width: 1200, height: 630, quality: 80 })
}

/**
 * Optimize image for article thumbnail
 */
export function getThumbnailImage(src: string): string {
  return getOptimizedImageUrl(src, { width: 300, height: 200, quality: 70 })
}

/**
 * Blur placeholder for progressive image loading
 */
export async function generateBlurPlaceholder(src: string): Promise<string> {
  // In production, generate actual blur placeholder
  // For now, return a simple data URL
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23E5E7EB" width="400" height="300"/%3E%3C/svg%3E'
}

/**
 * CDN Configuration
 */
export const cdnConfig = {
  // Vercel Image Optimization (built-in)
  vercelImageOptimization: {
    enabled: true,
    domains: ['firebasestorage.googleapis.com'],
  },

  // Alternative CDNs
  alternatives: {
    cloudinary: {
      enabled: false,
      baseUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL,
    },
    imgix: {
      enabled: false,
      baseUrl: process.env.NEXT_PUBLIC_IMGIX_URL,
    },
    bunnycdn: {
      enabled: false,
      baseUrl: process.env.NEXT_PUBLIC_BUNNYCDN_URL,
    },
  },
}

/**
 * Image caching headers
 */
export const imageCacheHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Content-Type': 'image/webp,image/jpeg,image/png',
}

/**
 * Get CDN URL based on configuration
 */
export function getCdnUrl(imageId: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  // Determine which CDN to use
  if (cdnConfig.alternatives.cloudinary.enabled) {
    const sizes = { small: 300, medium: 600, large: 1200 }
    return `${cdnConfig.alternatives.cloudinary.baseUrl}/w_${sizes[size]}/q_auto/${imageId}`
  }

  if (cdnConfig.alternatives.imgix.enabled) {
    const sizes = { small: 300, medium: 600, large: 1200 }
    return `${cdnConfig.alternatives.imgix.baseUrl}/${imageId}?w=${sizes[size]}&auto=format&q=75`
  }

  if (cdnConfig.alternatives.bunnycdn.enabled) {
    const sizes = { small: 300, medium: 600, large: 1200 }
    return `${cdnConfig.alternatives.bunnycdn.baseUrl}/${imageId}?width=${sizes[size]}&optimize=true`
  }

  // Default to original image
  return imageId
}

/**
 * Image optimization best practices
 */
export const bestPractices = {
  // Recommended image sizes
  sizes: {
    thumbnail: { width: 300, height: 200 },
    articleCard: { width: 400, height: 250 },
    heroImage: { width: 1200, height: 600 },
    socialShare: { width: 1200, height: 630 },
  },

  // Quality settings
  quality: {
    thumbnail: 65,
    preview: 70,
    standard: 80,
    high: 85,
  },

  // Lazy loading
  lazyLoading: 'lazy' as const,
  eagerLoading: 'eager' as const,

  // Image formats
  formats: {
    modern: ['image/webp', 'image/avif'],
    fallback: 'image/jpeg',
  },
}
