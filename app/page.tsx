// Keep the imports and interfaces the same...
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getLeadArticles, getFeaturedArticles, getSpecialArticles, getRecentArticles, getAllArticles } from '@/lib/services/article-queries'
import { getSlotAssignments } from '@/lib/services/slot-shift'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { useTheme } from '@/components/theme-provider'
import type { FirestoreArticle } from '@/lib/types'
import type { Category } from '@/lib/types'

// Dynamically load heavy components to reduce initial bundle size
const AdRenderer = dynamic(() => import('@/components/ad-renderer').then(m => m.AdRenderer), {
  ssr: false,
  loading: () => null,
})
const NewsSlider = dynamic(() => import('@/components/news-slider').then(m => m.NewsSlider), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32" />,
})

interface ExcerptConfig {
  heroExcerpt: boolean; leadExcerpt: boolean; transitionalExcerpt: boolean
  extraExcerpt: boolean; categoryLeadExcerpt: boolean; categoryListExcerpt: boolean
  extraLineClamp: number; extraFontSize: string; extraHeadingLineClamp: number; extraAutoProportion: boolean
}
const DEFAULT_EXCERPT: ExcerptConfig = {
  heroExcerpt: true, leadExcerpt: true, transitionalExcerpt: true,
  extraExcerpt: true, categoryLeadExcerpt: true, categoryListExcerpt: true,
  extraLineClamp: 6, extraFontSize: 'text-sm', extraHeadingLineClamp: 2, extraAutoProportion: false,
}

interface TypographyConfig {
  menuFontSize: number; menuFontSizeMobile: number; menuFontWeight: 'normal' | 'bold'
  leadTitleFontSize: number; leadTitleFontSizeMobile: number
  leadExcerptFontSize: number; leadExcerptFontSizeMobile: number
  sideSlotTitleFontSize: number; sideSlotTitleFontSizeMobile: number
  sideSlotExcerptFontSize: number; sideSlotExcerptFontSizeMobile: number
  gridSlotTitleFontSize: number; gridSlotTitleFontSizeMobile: number
  gridSlotExcerptFontSize: number; gridSlotExcerptFontSizeMobile: number
  categoryRowHeadingSize: number; categoryRowHeadingSizeMobile: number
  categoryLeadArticleTitleSize: number; categoryLeadArticleTitleSizeMobile: number
  categoryArticleTitleSize: number; categoryArticleTitleSizeMobile: number
  categoryArticleExcerptSize: number; categoryArticleExcerptSizeMobile: number
  recentHeadingSize: number; recentHeadingSizeMobile: number
  recentArticleTitleSize: number; recentArticleTitleSizeMobile: number
  socialWidgetFontSize: number; socialWidgetFontSizeMobile: number
}
const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  menuFontSize: 16, menuFontSizeMobile: 14, menuFontWeight: 'bold',
  leadTitleFontSize: 22, leadTitleFontSizeMobile: 18,
  leadExcerptFontSize: 14, leadExcerptFontSizeMobile: 12,
  sideSlotTitleFontSize: 14, sideSlotTitleFontSizeMobile: 12,
  sideSlotExcerptFontSize: 12, sideSlotExcerptFontSizeMobile: 10,
  gridSlotTitleFontSize: 14, gridSlotTitleFontSizeMobile: 12,
  gridSlotExcerptFontSize: 12, gridSlotExcerptFontSizeMobile: 10,
  categoryRowHeadingSize: 24, categoryRowHeadingSizeMobile: 18,
  categoryLeadArticleTitleSize: 14, categoryLeadArticleTitleSizeMobile: 12,
  categoryArticleTitleSize: 14, categoryArticleTitleSizeMobile: 12,
  categoryArticleExcerptSize: 12, categoryArticleExcerptSizeMobile: 10,
  recentHeadingSize: 22, recentHeadingSizeMobile: 17,
  recentArticleTitleSize: 14, recentArticleTitleSizeMobile: 12,
  socialWidgetFontSize: 13, socialWidgetFontSizeMobile: 11,
}

