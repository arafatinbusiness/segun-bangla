'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getArticleBySlug, getRecentArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import type { FirestoreArticle } from '@/lib/types'
import type { Category } from '@/lib/types'

function ArticlePage() {
  const params = useParams()
  // Decode URL-encoded characters (e.g., %25 -> %) so slugs with special chars work
  const rawSlug = params?.slug as string
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''

  const [article, setArticle] = useState<FirestoreArticle | null>(null)
  const [recentArticles, setRecentArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleData, recentData, categoriesData] = await Promise.all([
          getArticleBySlug(slug),
          getRecentArticles(5),
          getAllCategories(),
        ])

        if (!articleData) {
          setNotFound(true)
          return
        }

        setArticle(articleData)
        setRecentArticles(recentData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('ত্রুটি নিবন্ধ লোড করছি:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (notFound || !article) {
    return (
      <>
        <Header categories={categories} />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-muted-foreground">৪০৪</h1>
            <p className="text-xl text-muted-foreground">পৃষ্ঠা পাওয়া যায়নি</p>
            <p className="text-muted-foreground">দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা স্থানান্তরিত হয়েছে।</p>
            <a href="/" className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              হোমে ফিরে যান
            </a>
          </div>
        </main>
      </>
    )
  }

  const publishDate = new Date(article.publishedAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Article Header */}
          <article>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {article.title}
              </h1>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground border-b pb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {article.source && (
                    <>
                      <span className="font-medium text-primary">{article.source}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{publishDate}</span>
                  <span>•</span>
                  <span>{article.viewCount} ভিউ</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {article.imageUrl && (
              <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden bg-muted">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="prose prose-sm max-w-none">
                  <p className="text-lg text-foreground mb-6 font-semibold">
                    {article.excerpt}
                  </p>
                  <div className="prose prose-sm max-w-none dark:prose-invert text-foreground leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                  </div>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="font-semibold mb-3">ট্যাগ:</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <a
                          key={tag}
                          href={`/search?q=${encodeURIComponent(tag)}`}
                          className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm hover:bg-muted/80"
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside>
                {/* Related Articles */}
                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">সম্পর্কিত সংবাদ</h3>
                  <div className="space-y-4">
                    {recentArticles.map((relatedArticle) => (
                      <ArticleCard
                        key={relatedArticle.docId}
                        article={relatedArticle}
                        variant="small"
                      />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </article>
        </div>
      </main>
    </>
  )
}

export default ArticlePage
