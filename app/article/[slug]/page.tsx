import { Metadata } from 'next'
import { ArticleClient } from './article-client'

// Fetch article data server-side for metadata generation
// Uses Firestore REST API directly - no SDK needed, works in any server environment
async function getArticleMeta(slug: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAHRITS5jkpb__sa3VSz0N_uMI109F0Wxg'
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'segun-bangla'
    
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'articles' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'slug' },
              op: 'EQUAL',
              value: { stringValue: slug }
            }
          },
          limit: 1
        }
      }),
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.error('Firestore API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    
    // Firestore REST API returns array of results
    if (!data || !Array.isArray(data) || data.length === 0 || !data[0].document) {
      return null
    }

    const doc = data[0].document
    const fields = doc.fields || {}

    // Extract field values from Firestore document format
    const getStringValue = (field: any) => {
      if (!field) return ''
      return field.stringValue || field.integerValue || ''
    }

    return {
      title: getStringValue(fields.title),
      slug: getStringValue(fields.slug),
      excerpt: getStringValue(fields.excerpt),
      imageUrl: getStringValue(fields.imageUrl),
      publishedAt: fields.publishedAt?.integerValue 
        ? parseInt(fields.publishedAt.integerValue) 
        : fields.publishedAt?.stringValue 
          ? parseInt(fields.publishedAt.stringValue) 
          : Date.now(),
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
