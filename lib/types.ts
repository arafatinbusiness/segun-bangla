export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  order: number
}

export interface Subcategory {
  id: string
  name: string
  slug: string
  categoryId: string
  parentId?: string | null
  order: number
}

export interface Author {
  id: string
  name: string
  email: string
  bio?: string
  imageUrl?: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  imageUrl: string
  categoryId: string
  subcategoryId?: string
  authorId: string
  status: 'draft' | 'published' | 'scheduled'
  isLead: boolean
  isSpecial: boolean
  isFeatured: boolean
  publishedAt: number // timestamp
  updatedAt: number // timestamp
  viewCount: number
  tags?: string[]
  source?: string
}

export interface FirestoreArticle extends Article {
  docId: string
}

export interface Advertisement {
  id?: string
  docId?: string
  title: string
  slotName: string
  type: 'image' | 'html'
  imageUrl?: string
  linkUrl?: string
  htmlCode?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface AdSlot {
  id?: string
  docId?: string
  name: string
  description?: string
  createdAt: number
}
