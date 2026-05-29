import { Metadata } from 'next'
import { ArticleClient } from './article-client'

// Fetch article data server-side for metadata generation
// Uses Firebase Admin SDK which works in Node.js server environment
async function getArticleMeta(slug: string) {
  try {
    // Use Firebase REST API directly - simpler and more reliable
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'segun-bangla'
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAHRITS5jkpb__sa3VSz0N_uMI109F0Wxg'
    
    // Query Firestore REST API with a simple field filter on 'slug'
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`
    
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'articles' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'slug' },
            op: 'EQUAL',
            value: { stringValue: slug },
          },
        },
        limit: 1,
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Meta] Firestore query failed:', response.status, errorText.substring(0, 200))
      return null
    }

    const data = await response.json()
    if (!data || data.length === 0 || !data[0]?.document) return null

    const fields = data[0].document.fields || {}

    const extractValue = (field: any) => {
      if (!field) return null
      if (field.stringValue !== undefined) return field.stringValue
      if (field.integerValue !== undefined) return parseInt(field.integerValue, 10)
      if (field.booleanValue !== undefined) return field.booleanValue
      if (field.timestampValue) return new Date(field.timestampValue).getTime()
      return null
    }

    return {
      title: extractValue(fields.title) || '',
      slug: extractValue(fields.slug) || '',
      excerpt: extractValue(fields.excerpt) || '',
      imageUrl: extractValue(fields.imageUrl) || '',
      publishedAt: extractValue(fields.publishedAt) || Date.now(),
    }
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
