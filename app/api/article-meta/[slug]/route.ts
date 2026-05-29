import { NextResponse } from 'next/server'

// Firebase Admin SDK is not available, so we use the Firebase REST API
// to fetch article data server-side for metadata generation
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'segun-bangla'
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAHRITS5jkpb__sa3VSz0N_uMI109F0Wxg'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }

  try {
    // Use Firebase Firestore REST API to query article by slug
    // Using a simple single-field query (no composite index needed)
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`

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
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Firestore query failed:', errorText)
      return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
    }

    const data = await response.json()

    if (!data || data.length === 0 || !data[0].document) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const doc = data[0].document
    const fields = doc.fields || {}

    // Extract fields from Firestore document format
    const extractValue = (field: any) => {
      if (!field) return null
      if (field.stringValue !== undefined) return field.stringValue
      if (field.integerValue !== undefined) return parseInt(field.integerValue, 10)
      if (field.doubleValue !== undefined) return field.doubleValue
      if (field.booleanValue !== undefined) return field.booleanValue
      if (field.timestampValue) return new Date(field.timestampValue).getTime()
      if (field.arrayValue) {
        return field.arrayValue.values?.map((v: any) => extractValue(v)) || []
      }
      if (field.mapValue) {
        const result: Record<string, any> = {}
        for (const [key, val] of Object.entries(field.mapValue.fields || {})) {
          result[key] = extractValue(val)
        }
        return result
      }
      return null
    }

    const article = {
      docId: doc.name.split('/').pop(),
      title: extractValue(fields.title) || '',
      slug: extractValue(fields.slug) || '',
      excerpt: extractValue(fields.excerpt) || '',
      imageUrl: extractValue(fields.imageUrl) || '',
      content: extractValue(fields.content) || '',
      publishedAt: extractValue(fields.publishedAt) || Date.now(),
      tags: extractValue(fields.tags) || [],
      categoryId: extractValue(fields.categoryId) || '',
      categoryIds: extractValue(fields.categoryIds) || [],
      reporterName: extractValue(fields.reporterName) || '',
      source: extractValue(fields.source) || '',
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('[API] Error fetching article meta:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
