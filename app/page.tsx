'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getLeadArticles, getFeaturedArticles, getSpecialArticles, getRecentArticles, getAllArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { AdRenderer } from '@/components/ad-renderer'
import { NewsSlider } from '@/components/news-slider'
import { useTheme } from '@/components/theme-provider'
import type { FirestoreArticle } from '@/lib/types'
import type { Category } from '@/lib/types'

interface ExcerptConfig {
  heroExcerpt: boolean
  leadExcerpt: boolean
  transitionalExcerpt: boolean
  extraExcerpt: boolean
  categoryLeadExcerpt: boolean
  categoryListExcerpt: boolean
  extraLineClamp: number
  extraFontSize: string
  extraHeadingLineClamp: number
  extraAutoProportion: boolean
}

const DEFAULT_EXCERPT: ExcerptConfig = {
  heroExcerpt: true, leadExcerpt: true, transitionalExcerpt: true,
  extraExcerpt: true, categoryLeadExcerpt: true, categoryListExcerpt: true,
  extraLineClamp: 6,
  extraFontSize: 'text-sm',
  extraHeadingLineClamp: 2,
  extraAutoProportion: false,
}

// Total lines available for heading + excerpt combined (for auto proportion)
const EXTRA_TOTAL_LINES = 8

function HomePage() {
  const { template } = useTheme()
  const [leadArticles, setLeadArticles] = useState<FirestoreArticle[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<FirestoreArticle[]>([])
  const [specialArticles, setSpecialArticles] = useState<FirestoreArticle[]>([])
  const [recentArticles, setRecentArticles] = useState<FirestoreArticle[]>([])
  const [allArticles, setAllArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [excerptConfig, setExcerptConfig] = useState<ExcerptConfig>(DEFAULT_EXCERPT)
  const [sliderConfig, setSliderConfig] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel to minimize Firestore reads
        const [leadData, featuredData, specialData, recentData, allData, categoriesData, excerptSnap, sliderSnap] = await Promise.all([
          getLeadArticles(1),
          getFeaturedArticles(5).catch(() => []), // reduced from 10
          getSpecialArticles(50),
          getRecentArticles(10).catch(() => []), // reduced from 20
          getAllArticles(200).catch(() => []),
          getAllCategories(),
          getDoc(doc(db, 'settings', 'homepage-excerpts')).catch(() => null),
          getDoc(doc(db, 'settings', 'category-sliders')).catch(() => null),
        ])
        setLeadArticles(leadData || [])
        setFeaturedArticles(featuredData || [])
        setSpecialArticles(specialData || [])
        setRecentArticles(recentData || [])
        setAllArticles(allData || [])
        setCategories(categoriesData || [])
        if (excerptSnap?.exists()) {
          setExcerptConfig({ ...DEFAULT_EXCERPT, ...excerptSnap.data() as Partial<ExcerptConfig> })
        }
        if (sliderSnap?.exists()) {
          setSliderConfig(sliderSnap.data() as Record<string, boolean>)
        }
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

  // Merge lead + special into a single 12-slot array ordered by isSpecialOrder (same as tool)
  const allSlots: (FirestoreArticle | null)[] = new Array(12).fill(null)
  const allLeadAndSpecial = allArticles.filter(a => a.isLead || a.isSpecial)
  for (const a of allLeadAndSpecial) {
    const order = (a as any).isSpecialOrder
    if (typeof order === 'number' && order >= 0 && order < 12) {
      allSlots[order] = a
    }
  }

  const mainArticle = allSlots[0]
  const specialArticlesList = [
    allSlots[1], allSlots[2], allSlots[3], allSlots[4]

  ].filter(Boolean) as FirestoreArticle[]
  // Transitional/Dedicated row (before jatiyo) = SP-5 to SP-8 from tool slots 7,8,9,10
  const transitionalArticles = [allSlots[7], allSlots[8], allSlots[9], allSlots[10]].filter(Boolean) as FirestoreArticle[] // SP-5 to SP-8
  // EXTRA-1 (left), EXTRA-2 (right) below lead = from allSlots[5] and allSlots[6] (same as tool)
  const extraArticles = [allSlots[5], allSlots[6]].filter((a): a is FirestoreArticle => !!a)
  const isProthomAlo = template.layout === 'prothom-alo'
  const isNewsGrid = template.layout === 'news-grid'

  if (isNewsGrid) {
    return (
      <>
        <Header categories={categories} />
        <main className="min-h-screen bg-white text-[#1A1A1A]">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {mainArticle && (
              <div className="mb-6 pb-4 border-b border-gray-200">
                <a href={`/article/${mainArticle.slug}`} className="block group">
                  <div className="aspect-video bg-gray-100 mb-3">
                    {mainArticle.imageUrl && <img src={mainArticle.imageUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] leading-tight mb-2">{mainArticle.title}</h1>
                  {excerptConfig.leadExcerpt && <p className="text-sm text-[#4A4A4A]">{mainArticle.excerpt}</p>}
                </a>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 border-l border-r border-gray-200 divide-x-0 md:divide-x divide-gray-200">
              {/* Col 1: Latest */}
              <div className="md:col-span-1 px-4 py-3">
                <h2 className="text-[10px] font-bold text-[#C00000] uppercase tracking-wider mb-4">সর্বশেষ</h2>
                {recentArticles.slice(0, 6).map((article) => (
                  <div key={article.docId} className="py-3 border-b border-gray-100 last:border-b-0">
                    <a href={`/article/${article.slug}`} className="flex gap-3 group">
                      {article.imageUrl && <div className="w-14 h-14 shrink-0 bg-gray-100"><img src={article.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[12px] font-bold leading-[1.4] text-[#1A1A1A] line-clamp-3 group-hover:text-[#C00000]">{article.title}</h3>
                        <p className="text-[9px] text-[#888] mt-1.5">৪ ঘণ্টা আগে</p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
              <div className="md:col-span-2 px-3 py-2 border-r border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">{specialArticlesList.slice(0, 3).map((a) => (
                  <div key={a.docId} className="border-b border-gray-200 pb-3"><a href={`/article/${a.slug}`} className="block group">
                    <div className="aspect-video bg-gray-100 mb-2">{a.imageUrl && <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                    <h3 className="text-sm font-bold leading-snug line-clamp-2">{a.title}</h3>
                    {excerptConfig.heroExcerpt && <p className="text-[11px] text-[#4A4A4A] mt-1">{a.excerpt}</p>}
                  </a></div>
                ))}</div>
                <div className="divide-y divide-gray-200">{[...specialArticlesList.slice(3), ...extraArticles].filter(Boolean).map((a: FirestoreArticle) => (
                  <div key={a.docId} className="py-3"><a href={`/article/${a.slug}`} className="flex gap-3 group">
                    <div className="flex-1"><h3 className="text-sm font-bold leading-snug">{a.title}</h3></div>
                    {a.imageUrl && <div className="w-20 h-16 shrink-0 bg-gray-100"><img src={a.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                  </a></div>
                ))}</div>
              </div>
              <div className="md:col-span-1 px-3 py-2">
                <AdRenderer slotName="right-sidebar" className="min-h-24 mb-4 border border-gray-200 bg-gray-50 flex items-center justify-center" imageClassName="rounded" />
                {transitionalArticles.length > 0 && (<div><h2 className="text-[11px] font-bold text-[#C00000] uppercase mb-3">বিশেষ</h2>
                  <div className="divide-y divide-gray-200">{transitionalArticles.map((a) => (
                    <div key={a.docId} className="py-3"><a href={`/article/${a.slug}`} className="flex gap-3 group">
                      {a.imageUrl && <div className="w-16 h-16 shrink-0 bg-gray-100"><img src={a.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                      <div className="flex-1"><h3 className="text-[13px] font-bold leading-snug">{a.title}</h3></div>
                    </a></div>
                  ))}</div>
                </div>)}
              </div>
            </div>

            {/* Category Sections */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {categories.filter(cat => allArticles.some(a => a.categoryIds?.includes(cat.id) || a.categoryId === cat.id)).slice(0, 3).map((cat, ci) => {
                const arts = allArticles.filter(a => a.categoryIds?.includes(cat.id) || a.categoryId === cat.id).slice(0, 7)
                const lead = arts[0]; const list = arts.slice(1, 7)
                if (arts.length === 0) return null
                return (
                  <section key={cat.id} className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <a href={`/category/${cat.slug}`}><h2 className="text-base font-bold border-l-3 border-[#C00000] pl-2">{cat.name}</h2></a>
                      <a href={`/category/${cat.slug}`} className="text-[10px] text-[#888] hover:text-[#C00000]">সব দেখুন →</a>
                    </div>
                    <AdRenderer slotName={`category-row-${ci + 1}-1`} className="min-h-16 mb-4" imageClassName="rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {lead && <div className="md:col-span-1"><a href={`/article/${lead.slug}`}>
                        <div className="aspect-video bg-gray-100 mb-2">{lead.imageUrl && <img src={lead.imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                        <h3 className="text-sm font-bold leading-snug">{lead.title}</h3>
                        {excerptConfig.categoryLeadExcerpt && <p className="text-[11px] text-[#4A4A4A] mt-1">{lead.excerpt}</p>}
                      </a></div>}
                      <div className="md:col-span-3"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{list.map((a) => (
                        <div key={a.docId} className="border-b border-gray-200 pb-2"><a href={`/article/${a.slug}`}>
                          <div className="aspect-video bg-gray-100 mb-1">{a.imageUrl && <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                          <h3 className="text-[13px] font-bold leading-snug">{a.title}</h3>
                          {excerptConfig.categoryListExcerpt && <p className="text-[11px] text-[#4A4A4A] mt-1">{a.excerpt}</p>}
                        </a></div>
                      ))}</div></div>
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (isProthomAlo) {
    return (
      <>
        <Header categories={categories} />
        <main className="min-h-screen bg-background">
          <div className="max-w-6xl mx-auto px-3 py-4">
            {/* Top - 3 Column Grid */}
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {mainArticle && (
                  <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-gray-200 pr-0 md:pr-4 mb-4 md:mb-0">
                    <a href={`/article/${mainArticle.slug}`} className="block group">
                      <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A] leading-tight mb-2">{mainArticle.title}</h1>
                      <div className="aspect-video bg-gray-100 mb-2">
                        {mainArticle.imageUrl && <img src={mainArticle.imageUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      {excerptConfig.leadExcerpt && <p className="text-xs text-[#444]">{mainArticle.excerpt}</p>}
                    </a>
                  </div>
                )}
                <div className="md:col-span-1 divide-y divide-gray-200">
                  {specialArticlesList.slice(0, 4).map((article) => (
                    <div key={article.docId} className="py-3 first:pt-0">
                      <a href={`/article/${article.slug}`} className="flex gap-3 group">
                        {article.imageUrl && <div className="w-20 h-20 shrink-0 bg-gray-100"><img src={article.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-[#1A1A1A] leading-snug line-clamp-3">{article.title}</h3>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Dedicated Row */}
            {transitionalArticles.length > 0 && (
              <section className="mb-6 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {transitionalArticles.map((article) => (
                    <div key={article.docId} className="border-b border-gray-200 pb-3">
                      <a href={`/article/${article.slug}`} className="block group">
                        <div className="aspect-video bg-gray-100 mb-1">
                          {article.imageUrl && <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <h3 className="text-sm font-bold text-[#1A1A1A]">{article.title}</h3>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {categories.filter(cat => allArticles.some(a => a.categoryIds?.includes(cat.id) || a.categoryId === cat.id)).slice(0, 3).map((category) => {
              const catArticles = allArticles.filter(a => a.categoryIds?.includes(category.id) || a.categoryId === category.id).slice(0, 5)
              if (catArticles.length === 0) return null
              return (
                <section key={category.id} className="mb-6 border-t border-gray-200 pt-4">
                  <a href={`/category/${category.slug}`} className="inline-block mb-3"><h2 className="text-base font-bold border-l-3 border-[#CC0000] pl-2">{category.name}</h2></a>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {catArticles.slice(0, 3).map((article) => (
                      <div key={article.docId} className="border-b border-gray-200 pb-2">
                        <a href={`/article/${article.slug}`} className="block group">
                          {article.imageUrl && <div className="aspect-video bg-gray-100 mb-1"><img src={article.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                          <h3 className="text-sm font-bold text-[#1A1A1A]">{article.title}</h3>
                          {excerptConfig.categoryListExcerpt && <p className="text-xs text-[#444] mt-1">{article.excerpt}</p>}
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        {/* Top Leaderboard Ad - Between Nav and Lead News */}
        <section className="max-w-7xl mx-auto px-4 py-5 md:py-6">
          <div className="relative border border-gray-200 rounded-lg bg-[#F8F9FA] overflow-hidden">
            {/* "Advertisement" label */}
            <span className="absolute top-1 right-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium z-10">
              Advertisement
            </span>
            <AdRenderer
              slotName="top-ad-1"
              className="w-full min-h-[100px] md:min-h-[90px] flex items-center justify-center"
              imageClassName="w-full h-full object-contain"
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
                    <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">

                      {specialArticlesList[0].imageUrl ? (
                        <img
                          src={specialArticlesList[0].imageUrl}
                          alt={specialArticlesList[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </div>
                      )}

                    </div>
                    <h3 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
                      {specialArticlesList[0].shoulder ? (
                        <>
                          <span className="theme-shoulder" style={{ color: specialArticlesList[0].shoulderTextColor || specialArticlesList[0].shoulderColor || 'var(--theme-primary)' }}>{specialArticlesList[0].shoulder}</span>
                          <span className="theme-shoulder mx-1.5" style={{ color: specialArticlesList[0].shoulderTextColor || specialArticlesList[0].shoulderColor || 'var(--theme-primary)' }}>•</span>
                        </>
                      ) : null}
                      {specialArticlesList[0].title}
                    </h3>
                    <p
                      className="text-[#444444] text-sm mt-1 leading-relaxed"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {excerptConfig.heroExcerpt && specialArticlesList[0].excerpt}
                    </p>
                  </a>
                </article>
              )}
              
              {/* Special News SP-3 */}
              {specialArticlesList[2] && (
                <article className="group pt-4 border-t border-[#f0f0f0]">
                  <a href={`/article/${specialArticlesList[2].slug}`}>
                    <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">

                      {specialArticlesList[2].imageUrl ? (
                        <img
                          src={specialArticlesList[2].imageUrl}
                          alt={specialArticlesList[2].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </div>
                      )}
                    </div>

                    <h3 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
                      {specialArticlesList[2].shoulder ? (
                        <>
                          <span className="text-[#FF0000]" style={{ color: specialArticlesList[2].shoulderTextColor || specialArticlesList[2].shoulderColor || '#FF0000' }}>{specialArticlesList[2].shoulder}</span>
                          <span className="text-[#FF0000] mx-1.5" style={{ color: specialArticlesList[2].shoulderTextColor || specialArticlesList[2].shoulderColor || '#FF0000' }}>•</span>
                        </>
                      ) : null}
                      {specialArticlesList[2].title}
                    </h3>
                    <p
                      className="text-[#444444] text-sm mt-1 leading-relaxed"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {excerptConfig.heroExcerpt && specialArticlesList[2].excerpt}
                    </p>
                  </a>
                </article>
              )}
            </div>

            {/* Center Column - Lead Article + 2 more articles below */}
            <div className="md:col-span-2 space-y-4">
              {mainArticle && (
                <article className="group text-center">
                  <a href={`/article/${mainArticle.slug}`} className="group">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {mainArticle.title}
                    </h1>
                  </a>
                  {excerptConfig.leadExcerpt && (
                  <p className="text-foreground text-base mb-4 line-clamp-2 max-w-lg mx-auto">
                    {mainArticle.excerpt}
                  </p>
                  )}
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-muted">
                    {mainArticle.imageUrl ? (
                      <img
                        src={mainArticle.imageUrl}
                        alt={mainArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    )}
                  </div>

                </article>
              )}
              
              {/* 2 more articles below the lead image (EXTRA-1, EXTRA-2 from slots) */}
              {(() => {
                const extraArticlesForGrid = extraArticles.length > 0 ? extraArticles : []
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extraArticles.map((article) => {
                      // When auto proportion is ON, use a fixed-height text container
                      // so both cards always end at the same imaginary line
                      const useAuto = excerptConfig.extraAutoProportion
                      
                      return (
                      <article key={article.docId} className="group flex flex-col">
                        <a href={`/article/${article.slug}`} className="flex flex-col flex-1">
                          <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">
                            {article.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                              </div>
                            )}
                          </div>

                          {/* Text container: fixed height when auto proportion is ON */}
                          <div className={useAuto ? 'h-[65px] overflow-hidden flex flex-col' : ''}>
                            <h3
                              className="text-[#000000] font-bold text-sm leading-tight mt-1 group-hover:text-[#FF0000] transition-colors"
                              style={{
                                display: '-webkit-box',
                                // When auto proportion is ON and article has a shoulder,
                                // reduce heading clamp to 2 since shoulder takes extra space
                                WebkitLineClamp: useAuto ? (article.shoulder ? 2 : 3) : (excerptConfig.extraHeadingLineClamp || 2),
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {article.shoulder ? (
                                <>
                                  <span className="text-[#FF0000]" style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}>{article.shoulder}</span>
                                  <span className="text-[#FF0000] mx-1.5" style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}>•</span>
                                </>
                              ) : null}
                              {article.title}
                            </h3>
                            <p
                              className={`text-[#444444] ${excerptConfig.extraFontSize || 'text-sm'} mt-1 leading-relaxed flex-1`}
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: useAuto ? 10 : (excerptConfig.extraLineClamp || 6),
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {excerptConfig.extraExcerpt && article.excerpt}
                            </p>
                          </div>
                        </a>
                      </article>
                      )
                    })}
                  </div>
                )
              })()}
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
                  <a href={`/article/${specialArticlesList[1]!.slug}`}>
                    <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">

                      {specialArticlesList[1]!.imageUrl ? (
                        <img
                          src={specialArticlesList[1]!.imageUrl}
                          alt={specialArticlesList[1]!.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </div>
                      )}
                    </div>

                    <h3 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
                      {specialArticlesList[1]!.shoulder ? (
                        <>
                          <span className="text-[#FF0000]" style={{ color: specialArticlesList[1]!.shoulderTextColor || specialArticlesList[1]!.shoulderColor || '#FF0000' }}>{specialArticlesList[1]!.shoulder}</span>
                          <span className="text-[#FF0000] mx-1.5" style={{ color: specialArticlesList[1]!.shoulderTextColor || specialArticlesList[1]!.shoulderColor || '#FF0000' }}>•</span>
                        </>
                      ) : null}
                      {specialArticlesList[1]!.title}
                    </h3>
                    <p
                      className="text-[#444444] text-sm mt-1 leading-relaxed"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {excerptConfig.heroExcerpt && specialArticlesList[1]!.excerpt}
                    </p>
                  </a>
                </article>
              )}
              
              {/* Special News SP-4 */}
              {specialArticlesList[3] && (
                <article className="group pt-4 border-t border-[#f0f0f0]">
                  <a href={`/article/${specialArticlesList[3]!.slug}`}>
                    <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">

                      {specialArticlesList[3]!.imageUrl ? (
                        <img
                          src={specialArticlesList[3]!.imageUrl}
                          alt={specialArticlesList[3]!.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        </div>
                      )}
                    </div>

                    <h3 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
                      {specialArticlesList[3]!.shoulder ? (
                        <>
                          <span className="text-[#FF0000]" style={{ color: specialArticlesList[3]!.shoulderTextColor || specialArticlesList[3]!.shoulderColor || '#FF0000' }}>{specialArticlesList[3]!.shoulder}</span>
                          <span className="text-[#FF0000] mx-1.5" style={{ color: specialArticlesList[3]!.shoulderTextColor || specialArticlesList[3]!.shoulderColor || '#FF0000' }}>•</span>
                        </>
                      ) : null}
                      {specialArticlesList[3]!.title}
                    </h3>
                    <p
                      className="text-[#444444] text-sm mt-1 leading-relaxed"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {excerptConfig.heroExcerpt && specialArticlesList[3]!.excerpt}
                    </p>
                  </a>
                </article>
              )}
            </div>
          </section>

          {/* 2. Transitional Grid (Middle Row) - SP-5 to SP-8 */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            {transitionalArticles.map((article, index) => (
              <article key={article.docId} className="group flex flex-col">
                <a href={`/article/${article.slug}`} className="flex flex-col flex-1">
                  <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">

                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    )}
                  </div>

                  <h3 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
                    {article.shoulder ? (
                      <>
                        <span className="text-[#FF0000]" style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}>{article.shoulder}</span>
                        <span className="text-[#FF0000] mx-1.5" style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}>•</span>
                      </>
                    ) : null}
                    {article.title}
                  </h3>
                  <p
                    className="text-[#444444] text-sm mt-1 leading-relaxed flex-1"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {excerptConfig.transitionalExcerpt && article.excerpt}
                  </p>
                </a>
              </article>
            ))}
          </section>

          {/* 2.5 Special News Row removed - only transitional grid SP-5 to SP-8 is shown */}

          {/* 3. Category Specific Rows - skip categories with no articles */}
          {categories
            .filter(cat => allArticles.some(article => 
              article.categoryIds?.includes(cat.id) || article.categoryId === cat.id
            ))
            .slice(0, 3)
            .map((category, catIndex) => {
            const categoryArticles = allArticles.filter(article => 
              article.categoryIds?.includes(category.id) || article.categoryId === category.id
            ).slice(0, 7)
            const leadCategoryArticle = categoryArticles[0]
            const listCategoryArticles = categoryArticles.slice(1, 7)
            
            const catArticles = categoryArticles
            const sliderEnabled = sliderConfig[category.id] !== false
            const showSlider = sliderEnabled && catArticles.length > 4

            return (
              <section key={category.id} className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0 last:mb-6">
                {/* Slider ON → show slider, hide grid */}
                {showSlider && (
                  <div className="mb-4">
                    <NewsSlider articles={catArticles} name={category.name} slug={category.slug} />
                  </div>
                )}
                {/* Slider OFF → show normal grid */}
<div style={{ display: showSlider ? "none" : "block" }}>
                <div className="flex justify-between items-center mb-4">
                  <a href={`/category/${category.slug}`} className="flex-1 group">
                    <h2 className="text-xl font-bold text-[#000000] border-l-4 theme-border pl-3 category-heading transition-colors">
                      {category.name}
                    </h2>
                  </a>
                  <a href={`/category/${category.slug}`} className="text-[#FF0000] hover:underline text-xs font-bold ml-4 whitespace-nowrap uppercase tracking-wider">
                    সব দেখুন →
                  </a>
                </div>

                {/* Multi-Ad Break - 3 ads per category row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <AdRenderer
                    slotName={`category-row-${catIndex + 1}-1`}
                    className="min-h-16"
                    imageClassName="rounded overflow-hidden bg-gray-50"
                  />
                  <AdRenderer
                    slotName={`category-row-${catIndex + 1}-2`}
                    className="min-h-16"
                    imageClassName="rounded overflow-hidden bg-gray-50"
                  />
                  <AdRenderer
                    slotName={`category-row-${catIndex + 1}-3`}
                    className="min-h-16"
                    imageClassName="rounded overflow-hidden bg-gray-50"
                  />
                </div>

                {/* Lead + List Combo */}
                {categoryArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Lead Thumbnail + Heading (First Column) - fills full height */}
                    {leadCategoryArticle && (
                      <div className="md:col-span-1 flex">
                        <article className="group flex flex-col w-full">
                          <a href={`/article/${leadCategoryArticle.slug}`} className="flex flex-col flex-1">
                            <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">
                              {leadCategoryArticle.imageUrl ? (
                                <img
                                  src={leadCategoryArticle.imageUrl}
                                  alt={leadCategoryArticle.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                </div>
                              )}
                            </div>

                            <h3 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
                              {leadCategoryArticle.shoulder ? (
                                <>
                                  <span className="text-[#FF0000]" style={{ color: leadCategoryArticle.shoulderTextColor || leadCategoryArticle.shoulderColor || '#FF0000' }}>{leadCategoryArticle.shoulder}</span>
                                  <span className="text-[#FF0000] mx-1.5" style={{ color: leadCategoryArticle.shoulderTextColor || leadCategoryArticle.shoulderColor || '#FF0000' }}>•</span>
                                </>
                              ) : null}
                              {leadCategoryArticle.title}
                            </h3>
                            <p
                              className="text-[#444444] text-sm mt-1 leading-relaxed flex-1"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 6,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {excerptConfig.categoryLeadExcerpt && leadCategoryArticle.excerpt}
                            </p>
                          </a>
                        </article>
                      </div>
                    )}

                    {/* Stacked Articles with Images (Next Three Columns) */}
                    <div className="md:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {listCategoryArticles.map((article, index) => (
                          <article key={article.docId} className="group">
                            <a href={`/article/${article.slug}`}>
                              <div className="relative w-full aspect-video overflow-hidden rounded bg-gray-100 mb-2">
                                {article.imageUrl ? (
                                  <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                  </div>
                                )}
                              </div>

                              <h4 className="text-[#000000] font-bold text-sm leading-tight line-clamp-2 mt-1 group-hover:text-[#FF0000] transition-colors">
                                {article.shoulder ? (
                                  <>
                                    <span className="text-[#FF0000]" style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}>{article.shoulder}</span>
                                    <span className="text-[#FF0000] mx-1.5" style={{ color: article.shoulderTextColor || article.shoulderColor || '#FF0000' }}>•</span>
                                  </>
                                ) : null}
                                {article.title}
                              </h4>
                              <p
                                className="text-[#444444] text-sm mt-1 leading-relaxed"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {excerptConfig.categoryListExcerpt && article.excerpt}
                              </p>
                            </a>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#444444]">এই ক্যাটাগরিতে কোন নিবন্ধ পাওয়া যায়নি।</p>
                  </div>
                )}

                {/* Faint separator between category sections */}
                {catIndex < 2 && (
                  <hr className="border-t border-[#f0f0f0] mt-6" />
                )}
              </div>
              </section>
            )
          })}

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

        {/* Bottom Banner Ad - Before Footer */}
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="relative border border-gray-200 rounded-lg bg-[#F8F9FA] overflow-hidden">
            <span className="absolute top-1 right-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium z-10">
              Advertisement
            </span>
            <AdRenderer
              slotName="bottom-banner"
              className="w-full min-h-[120px] md:min-h-[100px] flex items-center justify-center"
              imageClassName="w-full h-full object-contain"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default HomePage
               