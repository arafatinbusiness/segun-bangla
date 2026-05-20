'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getArticleBySlug, getRecentArticles } from '@/lib/services/article-queries'
import { getAllCategories, getSubcategoriesByCategory } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import type { FirestoreArticle, Category, Subcategory } from '@/lib/types'

function ArticlePage() {
  const params = useParams()
  // Decode URL-encoded characters (e.g., %25 -> %) so slugs with special chars work
  const rawSlug = params?.slug as string
  const slug = rawSlug ? decodeURIComponent(rawSlug) : ''

  const [article, setArticle] = useState<FirestoreArticle | null>(null)
  const [recentArticles, setRecentArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
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

        // Load subcategories for the article's categories
        if (articleData.categoryIds && articleData.categoryIds.length > 0) {
          const subsResults = await Promise.all(
            articleData.categoryIds.map(catId => getSubcategoriesByCategory(catId))
          )
          setSubcategories(subsResults.flat())
        }
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
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Article Header */}
          <article>
            <div className="mb-8">
              {/* Category & Subcategory Breadcrumb */}
              {article.categoryIds && article.categoryIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {article.categoryIds.map((catId, idx) => {
                    const cat = categories.find(c => c.id === catId)
                    if (!cat) return null
                    return (
                      <span key={catId} className="flex items-center gap-2">
                        {idx > 0 && <span className="text-muted-foreground/40">|</span>}
                        <a
                          href={`/category/${cat.slug}`}
                          className="text-[#FF0000] text-xs font-bold uppercase tracking-wider hover:underline"
                        >
                          {cat.name}
                        </a>
                      </span>
                    )
                  })}
                  {article.subcategoryIds && article.subcategoryIds.length > 0 && article.categoryIds && (
                    <>
                      <span className="text-muted-foreground/40 mx-1">›</span>
                      {article.subcategoryIds.map((subId, idx) => {
                        const sub = subcategories.find(s => s.id === subId)
                        const parentCat = categories.find(c => article.categoryIds!.includes(c.id!))
                        const subSlug = sub?.slug || subId
                        return (
                          <span key={subId} className="flex items-center gap-2">
                            {idx > 0 && <span className="text-muted-foreground/40">|</span>}
                            <a
                              href={parentCat ? `/category/${parentCat.slug}/${subSlug}` : '#'}
                              className="text-[#FF0000] text-xs font-bold uppercase tracking-wider hover:underline"
                            >
                              {sub?.name || subId}
                            </a>
                          </span>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
              {/* Shoulder - Above title (separate line) */}
              {article.shoulder && (
                <div className="mb-3">
                  <span
                    className="inline-block font-bold uppercase tracking-wider px-3 py-1.5 rounded-md"
                    style={{
                      backgroundColor: article.shoulderColor ? `${article.shoulderColor}1A` : '#fee2e2',
                      color: article.shoulderTextColor || article.shoulderColor || '#dc2626',
                      fontSize: article.shoulderFontSize === 'xs' ? '0.75rem' :
                                article.shoulderFontSize === 'sm' ? '0.875rem' :
                                article.shoulderFontSize === 'base' ? '1rem' :
                                article.shoulderFontSize === 'lg' ? '1.125rem' :
                                article.shoulderFontSize === 'xl' ? '1.25rem' : '0.875rem',
                    }}
                  >
                    {article.shoulder}
                  </span>
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground leading-tight">
                {article.title}
              </h1>
              {/* Bullet Points - Right after title (plain, no background/bar) */}
              {article.bulletPoints && article.bulletPoints.length > 0 && article.bulletPoints.some(b => b.trim()) && (
                <div className="mb-4">
                  <ul className="space-y-1.5 list-disc list-inside">
                    {article.bulletPoints.filter(b => b.trim()).map((point, idx) => (
                      <li key={idx} style={{
                        color: article.bulletColor || '#374151',
                        fontSize: article.bulletFontSize === 'xs' ? '0.75rem' :
                                  article.bulletFontSize === 'sm' ? '0.875rem' :
                                  article.bulletFontSize === 'base' ? '1rem' :
                                  article.bulletFontSize === 'lg' ? '1.125rem' :
                                  article.bulletFontSize === 'xl' ? '1.25rem' : '0.875rem',
                      }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Byline, Date & Views */}
              <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mb-4 pb-4 border-b">
                {article.reporterName ? (
                  <span className="flex items-center gap-2">
                    {article.reporterImage && (
                      <img
                        src={article.reporterImage}
                        alt={article.reporterName}
                        className="w-6 h-6 rounded-full object-cover border"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    )}
                    <span className="font-medium text-primary">{article.reporterName}</span>
                  </span>
                ) : article.source ? (
                  <span className="font-medium text-primary">{article.source}</span>
                ) : null}
                {(article.reporterName || article.source) && <span>•</span>}
                <span>{publishDate}</span>
                <span>•</span>
                <span>{article.viewCount} ভিউ</span>
              </div>
              {/* Excerpt (সংক্ষিপ্ত বর্ণনা) - After ticker */}
              {article.excerpt && (
                <p className="text-lg mb-6 font-semibold leading-relaxed" style={{ color: article.excerptColor || 'inherit' }}>
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Featured Image - Always centered, full article width */}
            {article.imageUrl && (
              <div className="w-full mb-8 flex justify-center">
                <div className={`relative rounded-lg overflow-hidden bg-muted ${
                  article.imageSize === 'portrait' ? 'max-w-sm w-full' :
                  article.imageSize === 'square' ? 'max-w-sm w-full' :
                  article.imageSize === 'full' ? 'w-full' : 'w-full'
                }`}>
                  <div className={`${
                    article.imageSize === 'portrait' ? 'aspect-[3/4]' :
                    article.imageSize === 'square' ? 'aspect-square' :
                    article.imageSize === 'full' ? '' : 'aspect-video'
                  }`}>
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: article.imageFocus?.replace(/-/g, ' ') || 'center' }}
                    />
                  </div>
                  {/* Image Caption */}
                  {article.imageCaption && (
                    <p className={`text-xs text-muted-foreground py-1.5 px-3 bg-muted/50 border-t italic ${
                      (article.imageCaptionAlign || 'left') === 'center' ? 'text-center' :
                      (article.imageCaptionAlign || 'left') === 'right' ? 'text-right' : 'text-left'
                    }`}>
                      {article.imageCaption}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Article Content - Fixed Grid Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 min-w-0">
                <div className="prose prose-sm max-w-none">
                  <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed article-content">
                    <div dangerouslySetInnerHTML={{ __html: article.content.replace(/text-align:\s*justify/gi, 'text-align: left') }} />
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

              {/* Sidebar - Fixed width, no overflow */}
              <aside className="w-full lg:w-80 shrink-0">
                {/* Related Articles */}
                <div className="bg-muted p-5 rounded-lg">
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
