import { Metadata } from 'next'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArticleClient } from './article-client'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const rawSlug = params.slug
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://segun-bangla.vercel.app'

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
        title: 'সেগুন বাংলা - বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল',
        description: 'সেগুন বাংলায় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ।',
      }
    }

    const articleDoc = snapshot.docs[0]
    const data = articleDoc.data()
    const title = `${data.title || 'নিবন্ধ'} - সেগুন বাংলা`
    const description = data.excerpt || data.title || 'সেগুন বাংলা থেকে পড়ুন'
    const imageUrl = data.imageUrl || `${siteUrl}/logo.png`
    const articleUrl = `${siteUrl}/article/${slug}`

    return {
      title,
      description,
      openGraph: {
        title: data.title || 'সেগুন বাংলা',
        description,
        url: articleUrl,
        type: 'article',
        siteName: 'সেগুন বাংলা',
        images: [{ url: imageUrl, width: 1200, height: 630, alt: data.title }],
        publishedTime: data.publishedAt ? new Date(data.publishedAt).toISOString() : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title || 'সেগুন বাংলা',
        description,
        images: [imageUrl],
      },
      alternates: { canonical: articleUrl },
    }
  } catch (error) {
    console.error('Error in generateMetadata:', error)
    return {
      title: 'সেগুন বাংলা - বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল',
      description: 'সেগুন বাংলায় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ।',
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