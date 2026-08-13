'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getAllArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import { AdvancedSearch, SearchFilters } from '@/components/advanced-search'
import type { FirestoreArticle, Category } from '@/lib/types'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const q = searchParams?.get('q') || ''
  const selectedCategory = searchParams?.get('category') || 'all'
  const selectedSort = searchParams?.get('sort') || 'recent'
  const selectedDateRange = searchParams?.get('date') || 'all'
  const currentPage = Number(searchParams?.get('page')) || 1
  
  const ITEMS_PER_PAGE = 50 

  const [categories, setCategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, articlesData] = await Promise.all([
          getAllCategories(),
          getAllArticles(500),
        ])
        setCategories(categoriesData)
        setArticles(articlesData || [])
      } catch (error) {
        console.error('[v0] Error loading articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ফিল্টারিং এবং সোর্টিং লজিক
  const filteredArticles = articles.filter(article => {
    // কুয়েরি ফিল্টার
    if (q) {
      const query = q.toLowerCase()
      const matchesQuery = 
        article.title?.toLowerCase().includes(query) ||
        article.excerpt?.toLowerCase().includes(query)
      if (!matchesQuery) return false
    }

    // ক্যাটাগরি ফিল্টার
    if (selectedCategory !== 'all') {
      const matchesCategory = 
        article.categoryId === selectedCategory ||
        article.categoryIds?.includes(selectedCategory)
      if (!matchesCategory) return false
    }

    // ডেট রেঞ্জ ফিল্টার
    if (selectedDateRange !== 'all') {
      const now = Date.now()
      let limitTime = now
      if (selectedDateRange === 'week') limitTime = now - 7 * 24 * 60 * 60 * 1000
      else if (selectedDateRange === 'month') limitTime = now - 30 * 24 * 60 * 60 * 1000
      else if (selectedDateRange === 'year') limitTime = now - 365 * 24 * 60 * 60 * 1000

      const pubTime = typeof article.publishedAt === 'number' 
        ? article.publishedAt 
        : new Date(article.publishedAt || 0).getTime()
      if (pubTime < limitTime) return false
    }

    return true
  })

  // সোর্টিং
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (selectedSort === 'popular') {
      return (b.viewCount || 0) - (a.viewCount || 0)
    } else {
      const timeA = typeof a.publishedAt === 'number' ? a.publishedAt : new Date(a.publishedAt || 0).getTime()
      const timeB = typeof b.publishedAt === 'number' ? b.publishedAt : new Date(b.publishedAt || 0).getTime()
      return timeB - timeA
    }
  })

  const totalPages = Math.ceil(sortedArticles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentArticles = sortedArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSearchSubmit = (filters: SearchFilters) => {
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.category && filters.category !== 'all') params.set('category', filters.category)
    if (filters.sortBy && filters.sortBy !== 'recent') params.set('sort', filters.sortBy)
    if (filters.dateRange && filters.dateRange !== 'all') params.set('date', filters.dateRange)

    router.push(`/search?${params.toString()}`, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }
    router.push(`/search?${params.toString()}`, { scroll: true })
  }

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          
          {/* অ্যাডভান্সড সার্চ এবং ফিল্টার বার */}
          <AdvancedSearch
            categories={categories}
            onSearch={handleSearchSubmit}
            isLoading={loading}
          />

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              {q ? `"${q}" এর অনুসন্ধান ফলাফল` : 'সকল নিবন্ধ'}
            </h1>
            <p className="text-muted-foreground text-sm">
              মোট {sortedArticles.length} টি নিবন্ধ পাওয়া গেছে {totalPages > 1 && `(পেজ ${currentPage} / ${totalPages})`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="h-40 bg-muted rounded-lg"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : currentArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentArticles.map(article => (
                  <ArticleCard key={article.docId} article={article} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition"
                  >
                    পূর্ববর্তী
                  </button>

                  <div className="flex gap-1 overflow-x-auto max-w-xs px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground'
                            : 'border bg-card text-foreground hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition"
                  >
                    পরবর্তী
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">কোনো নিবন্ধ পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">লোড হচ্ছে...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}