function HomePage() {
  const { template } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const t = (desktop: number, mobile: number) => isMobile ? mobile : desktop

  const [leadArticles, setLeadArticles] = useState<FirestoreArticle[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<FirestoreArticle[]>([])
  const [specialArticles, setSpecialArticles] = useState<FirestoreArticle[]>([])
  const [recentArticles, setRecentArticles] = useState<FirestoreArticle[]>([])
  const [allArticles, setAllArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [excerptConfig, setExcerptConfig] = useState<ExcerptConfig>(DEFAULT_EXCERPT)
  const [typography, setTypography] = useState<TypographyConfig>(DEFAULT_TYPOGRAPHY)
  const [sliderConfig, setSliderConfig] = useState<Record<string, boolean>>({})
  const [homeSlots, setHomeSlots] = useState<(FirestoreArticle | null)[]>(new Array(11).fill(null))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slotAssignments = await getSlotAssignments()
        const SLOT_KEYS = ['lead', 'sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8', 'sp9', 'sp10']

        const [leadData, featuredData, specialData, recentData, allData, categoriesData, excerptSnap, sliderSnap, typographySnap] = await Promise.all([
          getLeadArticles(1),
          getFeaturedArticles(5).catch(() => []),
          getSpecialArticles(50),
          getRecentArticles(10).catch(() => []),
          getAllArticles(80).catch(() => []),
          getAllCategories(),
          getDoc(doc(db, 'settings', 'homepage-excerpts')).catch(() => null),
          getDoc(doc(db, 'settings', 'category-sliders')).catch(() => null),
          getDoc(doc(db, 'settings', 'typography')).catch(() => null),
        ])
        setLeadArticles(leadData || [])
        setFeaturedArticles(featuredData || [])
        setSpecialArticles(specialData || [])
        setRecentArticles(recentData || [])
        setAllArticles(allData || [])
        setCategories(categoriesData || [])
        if (excerptSnap?.exists()) setExcerptConfig({ ...DEFAULT_EXCERPT, ...excerptSnap.data() as Partial<ExcerptConfig> })
        if (sliderSnap?.exists()) setSliderConfig(sliderSnap.data() as Record<string, boolean>)
        if (typographySnap?.exists()) setTypography({ ...DEFAULT_TYPOGRAPHY, ...typographySnap.data() as Partial<TypographyConfig> })

        // Build slots from slot-assignments (single source of truth)
        const slots: (FirestoreArticle | null)[] = new Array(11).fill(null)
        const articlesMap = new Map((allData || []).map(a => [a.docId, a]))
        for (let i = 0; i < SLOT_KEYS.length; i++) {
          const articleId = slotAssignments[SLOT_KEYS[i]]
          if (articleId) {
            const article = articlesMap.get(articleId)
            if (article) slots[i] = article
          }
        }
        setHomeSlots(slots)
      } catch (error) {
        console.error('[v0] Error loading home page:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const mainArticle = homeSlots[0]
  const spSlots = homeSlots.slice(1) // sp1 to sp10

  // Rest of the component remains the same...
  // [The rest of the component rendering code stays exactly as is]
  
  // Loading/error states  
  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
            <div className="animate-pulse space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-4">
                  <div className="h-32 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
                <div className="md:col-span-2"><div className="h-96 bg-muted rounded-lg"></div></div>
                <div className="md:col-span-1 space-y-4">
                  <div className="h-32 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (<div key={i} className="h-48 bg-muted rounded-lg"></div>))}
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

  const nonNull = (arr: (FirestoreArticle | null)[]): FirestoreArticle[] => arr.filter((a): a is FirestoreArticle => !!a)
  const isProthomAlo = template.layout === 'prothom-alo'
  const isNewsGrid = template.layout === 'news-grid'

  // newsgrid rendering
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">{nonNull(spSlots.slice(0, 3)).map((a) => (
                  <div key={a.docId} className="border-b border-gray-200 pb-3"><a href={`/article/${a.slug}`} className="block group">
                    <div className="aspect-video bg-gray-100 mb-2">{a.imageUrl && <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                    <h3 className="text-sm font-bold leading-snug line-clamp-2">{a.title}</h3>
                    {excerptConfig.heroExcerpt && <p className="text-[11px] text-[#4A4A4A] mt-1">{a.excerpt}</p>}
                  </a></div>
                ))}</div>
                <div className="divide-y divide-gray-200">{[...nonNull(spSlots.slice(3)), ...nonNull(spSlots)].map((a) => (
                  <div key={a.docId} className="py-3"><a href={`/article/${a.slug}`} className="flex gap-3 group">
                    <div className="flex-1"><h3 className="text-sm font-bold leading-snug">{a.title}</h3></div>
                    {a.imageUrl && <div className="w-20 h-16 shrink-0 bg-gray-100"><img src={a.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                  </a></div>
                ))}</div>
              </div>
              <div className="md:col-span-1 px-3 py-2">
                <AdRenderer slotName="right-sidebar" className="min-h-24 mb-4 border border-gray-200 bg-gray-50 flex items-center justify-center" imageClassName="rounded" />
                {nonNull(spSlots).length > 0 && (<div><h2 className="text-[11px] font-bold text-[#C00000] uppercase mb-3">বিশেষ</h2>
                  <div className="divide-y divide-gray-200">{nonNull(spSlots).map((a) => (
                    <div key={a.docId} className="py-3"><a href={`/article/${a.slug}`} className="flex gap-3 group">
                      {a.imageUrl && <div className="w-16 h-16 shrink-0 bg-gray-100"><img src={a.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                      <div className="flex-1"><h3 className="text-[13px] font-bold leading-snug">{a.title}</h3></div>
                    </a></div>
                  ))}</div>
                </div>)}
              </div>
            </div>
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

  // prothomAlo rendering
  if (isProthomAlo) {
    return (
      <>
        <Header categories={categories} />
        <main className="min-h-screen bg-background">
          <div className="max-w-6xl mx-auto px-3 py-4">
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
                  {nonNull(spSlots).map((article) => (
                    <div key={article.docId} className="py-3 first:pt-0">
                      <a href={`/article/${article.slug}`} className="flex gap-3 group">
                        {article.imageUrl && <div className="w-20 h-20 shrink-0 bg-gray-100"><img src={article.imageUrl} alt="" className="w-full h-full object-cover" /></div>}
                        <div className="flex-1"><h3 className="text-sm font-bold text-[#1A1A1A] leading-snug line-clamp-3">{article.title}</h3></div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {nonNull(spSlots).length > 0 && (
              <section className="mb-6 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {nonNull(spSlots).map((article) => (
                    <div key={article.docId} className="border-b border-gray-200 pb-3">
                      <a href={`/article/${article.slug}`} className="block group">
                        <div className="aspect-video bg-gray-100 mb-1">{article.imageUrl && <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                        <h3 className="text-sm font-bold text-[#1A1A1A]">{article.title}</h3>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
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

  // default template rendering
  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        <section className="max-w-7xl mx-auto px-4 py-5 md:py-6">
          <div className="relative border border-gray-200 rounded-lg bg-[#F8F9FA] overflow-hidden">
            <span className="absolute top-1 right-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium z-10">Advertisement</span>
            <AdRenderer slotName="top-ad-1" className="w-full min-h-[100px] md:min-h-[90px] flex items-center justify-center" imageClassName="w-full h-full object-contain" />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {/* 3-Column Hero: Ad+SP-1 | Lead | Ad+SP-2 */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="space-y-4">
              <AdRenderer slotName="left-sidebar" className="min-h-32" imageClassName="rounded-lg overflow-hidden bg-muted" />
              {spSlots[0] && (
                <article className="group">
                  <a href={`/article/${spSlots[0].slug}`} className="block">
                    <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">
                      {spSlots[0].imageUrl && <img src={spSlots[0].imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105" />}
                    </div>
                    <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-red-600" style={{ fontSize: t(typography.sideSlotTitleFontSize, typography.sideSlotTitleFontSizeMobile) }}>{spSlots[0].title}</h3>
                    {excerptConfig.heroExcerpt && <p className="text-gray-500 mt-1 line-clamp-3" style={{ fontSize: t(typography.sideSlotExcerptFontSize, typography.sideSlotExcerptFontSizeMobile) }}>{spSlots[0].excerpt}</p>}
                  </a>
                </article>
              )}
            </div>

            <div className="md:col-span-2">
              {mainArticle ? (
                <article className="group text-center">
                  <a href={`/article/${mainArticle.slug}`}>
                    <h1 className="font-bold text-foreground mb-3 leading-tight" style={{ fontSize: t(typography.leadTitleFontSize, typography.leadTitleFontSizeMobile) }}>{mainArticle.title}</h1>
                    {excerptConfig.leadExcerpt && <p className="text-foreground mb-4 line-clamp-2 max-w-lg mx-auto" style={{ fontSize: t(typography.leadExcerptFontSize, typography.leadExcerptFontSizeMobile) }}>{mainArticle.excerpt}</p>}
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {mainArticle.imageUrl && <img src={mainArticle.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                    </div>
                  </a>
                </article>
              ) : <p className="text-center text-muted-foreground italic py-10">কোন লিড নিউজ নেই</p>}
            </div>

            <div className="space-y-4">
              <AdRenderer slotName="right-sidebar" className="min-h-32" imageClassName="rounded-lg overflow-hidden bg-muted" />
              {spSlots[1] && (
                <article className="group">
                  <a href={`/article/${spSlots[1].slug}`} className="block">
                    <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">
                      {spSlots[1].imageUrl && <img src={spSlots[1].imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105" />}
                    </div>
                    <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-red-600" style={{ fontSize: t(typography.sideSlotTitleFontSize, typography.sideSlotTitleFontSizeMobile) }}>{spSlots[1].title}</h3>
                    {excerptConfig.heroExcerpt && <p className="text-gray-500 mt-1 line-clamp-3" style={{ fontSize: t(typography.sideSlotExcerptFontSize, typography.sideSlotExcerptFontSizeMobile) }}>{spSlots[1].excerpt}</p>}
                  </a>
                </article>
              )}
            </div>
          </section>

          {/* SP-3 to SP-10 Grid */}
          <section className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {spSlots.slice(2).map((article, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                  {article ? (
                    <a href={`/article/${article.slug}`} className="block group">
                      <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">
                        {article.imageUrl && <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105" />}
                      </div>
                      <h3 className="font-bold leading-tight line-clamp-2 group-hover:text-red-600" style={{ fontSize: t(typography.gridSlotTitleFontSize, typography.gridSlotTitleFontSizeMobile) }}>{article.title}</h3>
                      {excerptConfig.heroExcerpt && <p className="text-gray-500 mt-1 line-clamp-2" style={{ fontSize: t(typography.gridSlotExcerptFontSize, typography.gridSlotExcerptFontSizeMobile) }}>{article.excerpt}</p>}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* Category rows */}
          {categories.filter(cat => allArticles.some(a => a.categoryIds?.includes(cat.id) || a.categoryId === cat.id)).slice(0, 3).map((category, catIndex) => {
            const catArticles = allArticles.filter(a => a.categoryIds?.includes(category.id) || a.categoryId === category.id).slice(0, 8)
            const leadCA = catArticles[0]; const listCA = catArticles.slice(1, 8)
            const sliderEnabled = sliderConfig[category.id] !== false
            const showSlider = sliderEnabled && catArticles.length > 4
            
            // Social widgets for specific categories - full card design
            const socialWidget = (() => {
              const name = category.name?.toLowerCase() || category.slug?.toLowerCase() || ''
              if (name.includes('রাজনীতি') || name.includes('রাজনীতি') || name === 'politics' || name === 'rajniti') {
                return (
                  <div className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-[#1877F2] to-[#0C5BCC] shadow-md group cursor-pointer">
                    <a href="https://www.facebook.com/profile.php?id=61589151984086" target="_blank" rel="noopener noreferrer" className="block h-full">
                      {/* Decorative circles */}
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"></div>
                      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5"></div>
                      <div className="absolute top-1/3 right-2 w-8 h-8 rounded-full bg-white/8"></div>
                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-white">
                        {/* Large icon */}
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </div>
                        <p className="font-bold text-center leading-tight mb-1" style={{ fontSize: t(typography.socialWidgetFontSize, typography.socialWidgetFontSizeMobile) }}>আমাদের Facebook<br/>পেজটি ফলো করুন</p>
                        <p className="text-white/70 mb-2 text-center" style={{ fontSize: t(typography.socialWidgetFontSize - 2, typography.socialWidgetFontSizeMobile - 2) }}>সর্বশেষ রাজনীতি খবর পান</p>
                        <span className="inline-flex items-center gap-1 px-5 py-1.5 bg-white text-[#1877F2] text-[11px] font-bold rounded-full hover:bg-gray-100 transition-all shadow-sm">
                          ফলো করুন
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </span>
                      </div>
                    </a>
                  </div>
                )
              }
              if (name.includes('আন্তর্জাতিক') || name.includes('আন্তর্জাতিক') || name === 'international' || name === 'বিশ্ব') {
                return (
                  <div className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-[#FF0000] to-[#CC0000] shadow-md group cursor-pointer">
                    <a href="https://youtube.com/@madhoprachodarshon?si=vIdLQInH0_OLMS4y" target="_blank" rel="noopener noreferrer" className="block h-full">
                      {/* Decorative circles */}
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10"></div>
                      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5"></div>
                      <div className="absolute top-1/3 right-2 w-8 h-8 rounded-full bg-white/8"></div>
                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-white">
                        {/* Play button icon */}
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </div>
                        <p className="font-bold text-center leading-tight mb-1" style={{ fontSize: t(typography.socialWidgetFontSize, typography.socialWidgetFontSizeMobile) }}>আমাদের YouTube<br/>চ্যানেল সাবস্ক্রাইব</p>
                        <p className="text-white/70 mb-2 text-center" style={{ fontSize: t(typography.socialWidgetFontSize - 2, typography.socialWidgetFontSizeMobile - 2) }}>আন্তর্জাতিক ভিডিও দেখুন</p>
                        <span className="inline-flex items-center gap-1 px-5 py-1.5 bg-white text-[#FF0000] text-[11px] font-bold rounded-full hover:bg-gray-100 transition-all shadow-sm">
                          সাবস্ক্রাইব
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </span>
                      </div>
                    </a>
                  </div>
                )
              }
              return null
            })()

            return (
              <section key={category.id} className={`mb-8 pb-6 border-b border-gray-200 last:border-b-0 ${catIndex === 0 ? 'pt-16' : ''}`}>
                {showSlider && <div className="mb-4"><NewsSlider articles={catArticles} name={category.name} slug={category.slug} /></div>}
                <div style={{ display: showSlider ? "none" : "block" }}>
                  <div className="flex justify-between items-center mb-4">
                    <a href={`/category/${category.slug}`} className="flex-1 group">
                      <h2 className="font-bold text-[#000000] border-l-4 theme-border pl-3" style={{ fontSize: t(typography.categoryRowHeadingSize, typography.categoryRowHeadingSizeMobile) }}>{category.name}</h2>
                    </a>
                    <a href={`/category/${category.slug}`} className="text-[#FF0000] hover:underline text-xs font-bold ml-4 whitespace-nowrap uppercase tracking-wider">সব দেখুন →</a>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <AdRenderer slotName={`category-row-${catIndex+1}-1`} className="min-h-16" imageClassName="rounded overflow-hidden bg-gray-50" />
                    <AdRenderer slotName={`category-row-${catIndex+1}-2`} className="min-h-16" imageClassName="rounded overflow-hidden bg-gray-50" />
                    <AdRenderer slotName={`category-row-${catIndex+1}-3`} className="min-h-16" imageClassName="rounded overflow-hidden bg-gray-50" />
                  </div>
                  {catArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* 8 total slots: Row 1 = A1|A2|A3|A4, Row 2 = A5|SOCIAL(slot6)|A6|A7 */}
                      {socialWidget ? (
                        <>
                          {/* Row 1: 4 articles */}
                          {listCA.slice(0, 4).map((a) => (
                            <article key={a.docId} className="group"><a href={`/article/${a.slug}`}>
                              <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">{a.imageUrl && <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                              <h4 className="font-bold line-clamp-2" style={{ fontSize: t(typography.categoryArticleTitleSize, typography.categoryArticleTitleSizeMobile) }}>{a.title}</h4>
                              {excerptConfig.categoryListExcerpt && <p className="text-gray-500 mt-1 line-clamp-3" style={{ fontSize: t(typography.categoryArticleExcerptSize, typography.categoryArticleExcerptSizeMobile) }}>{a.excerpt}</p>}
                            </a></article>
                          ))}
                          {/* Row 2: SOCIAL (slot 5) | A5 | A6 | A7 */}
                          {socialWidget}
                          {listCA[4] && (
                            <article key={listCA[4].docId} className="group"><a href={`/article/${listCA[4].slug}`}>
                              <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">{listCA[4].imageUrl && <img src={listCA[4].imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                              <h4 className="font-bold line-clamp-2" style={{ fontSize: t(typography.categoryArticleTitleSize, typography.categoryArticleTitleSizeMobile) }}>{listCA[4].title}</h4>
                              {excerptConfig.categoryListExcerpt && <p className="text-gray-500 mt-1 line-clamp-3" style={{ fontSize: t(typography.categoryArticleExcerptSize, typography.categoryArticleExcerptSizeMobile) }}>{listCA[4].excerpt}</p>}
                            </a></article>
                          )}
                          {listCA[5] && (
                            <article key={listCA[5].docId} className="group"><a href={`/article/${listCA[5].slug}`}>
                              <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">{listCA[5].imageUrl && <img src={listCA[5].imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                              <h4 className="font-bold line-clamp-2" style={{ fontSize: t(typography.categoryArticleTitleSize, typography.categoryArticleTitleSizeMobile) }}>{listCA[5].title}</h4>
                              {excerptConfig.categoryListExcerpt && <p className="text-gray-500 mt-1 line-clamp-3" style={{ fontSize: t(typography.categoryArticleExcerptSize, typography.categoryArticleExcerptSizeMobile) }}>{listCA[5].excerpt}</p>}
                            </a></article>
                          )}
                          {listCA[6] && (
                            <article key={listCA[6].docId} className="group"><a href={`/article/${listCA[6].slug}`}>
                              <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">{listCA[6].imageUrl && <img src={listCA[6].imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                              <h4 className="font-bold line-clamp-2" style={{ fontSize: t(typography.categoryArticleTitleSize, typography.categoryArticleTitleSizeMobile) }}>{listCA[6].title}</h4>
                              {excerptConfig.categoryListExcerpt && <p className="text-gray-500 mt-1 line-clamp-3" style={{ fontSize: t(typography.categoryArticleExcerptSize, typography.categoryArticleExcerptSizeMobile) }}>{listCA[6].excerpt}</p>}
                            </a></article>
                          )}
                        </>
                      ) : (
                        listCA.slice(0, 8).map((a) => (
                          <article key={a.docId} className="group"><a href={`/article/${a.slug}`}>
                            <div className="aspect-video bg-gray-100 mb-2 rounded overflow-hidden">{a.imageUrl && <img src={a.imageUrl} alt="" className="w-full h-full object-cover" />}</div>
                            <h4 className="text-sm font-bold line-clamp-2">{a.title}</h4>
                            {excerptConfig.categoryListExcerpt && <p className="text-xs text-gray-500 mt-1 line-clamp-3">{a.excerpt}</p>}
                          </a></article>
                        ))
                      )}
                    </div>
                  ) : <p className="text-center py-8 text-gray-500">এই ক্যাটাগরিতে কোন নিবন্ধ পাওয়া যায়নি।</p>}
                </div>
              </section>
            )
          })}

          <section className="mb-8">
            <h2 className="font-bold mb-6 text-foreground border-b pb-3" style={{ fontSize: t(typography.recentHeadingSize, typography.recentHeadingSizeMobile) }}>সর্বশেষ সংবাদ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentArticles.slice(0, 8).map((article) => (<ArticleCard key={article.docId} article={article} />))}
            </div>
          </section>
        </div>

        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="relative border border-gray-200 rounded-lg bg-[#F8F9FA] overflow-hidden">
            <span className="absolute top-1 right-2 text-[10px] text-gray-400 uppercase tracking-wider font-medium z-10">Advertisement</span>
            <AdRenderer slotName="bottom-banner" className="w-full min-h-[120px] md:min-h-[100px] flex items-center justify-center" imageClassName="w-full h-full object-contain" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default HomePage