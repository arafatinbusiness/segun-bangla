import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { FirestoreArticle } from '../types'

export interface SlotDiagnostic {
  slotNumber: number
  slotLabel: string // e.g. "Slot 1 (Row 1, Card 1)", "Slot 5 (Social Card)"
  type: 'article' | 'social_card'
  article: {
    id: string
    title: string
    publishedAt: number
    publishedAtFormatted: string
    slug: string
    status: string
    categoryId: string
    categoryIds: string[]
    matchType: 'primary' | 'secondary' | 'none'
  } | null
  status: 'filled' | 'empty' | 'social_card'
  emptyReason?: string
}

export interface CategoryDiagnosticReport {
  categoryId: string
  categoryName: string
  categorySlug: string
  totalArticlesInDb: number
  articlesInTop200: number
  articlesBeyondTop200: number
  isLimitExceeded: boolean
  slots: SlotDiagnostic[]
  inconsistencies: {
    unpublishedArticles: Array<{ id: string; title: string; status: string }>
    futureDatedArticles: Array<{ id: string; title: string; publishedAt: number; dateStr: string }>
    missingArrayCategory: Array<{ id: string; title: string; categoryId: string }>
    secondaryCategoryOnly: Array<{ id: string; title: string; primaryCatId: string }>
  }
  homepageGenericFetchLimit: number
  generatedAt: string
  markdownSummary: string
}

export const KNOWN_CATEGORY_IDS = {
  JATIYO: 'CYk3T8IgxYSygmcid3wM',
  RAJNITI: 'wDHXPul7juYUJJZ1pDIA',
}

/**
 * Runs deep diagnostic on a category (defaulting to Jatiyo)
 */
