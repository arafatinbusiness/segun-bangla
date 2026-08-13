'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getAllArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import type { FirestoreArticle, Category } from '@/lib/types'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const q = searchParams?.get('q') || undefined
  const currentPage = Number(searchParams?.get('page')) || 1
  
  // প্রতি পেজে ৫০টি বা ১০০টি আর্টিকেল দেখানোর জন্য এখানে সেট করুন
  const ITEMS_PER_PAGE = 50 

  const [categories, setCategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, articlesData] = await Promise.all([
          getAllCategories(),
          getAllArticles(500), // প্রতি পেজে ৫০-১00টি দেখানোর জন্য পর্যাপ্ত ডেটা (যেমন ৫০০টি) ফেচ করা হচ্ছে
        ])
        
        // তারিখ অনুযায়ী ডিসেন্ডিং (লেটেস্ট আগে) সর্ট করা
        const sorted = (articlesData || []).sort((a, b) => {
          const timeA = typeof a.publishedAt === 'number' ? a.publishedAt : new Date(a.publishedAt || 0).getTime()
          const timeB = typeof b.publishedAt === 'number' ? b.publishedAt : new Date(b.publishedAt || 0).getTime()
          return timeB - timeA
        })

        setCategories(categoriesData)
        setArticles(sorted)
      } catch (error) {
        console.error('[v0] Error loading articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // সার্চ বা কুয়েরি ফিল্টার
  const filteredArticles = articles.filter(article => {
    if (!q) return true
    const query = q.toLowerCase()
    return (
      article.title?.toLowerCase().includes(query) ||
      article.excerpt?.toLowerCase().includes(query)
    )
  })

  // পেজিনেশন ক্যালকুলেশন
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // পেজ পরিবর্তনের হ্যান্ডলার
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }
    router.push(`/search?${params.toString()}`, { scroll: true })
  }

  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              {q ? `"${q}" এর অনুসন্ধান ফলাফল` : 'সকল নিবন্ধ (তারিখ অনুযায়ী)'}
            </h1>
            <p className="text-muted-foreground text-sm">
              মোট {filteredArticles.length} টি নিবন্ধ পাওয়া গেছে (পেজ {currentPage} / {totalPages || 1})
            </p>
          </div>

          {/* আর্টিকেল গ্রিড */}
          {currentArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentArticles.map(article => (
                  <ArticleCard key={article.docId} article={article} />
                ))}
              </div>

              {/* প্রথাগত পেজিনেশন (Pagination Number & Next/Prev) */}
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
              <p className="text-lg">কোনো নিবন্ধ পাওয়া যায়নি।</p>
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