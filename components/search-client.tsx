'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdvancedSearch, SearchFilters } from '@/components/advanced-search'
import { ArticleCard } from '@/components/article-card'
import type { Category, FirestoreArticle } from '@/lib/types'

interface SearchClientProps {
  categories: Category[]
  initialQuery?: string
  allArticles: FirestoreArticle[]
}

export function SearchClient({ categories, initialQuery, allArticles }: SearchClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<FirestoreArticle[]>(allArticles)
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(
    initialQuery ? { query: initialQuery, sortBy: 'recent', category: 'all', dateRange: 'all' } : null
  )

  // প্রাথমিক সার্চ বা URL থেকে কুয়েরি থাকলে ফিল্টার রান করা
  useEffect(() => {
    if (initialQuery) {
      handleSearch({
        query: initialQuery,
        sortBy: 'recent',
        category: 'all',
        dateRange: 'all'
      })
    } else {
      setResults(allArticles)
    }
  }, [initialQuery, allArticles])

  const handleSearch = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true)

    try {
      let filtered = [...allArticles]

      // ১. কিওয়ার্ড সার্চ (টাইটেল বা এক্সেপ্টে মিললে)
      if (filters.query && filters.query.trim() !== '') {
        const q = filters.query.trim().toLowerCase()
        filtered = filtered.filter(
          (article) =>
            article.title?.toLowerCase().includes(q) ||
            article.excerpt?.toLowerCase().includes(q)
        )
      }

      // ২. ক্যাটাগরি ফিল্টার (undefined হ্যান্ডেল করার জন্য 'all' ফলব্যাক দেওয়া হয়েছে)
      const selectedCategory = filters.category ?? 'all'
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(
          (article) =>
            article.categoryId === selectedCategory ||
            article.categoryIds?.includes(selectedCategory)
        )
      }

      // ৩. তারিখ বা সময়কাল ফিল্টার
      const selectedDateRange = filters.dateRange ?? 'all'
      if (selectedDateRange !== 'all') {
        const now = Date.now()
        let limitTime = now
        if (selectedDateRange === 'week') limitTime = now - 7 * 24 * 60 * 60 * 1000
        else if (selectedDateRange === 'month') limitTime = now - 30 * 24 * 60 * 60 * 1000
        else if (selectedDateRange === 'year') limitTime = now - 365 * 24 * 60 * 60 * 1000

        filtered = filtered.filter((article) => {
          const pubTime =
            typeof article.publishedAt === 'number'
              ? article.publishedAt
              : new Date(article.publishedAt || 0).getTime()
          return pubTime >= limitTime
        })
      }

      // ৪. সর্টিং (জনপ্রিয় বা সাম্প্রতিক)
      const selectedSort = filters.sortBy ?? 'recent'
      if (selectedSort === 'popular') {
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      } else {
        filtered.sort((a, b) => {
          const timeA = typeof a.publishedAt === 'number' ? a.publishedAt : new Date(a.publishedAt || 0).getTime()
          const timeB = typeof b.publishedAt === 'number' ? b.publishedAt : new Date(b.publishedAt || 0).getTime()
          return timeB - timeA
        })
      }

      setResults(filtered)
      setAppliedFilters(filters)

      // URL আপডেট করা (ফুল পেজ রিলোড ছাড়া)
      const params = new URLSearchParams()
      if (filters.query) params.set('q', filters.query)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedSort !== 'recent') params.set('sort', selectedSort)
      if (selectedDateRange !== 'all') params.set('date', selectedDateRange)

      router.push(`/search?${params.toString()}`, { scroll: false })
    } catch (error) {
      console.error('[v0] Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [allArticles, router])

  return (
    <div className="space-y-8">
      {/* Advanced Search Component */}
      <AdvancedSearch
        categories={categories}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Results */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {appliedFilters?.query ? `ফলাফল (${results.length})` : `সব নিবন্ধ (${results.length})`}
          </h2>
          {appliedFilters?.query && (
            <p className="text-muted-foreground text-sm mt-2">
              "{appliedFilters.query}" এর জন্য {results.length} নিবন্ধ পাওয়া গেছে
            </p>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((article) => (
              <ArticleCard key={article.docId} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              কোনো নিবন্ধ পাওয়া যায়নি।
            </p>
            <p className="text-muted-foreground text-sm">
              অন্য কোনো শব্দ বা প্রথম দিককার পুরোনো কিওয়ার্ড দিয়ে চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  )
}