export async function runCategoryDiagnostics(targetCategoryId: string = KNOWN_CATEGORY_IDS.JATIYO): Promise<CategoryDiagnosticReport> {
  const HOMEPAGE_FETCH_LIMIT = 200

  // 1. Get Categories
  const catSnap = await getDocs(collection(db, 'categories'))
  const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() as any }))
  const targetCategory = categories.find(c => 
    c.id === targetCategoryId || 
    c.slug === 'national' || 
    c.slug === 'jatiyo' || 
    c.name?.includes('জাতীয়') || 
    c.name?.includes('জাতীয়')
  ) || { id: targetCategoryId, name: 'জাতীয়', slug: 'national' }

  const catId = targetCategory.id

  // 2. Fetch all articles to do an authoritative audit
  const artSnap = await getDocs(collection(db, 'articles'))
  const allArticles = artSnap.docs.map(d => ({ docId: d.id, ...d.data() as any })) as FirestoreArticle[]

  // 3. Filter articles matching this category
  const matchingArticles = allArticles.filter(a => 
    a.categoryIds?.includes(catId) || a.categoryId === catId
  )

  const publishedMatching = matchingArticles
    .filter(a => a.status === 'published' && (a.publishedAt || 0) <= Date.now())
    .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))

  // 4. Check against homepage generic limit (top 200 published articles across DB)
  const allPublished = allArticles
    .filter(a => a.status === 'published' && (a.publishedAt || 0) <= Date.now())
    .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
  
  const top200Pool = allPublished.slice(0, HOMEPAGE_FETCH_LIMIT)
  const inTop200 = top200Pool.filter(a => a.categoryIds?.includes(catId) || a.categoryId === catId)
  const beyondTop200 = allPublished.slice(HOMEPAGE_FETCH_LIMIT).filter(a => a.categoryIds?.includes(catId) || a.categoryId === catId)

  // 5. Inconsistency / Admin Upload Check
  const now = Date.now()
  const unpublishedArticles = matchingArticles
    .filter(a => a.status !== 'published')
    .map(a => ({ id: a.docId, title: a.title || 'Untitled', status: a.status || 'unknown' }))

  const futureDatedArticles = matchingArticles
    .filter(a => a.publishedAt && a.publishedAt > now)
    .map(a => ({ id: a.docId, title: a.title || 'Untitled', publishedAt: a.publishedAt, dateStr: new Date(a.publishedAt).toISOString() }))

  const missingArrayCategory = matchingArticles
    .filter(a => a.categoryId === catId && (!a.categoryIds || !a.categoryIds.includes(catId)))
    .map(a => ({ id: a.docId, title: a.title || 'Untitled', categoryId: a.categoryId }))

  const secondaryCategoryOnly = matchingArticles
    .filter(a => a.categoryIds?.includes(catId) && a.categoryId !== catId)
    .map(a => ({ id: a.docId, title: a.title || 'Untitled', primaryCatId: a.categoryId || 'none' }))

  // 6. Slot Mapping (7 articles + 1 social card = 8 slots total)
  // Layout definition:
  // Slot 1: Row 1, Card 1 (Article 1)
  // Slot 2: Row 1, Card 2 (Article 2)
  // Slot 3: Row 1, Card 3 (Article 3)
  // Slot 4: Row 1, Card 4 (Article 4)
  // Slot 5: Row 2, Card 1 (Social Card: Facebook)
  // Slot 6: Row 2, Card 2 (Article 5)
  // Slot 7: Row 2, Card 3 (Article 6)
  // Slot 8: Row 2, Card 4 (Article 7)
  const slots: SlotDiagnostic[] = []
  
  // Articles from top 200 pool that the client normally had access to:
  const clientArticles = inTop200.slice(0, 7)

  // Slot 1-4 (Row 1)
  for (let i = 0; i < 4; i++) {
    const art = clientArticles[i]
    if (art) {
      slots.push({
        slotNumber: i + 1,
        slotLabel: `Slot ${i + 1} (Row 1, Card ${i + 1})`,
        type: 'article',
        status: 'filled',
        article: {
          id: art.docId,
          title: art.title || 'Untitled',
          publishedAt: art.publishedAt,
          publishedAtFormatted: new Date(art.publishedAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
          slug: art.slug,
          status: art.status,
          categoryId: art.categoryId,
          categoryIds: art.categoryIds || [],
          matchType: art.categoryId === catId ? 'primary' : 'secondary',
        },
      })
    } else {
      slots.push({
        slotNumber: i + 1,
        slotLabel: `Slot ${i + 1} (Row 1, Card ${i + 1})`,
        type: 'article',
        status: 'empty',
        article: null,
        emptyReason: publishedMatching.length > i 
          ? `Article #${i + 1} exists in database but was pushed beyond the top-200 homepage fetch limit by articles in other categories.`
          : `Only ${publishedMatching.length} total published articles exist in this category in the database.`,
      })
    }
  }

  // Slot 5 (Row 2, Card 1 - Social Media Card)
  slots.push({
    slotNumber: 5,
    slotLabel: 'Slot 5 (Row 2, Card 1: Social Media Card)',
    type: 'social_card',
    status: 'social_card',
    article: null,
  })

  // Slot 6-8 (Row 2, Cards 2-4)
  for (let i = 4; i < 7; i++) {
    const art = clientArticles[i]
    const slotNum = i + 2 // 4 -> 6, 5 -> 7, 6 -> 8
    const cardNum = (i - 4) + 2 // 2, 3, 4
    if (art) {
      slots.push({
        slotNumber: slotNum,
        slotLabel: `Slot ${slotNum} (Row 2, Card ${cardNum})`,
        type: 'article',
        status: 'filled',
        article: {
          id: art.docId,
          title: art.title || 'Untitled',
          publishedAt: art.publishedAt,
          publishedAtFormatted: new Date(art.publishedAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
          slug: art.slug,
          status: art.status,
          categoryId: art.categoryId,
          categoryIds: art.categoryIds || [],
          matchType: art.categoryId === catId ? 'primary' : 'secondary',
        },
      })
    } else {
      slots.push({
        slotNumber: slotNum,
        slotLabel: `Slot ${slotNum} (Row 2, Card ${cardNum})`,
        type: 'article',
        status: 'empty',
        article: null,
        emptyReason: publishedMatching.length > i 
          ? `Article #${i + 1} exists in database ("${publishedMatching[i]?.title}") but was excluded because homepage only loaded top-200 articles across all categories.`
          : `Not enough articles: Only ${publishedMatching.length} total articles exist in this category.`,
      })
    }
  }

  const isLimitExceeded = inTop200.length < 7 && publishedMatching.length >= 7

  // 7. Markdown summary for 1-click clipboard copy
  const md = `# Segun Bangla - Category Diagnostics Report
**Generated At:** ${new Date().toISOString()} (${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} Dhaka Time)
**Category:** ${targetCategory.name} (Slug: \`${targetCategory.slug}\`, ID: \`${catId}\`)

---

## 1. Database & Fetch Limit Summary
- **Total Articles in Entire Database:** ${allArticles.length}
- **Total Published Articles in Database:** ${allPublished.length}
- **Total Articles in "${targetCategory.name}":** ${matchingArticles.length} (Published: ${publishedMatching.length})
- **Articles within Top-200 Homepage Cutoff:** ${inTop200.length}
- **Articles Beyond Top-200 Cutoff (Excluded from generic fetch):** ${beyondTop200.length}
- **Primary Issue Detected:** ${isLimitExceeded ? '⚠️ CRITICAL: Generic Homepage Limit (200) Exceeded! Older category articles were pushed out of client memory by articles from other categories.' : 'All slots have sufficient data.'}

---

## 2. Slot Status (7 Articles + 1 Social Card)
| Slot # | Position | Status | Article Title | Article ID | Published Date | Notes / Reason |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${slots.map(s => {
  if (s.type === 'social_card') {
    return `| 5 | Row 2, Card 1 | 🔵 Social Card | Dedicated Social Media Card | N/A | N/A | Normal (Expected behavior) |`
  }
  if (s.status === 'filled' && s.article) {
    return `| ${s.slotNumber} | ${s.slotLabel} | 🟢 Filled | "${s.article.title.replace(/\|/g, '-')}" | \`${s.article.id}\` | ${s.article.publishedAtFormatted} | Match: ${s.article.matchType} |`
  }
  return `| ${s.slotNumber} | ${s.slotLabel} | 🔴 EMPTY | *MISSING* | N/A | N/A | ${s.emptyReason || 'Slot missing'} |`
}).join('\n')}

