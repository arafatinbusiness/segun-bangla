'use client'

import { useState, useEffect } from 'react'
import { getLeadArticles, getFeaturedArticles, getSpecialArticles, getRecentArticles, getAllArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { AdRenderer } from '@/components/ad-renderer'
import type { FirestoreArticle } from '@/lib/types'
import type { Category } from '@/lib/types'

function HomePage() {
  const [leadArticles, setLeadArticles] = useState<FirestoreArticle[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<FirestoreArticle[]>([])
  const [specialArticles, setSpecialArticles] = useState<FirestoreArticle[]>([])
  const [recentArticles, setRecentArticles] = useState<FirestoreArticle[]>([])
  const [allArticles, setAllArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadData, featuredData, specialData, recentData, allData, categoriesData] = await Promise.all([
          getLeadArticles(1),
          getFeaturedArticles(10),
          getSpecialArticles(4),
          getRecentArticles(20),
          getAllArticles(50),
          getAllCategories(),
        ])
        setLeadArticles(leadData)
        setFeaturedArticles(featuredData)
        setSpecialArticles(specialData)
        setRecentArticles(recentData)
        setAllArticles(allData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('[v0] Error loading home page:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
            <div className="animate-pulse space-y-8">
              {/* Hero Section Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-4">
                  <div className="h-32 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
                <div className="md:col-span-2">
                  <div className="h-96 bg-muted rounded-lg"></div>
                </div>
                <div className="md:col-span-1 space-y-4">
                  <div className="h-32 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
              </div>
              {/* Transitional Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">ত্রুটি ঘটেছে</h1>
            <p className="text-muted-foreground">পৃষ্ঠা লোড করতে ত্রুটি হয়েছে। দয়া করে পরে চেষ্টা করুন।</p>
          </div>
        </main>
      </>
    )
  }

  const mainArticle = leadArticles[0]
  const specialArticlesList = specialArticles.slice(0, 4) // SP-1 to SP-4
  const transitionalArticles = featuredArticles.slice(4, 8) // SP-5 to SP-8

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        {/* Top Ad Grid - Between Nav and Lead News */}
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AdRenderer
              slotName="top-ad-1"
              className="min-h-24"
              imageClassName="rounded-lg overflow-hidden bg-muted"
            />
            <AdRenderer
              slotName="top-ad-2"
              className="min-h-24"
              imageClassName="rounded-lg overflow-hidden bg-muted"
            />
            <AdRenderer
              slotName="top-ad-3"
              className="min-h-24"
              imageClassName="rounded-lg overflow-hidden bg-muted"
            />
            <AdRenderer
              slotName="top-ad-4"
              className="min-h-24"
              imageClassName="rounded-lg overflow-hidden bg-muted"
            />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {/* 1. Three-Column Hero Grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Left Sidebar - Ad + SP-1 + SP-3 */}
            <div className="space-y-4">
              {/* Advertisement Slot - left-sidebar */}
              <AdRenderer
                slotName="left-sidebar"
                className="min-h-32"
                imageClassName="rounded-lg overflow-hidden bg-muted"
              />
              
              {/* Special News SP-1 */}
              {specialArticlesList[0] && (
                <article className="group">
                  <a href={`/article/${specialArticlesList[0].slug}`}>
                    <div className="relative h-40 w-full overflow-hidden rounded bg-muted mb-3">
                      <img
                        src={specialArticlesList[0].imageUrl}
                        alt={specialArticlesList[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {specialArticlesList[0].title}
                    </h3>
                  </a>
                </article>
              )}
              
              {/* Special News SP-3 */}
              {specialArticlesList[2] && (
                <article className="group pt-4 border-t">
                  <a href={`/article/${specialArticlesList[2].slug}`}>
                    <div className="relative h-32 w-full overflow-hidden rounded bg-muted mb-3">
                      <img
                        src={specialArticlesList[2].imageUrl}
                        alt={specialArticlesList[2].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-3 group-hover:text-primary transition-colors">
                      {specialArticlesList[2].title}
                    </h3>
                  </a>
                </article>
              )}
            </div>

            {/* Center Column - Lead Article */}
            <div className="md:col-span-2">
              {mainArticle && (
                <article className="group text-center">
                  <a href={`/article/${mainArticle.slug}`} className="group">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {mainArticle.title}
                    </h1>
                  </a>
                  <p className="text-foreground text-base mb-4 line-clamp-2 max-w-lg mx-auto">
                    {mainArticle.excerpt}
                  </p>
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={mainArticle.imageUrl}
                      alt={mainArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </article>
              )}
            </div>

            {/* Right Sidebar - Ad + SP-2 + SP-4 */}
            <div className="space-y-4">
              {/* Advertisement Slot - right-sidebar */}
              <AdRenderer
                slotName="right-sidebar"
                className="min-h-32"
                imageClassName="rounded-lg overflow-hidden bg-muted"
              />
              
              {/* Special News SP-2 */}
              {specialArticlesList[1] && (
                <article className="group">
                  <a href={`/article/${specialArticlesList[1].slug}`}>
                    <div className="relative h-40 w-full overflow-hidden rounded bg-muted mb-3">
                      <img
                        src={specialArticlesList[1].imageUrl}
                        alt={specialArticlesList[1].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {specialArticlesList[1].title}
                    </h3>
                  </a>
                </article>
              )}
              
              {/* Special News SP-4 */}
              {specialArticlesList[3] && (
                <article className="group pt-4 border-t">
                  <a href={`/article/${specialArticlesList[3].slug}`}>
                    <div className="relative h-32 w-full overflow-hidden rounded bg-muted mb-3">
                      <img
                        src={specialArticlesList[3].imageUrl}
                        alt={specialArticlesList[3].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-3 group-hover:text-primary transition-colors">
                      {specialArticlesList[3].title}
                    </h3>
                  </a>
                </article>
              )}
            </div>
          </section>

          {/* 2. Transitional Grid (Middle Row) - SP-5 to SP-8 */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {transitionalArticles.map((article, index) => (
              <article key={article.docId} className="group">
                <a href={`/article/${article.slug}`}>
                  <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted mb-4">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                </a>
              </article>
            ))}
          </section>

          {/* 3. Category Specific Rows */}
          {categories.slice(0, 3).map((category, catIndex) => {
            const categoryArticles = allArticles.filter(article => article.categoryId === category.id).slice(0, 7)
            const leadCategoryArticle = categoryArticles[0]
            const listCategoryArticles = categoryArticles.slice(1, 7)
            
            return (
              <section key={category.id} className="mb-8">
                {/* Category Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground border-b pb-3 flex-1">
                    {category.name}
                  </h2>
                  <a
                    href={`/category/${category.slug}`}
                    className="text-primary hover:underline text-sm font-medium ml-4 whitespace-nowrap"
                  >
                    সব দেখুন →
                  </a>
                </div>

                {/* Multi-Ad Break - 3 ads per category row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <AdRenderer
                    slotName={`category-row-${catIndex + 1}-1`}
                    className="min-h-20"
                    imageClassName="rounded-lg overflow-hidden bg-muted"
                  />
                  <AdRenderer
                    slotName={`category-row-${catIndex + 1}-2`}
                    className="min-h-20"
                    imageClassName="rounded-lg overflow-hidden bg-muted"
                  />
                  <AdRenderer
                    slotName={`category-row-${catIndex + 1}-3`}
                    className="min-h-20"
                    imageClassName="rounded-lg overflow-hidden bg-muted"
                  />
                </div>

                {/* Lead + List Combo */}
                {categoryArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Lead Thumbnail + Heading (First Column) */}
                    {leadCategoryArticle && (
                      <div className="md:col-span-1">
                        <article className="group">
                          <a href={`/article/${leadCategoryArticle.slug}`}>
                            <div className="relative h-40 w-full overflow-hidden rounded bg-muted mb-3">
                              <img
                                src={leadCategoryArticle.imageUrl}
                                alt={leadCategoryArticle.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {leadCategoryArticle.title}
                            </h3>
                          </a>
                        </article>
                      </div>
                    )}

                    {/* Stacked Articles with Images (Next Three Columns) */}
                    <div className="md:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {listCategoryArticles.map((article, index) => (
                          <article key={article.docId} className="group">
                            <a href={`/article/${article.slug}`}>
                              <div className="relative h-32 w-full overflow-hidden rounded bg-muted mb-2">
                                <img
                                  src={article.imageUrl}
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <h4 className="font-semibold text-sm line-clamp-3 group-hover:text-primary transition-colors">
                                {article.title}
                              </h4>
                            </a>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">এই ক্যাটাগরিতে কোন নিবন্ধ পাওয়া যায়নি।</p>
                  </div>
                )}
              </section>
            )
          })}

          {/* Large Advertisement Section - bottom-banner */}
          <section className="mb-8">
            <AdRenderer
              slotName="bottom-banner"
              className="min-h-40"
              imageClassName="rounded-lg overflow-hidden bg-muted w-full"
            />
          </section>

          {/* Additional Recent Articles */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground border-b pb-3">
              সর্বশেষ সংবাদ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentArticles.slice(0, 8).map((article) => (
                <ArticleCard key={article.docId} article={article} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default HomePage
