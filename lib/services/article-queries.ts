import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase'
import { FirestoreArticle } from '../types'

const ARTICLES_COLLECTION = 'articles'

export async function getArticleBySlug(slug: string): Promise<FirestoreArticle | null> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION), 
      where('slug', '==', slug),
      where('status', '==', 'published')
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return {
      ...doc.data(),
      docId: doc.id,
    } as FirestoreArticle
  } catch (error) {
    console.error('[v0] Error fetching article by slug:', error)
    return null
  }
}

export async function getArticleById(id: string): Promise<FirestoreArticle | null> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return {
      ...docSnap.data(),
      docId: docSnap.id,
    } as FirestoreArticle
  } catch (error) {
    console.error('[v0] Error fetching article by id:', error)
    return null
  }
}

export async function getLeadArticles(limitCount: number = 5): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('isLead', '==', true),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
  } catch (error) {
    console.error('[v0] Error fetching lead articles:', error)
    return []
  }
}

export async function getFeaturedArticles(limitCount: number = 3): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('isFeatured', '==', true),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
  } catch (error) {
    console.error('[v0] Error fetching featured articles:', error)
    return []
  }
}

export async function getSpecialArticles(limitCount: number = 10): Promise<FirestoreArticle[]> {
  try {
    // Try to fetch by isSpecialOrder first for proper ordering
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('isSpecial', '==', true),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(50)
    )
    const snapshot = await getDocs(q)
    let articles = snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]

    // Sort by isSpecialOrder if available, then by publishedAt
    articles.sort((a, b) => {
      if (a.isSpecialOrder !== undefined && b.isSpecialOrder !== undefined) {
        return a.isSpecialOrder - b.isSpecialOrder
      }
      if (a.isSpecialOrder !== undefined) return -1
      if (b.isSpecialOrder !== undefined) return 1
      return (b.publishedAt || 0) - (a.publishedAt || 0)
    })

    return articles.slice(0, limitCount)
  } catch (error) {
    console.error('[v0] Error fetching special articles:', error)
    // Fallback: get recent published articles
    try {
      const fallbackQ = query(
        collection(db, ARTICLES_COLLECTION),
        where('status', '==', 'published'),
        where('publishedAt', '<=', Date.now()),
        orderBy('publishedAt', 'desc'),
        limit(50)
      )
      const snapshot = await getDocs(fallbackQ)
      const articles = snapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      })) as FirestoreArticle[]

      // Filter isSpecial + sort by isSpecialOrder
      const special = articles.filter(a => a.isSpecial)
      special.sort((a, b) => {
        if (a.isSpecialOrder !== undefined && b.isSpecialOrder !== undefined) {
          return a.isSpecialOrder - b.isSpecialOrder
        }
        if (a.isSpecialOrder !== undefined) return -1
        if (b.isSpecialOrder !== undefined) return 1
        return (b.publishedAt || 0) - (a.publishedAt || 0)
      })

      return special.slice(0, limitCount)
    } catch (fallbackError) {
      console.error('[v0] Error fetching fallback articles:', fallbackError)
      return []
    }
  }
}

export async function getArticlesByCategory(
  categoryId: string,
  pageSize: number = 12,
  pageNumber: number = 0
): Promise<FirestoreArticle[]> {
  const articlesMap = new Map<string, FirestoreArticle>()

  // 1. Try array-contains query first (new format supporting multiple categories)
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('categoryIds', 'array-contains', categoryId),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    )
    const snapshot = await getDocs(q)
    snapshot.docs.forEach((doc) => {
      articlesMap.set(doc.id, {
        ...doc.data(),
        docId: doc.id,
      } as FirestoreArticle)
    })
  } catch (e) {
    console.warn('[v0] categoryIds query failed, trying categoryId fallback:', e)
  }

  // 2. If we haven't reached pageSize, also query by single categoryId to catch legacy articles
  if (articlesMap.size < pageSize) {
    try {
      const fallbackQ = query(
        collection(db, ARTICLES_COLLECTION),
        where('categoryId', '==', categoryId),
        where('status', '==', 'published'),
        where('publishedAt', '<=', Date.now()),
        orderBy('publishedAt', 'desc'),
        limit(pageSize)
      )
      const fallbackSnapshot = await getDocs(fallbackQ)
      fallbackSnapshot.docs.forEach((doc) => {
        if (!articlesMap.has(doc.id)) {
          articlesMap.set(doc.id, {
            ...doc.data(),
            docId: doc.id,
          } as FirestoreArticle)
        }
      })
    } catch (error) {
      console.error('[v0] Error fetching articles by category (fallback):', error)
    }
  }

  const combined = Array.from(articlesMap.values())
  combined.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
  return combined.slice(0, pageSize)
}


