import { MetadataRoute } from 'next'
import { getAllCategories } from '@/lib/services/categories'
import { getAllArticles } from '@/lib/services/articles'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // Add category pages
    const categories = await getAllCategories()
    const categoryUrls = categories.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    siteUrls.push(...categoryUrls)

    // Add article pages (if getAllArticles returns paginated results)
    // Note: For large article counts, you may need to implement pagination
    const articles = await getAllArticles(1000) // Get up to 1000 articles
    const articleUrls = articles.map((article) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: article.updatedAt
        ? new Date(article.updatedAt)
        : new Date(article.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    siteUrls.push(...articleUrls)
  } catch (error) {
    console.error('[v0] Sitemap generation error:', error)
    // Return static sitemap if database unavailable
  }

  return siteUrls
}
