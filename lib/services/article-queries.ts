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

export async function getSpecialArticles(limitCount: number = 4): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('isSpecial', '==', true),
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
    console.error('[v0] Error fetching special articles:', error)
    return []
  }
}

export async function getArticlesByCategory(
  categoryId: string,
  pageSize: number = 12,
  pageNumber: number = 0
): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('categoryId', '==', categoryId),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
  } catch (error) {
    console.error('[v0] Error fetching articles by category:', error)
    return []
  }
}

export async function getArticlesBySubcategory(
  subcategoryId: string,
  pageSize: number = 12
): Promise<FirestoreArticle[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      where('subcategoryId', '==', subcategoryId),
      where('status', '==', 'published'),
      where('publishedAt', '<=', Date.now()),
      orderBy('publishedAt', 'desc'),
      limit(pageSize)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    })) as FirestoreArticle[]
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
  lastDoc?: any
): Promise<{ articles: FirestoreArticle[]; lastVisible: any; hasMore: boolean }> {
  try {
    let q
    if (lastDoc) {
      q = query(
        collection(db, ARTICLES_COLLECTION),
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      )
    } else {
      q = query(
        collection(db, ARTICLES_COLLECTION),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )
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