---

## 3. Client-Side & Admin Upload Health Check
- **Unpublished / Draft Articles in Category:** ${unpublishedArticles.length}
${unpublishedArticles.map(a => `  - [${a.status}] ${a.title} (\`${a.id}\`)`).join('\n') || '  - None'}
- **Future-Dated / Scheduled Articles:** ${futureDatedArticles.length}
${futureDatedArticles.map(a => `  - ${a.title} (\`${a.id}\`) - Date: ${a.dateStr}`).join('\n') || '  - None'}
- **Articles where \`categoryIds\` array is missing category ID (Legacy format):** ${missingArrayCategory.length}
${missingArrayCategory.slice(0, 5).map(a => `  - ${a.title} (\`${a.id}\`)`).join('\n') || '  - None'}
- **Articles where Category is secondary in \`categoryIds\`:** ${secondaryCategoryOnly.length}

---

## 4. Diagnostic Conclusion & Remedy
${isLimitExceeded 
  ? `The homepage was using \`getAllArticles(200)\` to populate all category rows. Over 1-2 months, active publishing in other categories pushed "${targetCategory.name}" articles past position 200. Therefore, only ${inTop200.length} articles were present in memory, leaving slots empty. The fix is to query Firestore specifically with \`getArticlesByCategory\` for this category when memory has fewer than 7 articles.` 
  : 'Category has enough articles in the current memory pool.'}
