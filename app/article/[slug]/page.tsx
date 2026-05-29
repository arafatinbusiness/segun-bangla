import { Metadata } from 'next'
import { ArticleClient } from './article-client'

// Fetch article data server-side for metadata generation
// Uses Firebase Admin SDK which works in Node.js server environment
async function getArticleMeta(slug: string) {
  try {
    // Dynamic import to avoid issues during build
    const { getFirestore } = await import('firebase-admin/firestore')
    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    
    // Try to initialize with service account if available, otherwise use application default
    if (getApps().length === 0) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined
      
      if (serviceAccount) {
        initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'segun-bangla',
        })
      } else {
        // Fallback: initialize without explicit credentials
        // This works on Vercel if GOOGLE_APPLICATION_CREDENTIALS is set
        // or if the environment has default application credentials
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'segun-bangla',
        })
      }
    }

    const db = getFirestore()
    const articlesRef = db.collection('articles')
    const snapshot = await articlesRef
      .where('slug', '==', slug)
      .limit(1)
      .get()

    if (snapshot.empty) return null

    const data = snapshot.docs[0].data()

    return {
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      imageUrl: data.imageUrl || '',
      publishedAt: data.publishedAt || Date.now(),
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
