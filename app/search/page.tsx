'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import { SearchClient } from '@/components/search-client'
import type { FirestoreArticle } from '@/lib/types'
import type { Category } from '@/lib/types'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const q = searchParams?.get('q') || undefined

  const [categories, setCategories] = useState<Category[]>([])
  const [results, setResults] = useState<FirestoreArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, resultsData] = await Promise.all([
          getAllCategories(),
          q ? searchArticles(q, 50) : Promise.resolve([]),
        ])
        setCategories(categoriesData)
        setResults(resultsData)
      } catch (error) {
        console.error('[v0] Error loading search page:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [q])

  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-40 bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              অনুসন্ধান
            </h1>
            {q && (
              <p className="text-lg text-muted-foreground">
                "{q}" এর জন্য {results.length} ফলাফল পাওয়া গেছে
              </p>
            )}
          </div>

          {/* Advanced Search Component */}
          <SearchClient categories={categories} initialQuery={q} results={results} />
        </div>
      </main>
    </>
  )
}

function SearchPage() {
  return (
    <Suspense fallback={
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-40 bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    }>
      <SearchPageContent />
    </Suspense>
  )
}

export default SearchPage
