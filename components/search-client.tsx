'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdvancedSearch, SearchFilters } from '@/components/advanced-search'
import { ArticleCard } from '@/components/article-card'
import type { Category, FirestoreArticle } from '@/lib/types'
import { searchArticles } from '@/lib/services/articles'

interface SearchClientProps {
  categories: Category[]
  initialQuery?: string
  results: FirestoreArticle[]
}

export function SearchClient({ categories, initialQuery, results: initialResults }: SearchClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<FirestoreArticle[]>(initialResults)
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(
    initialQuery ? { query: initialQuery, sortBy: 'recent' } : null
  )

  const handleSearch = useCallback(async (filters: SearchFilters) => {
    if (!filters.query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      // Get search results
      const searchResults = await searchArticles(filters.query, 50)

      // Apply sorting
      let sortedResults = [...searchResults]
      
      if (filters.sortBy === 'popular') {
        sortedResults.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      } else if (filters.sortBy === 'relevant') {
        // Simple relevance: prioritize title matches
        sortedResults.sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(filters.query.toLowerCase()) ? 1 : 0
          const bTitle = b.title.toLowerCase().includes(filters.query.toLowerCase()) ? 1 : 0
          return bTitle - aTitle
        })
      }

      // Apply date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date()
        const filterDate = new Date()

        switch (filters.dateRange) {
          case 'week':
            filterDate.setDate(now.getDate() - 7)
            break
          case 'month':
            filterDate.setMonth(now.getMonth() - 1)
            break
          case 'year':
            filterDate.setFullYear(now.getFullYear() - 1)
            break
        }

        sortedResults = sortedResults.filter(
          (article) => new Date(article.publishedAt) >= filterDate
        )
      }

      // Apply category filter
      if (filters.category) {
        sortedResults = sortedResults.filter(
          (article) => article.categoryId === filters.category
        )
      }

      setResults(sortedResults)
      setAppliedFilters(filters)

      // Update URL without full navigation
      const params = new URLSearchParams()
      params.set('q', filters.query)
      if (filters.category) params.set('category', filters.category)
      if (filters.sortBy !== 'recent') params.set('sort', filters.sortBy)
      if (filters.dateRange && filters.dateRange !== 'all') params.set('date', filters.dateRange)

      router.push(`/search?${params.toString()}`)
    } catch (error) {
      console.error('[v0] Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return (
    <div className="space-y-8">
      {/* Advanced Search Component */}
      <AdvancedSearch
        categories={categories}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {/* Results */}
      {results.length > 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((article) => (
              <ArticleCard key={article.docId} article={article} />
            ))}
          </div>
        </div>
      ) : appliedFilters ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            "{appliedFilters.query}" এর জন্য কোন নিবন্ধ পাওয়া যায়নি।
          </p>
          <p className="text-muted-foreground">
            অন্য কোন শব্দ চেষ্টা করুন বা ফিল্টার পরিবর্তন করুন।
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            কিছু সন্ধান করতে শুরু করুন এবং ফলাফল এখানে দেখা যাবে।
          </p>
        </div>
      )}
    </div>
  )
}
