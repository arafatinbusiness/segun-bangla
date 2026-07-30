import { Metadata } from 'next'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArticleClient } from './article-client'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const rawSlug = params.slug
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.segunbangla.com'
  const siteName = 'সেগুন বাংলা'

  try {
    // Use Firebase SDK directly — no REST API calls, no quota issues
    const q = query(
      collection(db, 'articles'),
      where('slug', '==', slug),
      where('status', '==', 'published')
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return {
        title: {
          default: `${siteName} - বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল`,
          template: `%s - ${siteName}`,
        },
        description: `${siteName}য় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ।`,
      }
    }

    const articleDoc = snapshot.docs[0]
    const data = articleDoc.data()
    const title = `${data.title || 'নিবন্ধ'} - ${siteName}`
    const description = data.excerpt || data.title || `${siteName} থেকে পড়ুন`
    const imageUrl = data.imageUrl || `${siteUrl}/logo.png`
    const articleUrl = `${siteUrl}/article/${slug}`
    const publishedTime = data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined
    const updatedTime = data.updatedAt ? new Date(data.updatedAt).toISOString() : publishedTime
    const keywords = data.tags?.join(', ') || `${siteName}, ${data.title}`
    const categoryName = data.categoryId || ''

    return {
      title,
      description,
      keywords: [keywords, siteName, 'বাংলা খবর', 'bangla news'].join(', '),
      openGraph: {
        title: data.title || siteName,
        description,
        url: articleUrl,
        type: 'article',
        siteName: siteName,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: data.title }],
        publishedTime,
        modifiedTime: updatedTime,
        authors: [siteName],
        tags: data.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title || siteName,
        description,
        images: [imageUrl],
      },
      alternates: { canonical: articleUrl },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    }
  } catch (error) {
    console.error('Error in generateMetadata:', error)
    return {
      title: `${siteName} - বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল`,
      description: `${siteName}য় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ।`,
    }
  }
}

export default function ArticlePage(
  { params }: { params: { slug: string } }
) {
  const rawSlug = params.slug
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''
  return <ArticleClient initialSlug={slug} />
}