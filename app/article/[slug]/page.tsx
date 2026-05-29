import { Metadata } from 'next'
import { ArticleClient } from './article-client'

// Fetch article data server-side for metadata generation
// Uses the internal API route which uses Firebase client SDK
async function getArticleMeta(slug: string) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://segun-bangla.vercel.app'
    const response = await fetch(`${siteUrl}/api/article-meta/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) return null

    return await response.json()
  } catch (error) {
    console.error('Error fetching article meta:', error)
    return null
  }
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const rawSlug = params.slug
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''
  
  const article = await getArticleMeta(slug)
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://segun-bangla.vercel.app'
  
  if (!article) {
    return {
      title: 'সেগুন বাংলা - বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল',
      description: 'সেগুন বাংলায় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ।',
      openGraph: {
        title: 'সেগুন বাংলা',
        description: 'সেগুন বাংলায় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ।',
        url: `${siteUrl}/article/${slug}`,
        siteName: 'সেগুন বাংলা',
        images: [{ url: `${siteUrl}/logo.png`, width: 1200, height: 630 }],
      },
    }
  }

  const articleUrl = `${siteUrl}/article/${article.slug}`
  const title = `${article.title} - সেগুন বাংলা`
  const description = article.excerpt || `${article.title} - সেগুন বাংলা থেকে পড়ুন`
  const imageUrl = article.imageUrl || `${siteUrl}/logo.png`

  return {
    title,
    description,
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      type: 'article',
      siteName: 'সেগুন বাংলা',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: articleUrl,
    },
  }
}

export default function ArticlePage(
  { params }: { params: { slug: string } }
) {
  const rawSlug = params.slug
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''
  return <ArticleClient initialSlug={slug} />
}