`

  return {
    categoryId: catId,
    categoryName: targetCategory.name,
    categorySlug: targetCategory.slug,
    totalArticlesInDb: allArticles.length,
    articlesInTop200: inTop200.length,
    articlesBeyondTop200: beyondTop200.length,
    isLimitExceeded,
    slots,
    inconsistencies: {
      unpublishedArticles,
      futureDatedArticles,
      missingArrayCategory,
      secondaryCategoryOnly,
    },
    homepageGenericFetchLimit: HOMEPAGE_FETCH_LIMIT,
    generatedAt: new Date().toISOString(),
    markdownSummary: md,
  }
}

/**
 * Console logger for homepage to provide live diagnostics
 */
export function logCategoryDiagnostics(
  categoryName: string,
  categoryId: string,
  matchedArticles: FirestoreArticle[],
  totalPoolCount: number,
  healedCount?: number
) {
  const isTarget = categoryName.includes('জাতীয়') || categoryName.includes('জাতীয়') || categoryName.includes('রাজনীতি')
  if (!isTarget) return

  const neededCount = 7
  const isShortage = matchedArticles.length < neededCount

  console.groupCollapsed(
    `%c[NewsPortal Diagnostics] %c${categoryName} %c(ID: ${categoryId}) - ${matchedArticles.length}/${neededCount} Articles`,
    'color: #9333ea; font-weight: bold;',
    'color: #2563eb; font-weight: bold;',
    'color: #6b7280;'
  )

  console.log(`📌 Category: %c${categoryName}%c | ID: %c${categoryId}%c | Target Slots: 7 articles + 1 social card = 8 slots`, 'font-weight:bold; color:#0284c7;', '', 'font-weight:bold; color:#0284c7;', '')
  console.log(`📊 Articles in homepage memory pool (total pool: ${totalPoolCount}): %c${matchedArticles.length}%c`, 'font-weight:bold;', '')

  if (isShortage) {
    console.warn(
      `⚠️ [EMPTY SLOTS DETECTED]: Category "${categoryName}" only has ${matchedArticles.length} of 7 required articles in client memory! ` +
      `Cards in row 2 (slots ${matchedArticles.length < 4 ? '1-4 & 6-8' : `${matchedArticles.length + 2}-8`}) will be empty without category-specific fetch! ` +
      `Reason: Generic fetch limit (getAllArticles) was flooded by other categories, pushing older articles out of the top batch.`
    )
  }

  if (healedCount && healedCount > matchedArticles.length) {
    console.info(
      `✅ [AUTO-HEAL ACTIVATED]: Dedicated Firestore category query successfully fetched ${healedCount} articles for "${categoryName}" to fill all empty slots!`
    )
  }

  console.table(
    matchedArticles.slice(0, 8).map((a, i) => ({
      'Slot #': i < 4 ? `Slot ${i + 1} (Row 1)` : `Slot ${i + 2} (Row 2, Card ${i - 2})`,
      'Title': a.title?.substring(0, 35) + '...',
      'Doc ID': a.docId,
      'Published': a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'N/A',
      'Primary CatID': a.categoryId,
      'In CatIDs Array': a.categoryIds?.includes(categoryId) ? 'Yes' : 'No',
    }))
  )

  console.groupEnd()
}

/**
 * Auto-fix tool: Fixes articles that have categoryId but missing from categoryIds array
 */
export async function repairCategorySchema(categoryId: string): Promise<{ fixedCount: number }> {
  const artSnap = await getDocs(collection(db, 'articles'))
  let count = 0

  for (const d of artSnap.docs) {
    const data = d.data()
    if (data.categoryId === categoryId && (!data.categoryIds || !data.categoryIds.includes(categoryId))) {
      const currentIds = Array.isArray(data.categoryIds) ? data.categoryIds : []
      const newIds = Array.from(new Set([...currentIds, categoryId]))
      try {
        await updateDoc(doc(db, 'articles', d.id), {
          categoryIds: newIds,
        })
        count++
      } catch (e) {
        console.error('Failed to update article', d.id, e)
      }
    }
  }

  return { fixedCount: count }
}
