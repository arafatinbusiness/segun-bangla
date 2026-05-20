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
  imageSize?: 'landscape' | 'portrait' | 'square' | 'full'
  imageFocus?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  imageCaption?: string
  shoulder?: string
  shoulderColor?: string
  shoulderTextColor?: string
  shoulderFontSize?: string
  ticker?: string
  tickerColor?: string
  bulletPoints?: string[]
  bulletColor?: string
  bulletFontSize?: string
  excerptColor?: string
  categoryId: string
  categoryIds?: string[]
  subcategoryId?: string
  subcategoryIds?: string[]
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
  reporterName?: string
  reporterImage?: string
  editHistory?: EditHistoryEntry[]
}

export interface EditHistoryEntry {
  editedBy: string
  editorName: string
  editorEmail: string
  timestamp: number
  action: 'created' | 'updated' | 'published' | 'unpublished'
}


export interface FirestoreArticle extends Article {
  docId: string
}

export type AdShape = 'leaderboard' | 'rectangle' | 'square' | 'skyscraper' | 'wide' | 'custom'

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
  adShape?: AdShape
  adWidth?: number
  adHeight?: number
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
