'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { getArticleBySlug, getRecentArticles } from '@/lib/services/article-queries'
import { getAllCategories, getSubcategoriesByCategory } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import { SocialShare } from '@/components/social-share'
import type { FirestoreArticle, Category, Subcategory } from '@/lib/types'

interface ArticleClientProps {
  initialSlug: string
}

export function ArticleClient({ initialSlug }: ArticleClientProps) {
  const params = useParams()
  // Decode URL-encoded characters (e.g., %25 -> %) so slugs with special chars work
  const rawSlug = params?.slug as string
  const slug = rawSlug ? decodeURIComponent(rawSlug) : initialSlug

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

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.segunbangla.com'
  const articleUrl = typeof window !== 'undefined' ? window.location.href : `${siteUrl}/article/${slug}`

  // NewsArticle JSON-LD
  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.imageUrl || `${siteUrl}/logo.png`,
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
    author: [{
      '@type': 'Person',
      name: article.reporterName || article.source || 'সেগুন বাংলা',
    }],
    publisher: {
      '@type': 'Organization',
      name: 'সেগুন বাংলা',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: article.categoryIds?.map(id => {
      const cat = categories.find(c => c.id === id)
      return cat?.name
    }).filter(Boolean).join(', '),
    keywords: article.tags?.join(', '),
    wordCount: article.content ? Math.floor(article.content.replace(/<[^>]*>/g, '').split(/\s+/).length) : 0,
    inLanguage: 'bn-BD',
    locationCreated: 'Bangladesh',
  }

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
        />
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Article Header */}
          <article className="article-page">
            <div className="mb-8">
              {/* Category + Subcategory Breadcrumb */}
              {(article.categoryIds && article.categoryIds.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {article.categoryIds.map((catId, idx) => {
                    const cat = categories.find(c => c.id === catId)
                    if (!cat) return null
                    const relatedSubs = subcategories.filter(s => s.categoryId === catId)
                    const articleSubs = (article.subcategoryIds || [])
                      .map(subId => relatedSubs.find(s => s.id === subId))
                      .filter((s): s is Subcategory => Boolean(s))
                    return (
                      <span key={catId} className="flex flex-wrap items-center gap-2">
                        {idx > 0 && <span className="text-muted-foreground/40 text-lg">|</span>}
                        <a
                          href={`/category/${cat.slug}`}
                          className="inline-block text-[#FF0000] text-base font-extrabold uppercase tracking-wide hover:underline hover:text-[#CC0000] transition-colors px-3 py-1 rounded-md bg-red-50 hover:bg-red-100"
                        >
                          {cat.name}
                        </a>
                        {articleSubs.length > 0 && articleSubs.map((sub) => (
                          <span key={sub.id} className="flex items-center gap-2">
                            <span className="text-muted-foreground/40 text-lg">/</span>
                            <a
                              href={`/category/${cat.slug}/${sub.slug}`}
                              className="inline-block text-base font-bold text-[#8B0000] hover:text-[#FF0000] transition-colors px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                            >
                              {sub.name}
                            </a>
                          </span>
                        ))}
                      </span>
                    )
                  })}
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
              {/* Source + Share Bar - Two column layout */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                {/* Left: Source Logo + Name + Date */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border shrink-0 flex items-center justify-center">
                    <Image
                      src="/favicon.png"
                      alt="সেগুন বাংলা"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground leading-tight">
                      {article.reporterName || article.source || 'আন্তর্জাতিক ডেস্ক'}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight mt-0.5">
                      প্রকাশ: {publishDate}
                    </span>
                  </div>
                </div>
                {/* Right: Share Counter + Social Icons */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {article.viewCount || 0} ভিউ
                  </span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Facebook এ শেয়ার করুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Twitter/X এ শেয়ার করুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(article.title)}%20${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="WhatsApp এ শেয়ার করুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              {/* Excerpt (সংক্ষিপ্ত বর্ণনা) - After ticker */}
              {article.excerpt && (
                <p className="text-lg mb-6 font-semibold leading-relaxed excerpt-text" style={{ color: article.excerptColor || 'inherit' }}>
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
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1024px"
                      className="object-cover"
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

                {/* Social Share - Temporarily hidden */}
                {/* <SocialShare
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={article.title}
                  description={article.excerpt}
                /> */}
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