export async function getArticlesByCategoryPaginated(
  categoryId: string,
  pageSize: number = 12,
  lastDoc?: any
): Promise<{ articles: FirestoreArticle[]; lastVisible: any; hasMore: boolean }> {
  try {
    let q
    if (lastDoc) {
      q = query(
        collection(db, ARTICLES_COLLECTION),
        where('categoryId', '==', categoryId),
        where('status', '==', 'published'),
        where('publishedAt', '<=', Date.now()),
        orderBy('publishedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      )
    } else {
      q = query(
        collection(db, ARTICLES_COLLECTION),
        where('categoryId', '==', categoryId),
        where('status', '==', 'published'),
        where('publishedAt', '<=', Date.now()),
        orderBy('publishedAt', 'desc'),
        limit(pageSize)
      )
    }
    const snapshot = await getDocs(q)
    const articles = snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]
    const hasMore = snapshot.docs.length === pageSize
    return { articles, lastVisible, hasMore }
  } catch (error) {
    console.error('[v0] Error fetching paginated articles by category:', error)
    return { articles: [], lastVisible: null, hasMore: false }
  }
}


export async function getArticlesBySubcategory(
  subcategoryId: string,
  pageSize: number = 12,
  childSubcategoryIds: string[] = []
): Promise<FirestoreArticle[]> {
  // Combine the main subcategory with all children
  const allIds = [subcategoryId, ...childSubcategoryIds]
  
  // Try array-contains-any first (supports up to 10 values)
  // This finds articles tagged with ANY of the subcategories in the hierarchy
  try {
    // Firestore 'in' queries support up to 10 values
    const batchSize = 10
    let allArticles: FirestoreArticle[] = []
    
    for (let i = 0; i < allIds.length; i += batchSize) {
      const batch = allIds.slice(i, i + batchSize)
      const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('subcategoryIds', 'array-contains-any', batch),
        where('status', '==', 'published'),
        where('publishedAt', '<=', Date.now()),
        orderBy('publishedAt', 'desc'),
        limit(pageSize)
      )
      const snapshot = await getDocs(q)
      const articles = snapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      })) as FirestoreArticle[]
      allArticles = [...allArticles, ...articles]
    }
    
    // Also try single subcategoryId field for backward compatibility
    try {
      const legacyQ = query(
        collection(db, ARTICLES_COLLECTION),
        where('subcategoryId', 'in', allIds.slice(0, 10)),
        where('status', '==', 'published'),
        where('publishedAt', '<=', Date.now()),
        orderBy('publishedAt', 'desc'),
        limit(pageSize)
      )
      const legacySnapshot = await getDocs(legacyQ)
      const legacyArticles = legacySnapshot.docs.map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      })) as FirestoreArticle[]
      allArticles = [...allArticles, ...legacyArticles]
    } catch (e) {
      // 'subcategoryId' field may not exist or index missing — ignore
    }
    
    // Remove duplicates by docId, sort by publishedAt desc, limit
    const seen = new Set<string>()
    const unique = allArticles.filter(a => {
      if (seen.has(a.docId)) return false
      seen.add(a.docId)
      return true
    })
    unique.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
    return unique.slice(0, pageSize)
    
  } catch (error) {
    console.error('[v0] Error fetching articles by subcategory:', error)
    return []
  }
}

export async function searchArticles(
  searchTerm: string,
  pageSize: number = 12
): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    )
    const snapshot = await getDocs(q)
    const results = snapshot.docs
      .map((doc) => ({
        ...doc.data(),
        docId: doc.id,
      })) as FirestoreArticle[]

    const lowerSearch = searchTerm.toLowerCase()
    return results.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerSearch) ||
        article.excerpt.toLowerCase().includes(lowerSearch)
    )
  } catch (error) {
    console.error('[v0] Error searching articles:', error)
    return []
  }
}

export async function getRecentArticles(limitCount: number = 10): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
  } catch (error) {
    console.error('[v0] Error fetching recent articles:', error)
    return []
  }
}

export async function getAllArticles(limitCount: number = 1000): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
  } catch (error) {
    console.error('[v0] Error fetching all articles:', error)
    return []
  }
}

export async function getAdminArticles(
  limitCount: number = 20,
  lastDoc?: any,
  searchTerm?: string
): Promise<{ articles: FirestoreArticle[]; lastVisible: any; hasMore: boolean }> {
  try {
    let q
    const collectionRef = collection(db, ARTICLES_COLLECTION)

    if (searchTerm && searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.trim().toLowerCase()
      const endText = lowerSearch + '\uf8ff'

      if (lastDoc) {
        q = query(
          collectionRef,
          orderBy('title'),
          where('title', '>=', lowerSearch),
          where('title', '<=', endText),
          startAfter(lastDoc),
          limit(limitCount)
        )
      } else {
        q = query(
          collectionRef,
          orderBy('title'),
          where('title', '>=', lowerSearch),
          where('title', '<=', endText),
          limit(limitCount)
        )
      }
    } else {
      if (lastDoc) {
        q = query(
          collectionRef,
          orderBy('updatedAt', 'desc'),
          startAfter(lastDoc),
          limit(limitCount)
        )
      } else {
        q = query(
          collectionRef,
          orderBy('updatedAt', 'desc'),
          limit(limitCount)
        )
      }
    }

    const snapshot = await getDocs(q)
    const articles = snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
    const lastVisible = snapshot.docs[snapshot.docs.length - 1]
    const hasMore = snapshot.docs.length === limitCount
    return { articles, lastVisible, hasMore }
  } catch (error) {
    console.error('[v0] Error fetching admin articles:', error)
    return { articles: [], lastVisible: null, hasMore: false }
  }
}
