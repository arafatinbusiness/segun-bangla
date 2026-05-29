import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const rawSlug = params.slug
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    const articlesRef = collection(db, 'articles')
    const q = query(articlesRef, where('slug', '==', slug), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const data = snapshot.docs[0].data()

    return NextResponse.json({
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      imageUrl: data.imageUrl || '',
      publishedAt: data.publishedAt || Date.now(),
    })
  } catch (error) {
    console.error('Error fetching article meta:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}
