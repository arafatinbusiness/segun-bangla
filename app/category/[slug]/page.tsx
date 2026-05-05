'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCategoryBySlug, getSubcategoriesByCategory, getAllCategories } from '@/lib/services/categories'
import { getArticlesByCategory } from '@/lib/services/article-queries'
import { Header } from '@/components/header'
import { AdRenderer } from '@/components/ad-renderer'
import type { FirestoreArticle } from '@/lib/types'
import type { Category, Subcategory } from '@/lib/types'

// ─── Utility: Time ago in Bengali ───────────────────────────────────────────
function timeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'এইমাত্র'
  if (minutes < 60) return `${minutes} মিনিট আগে`
  if (hours < 24) return `${hours} ঘন্টা আগে`
  if (days < 7) return `${days} দিন আগে`
  return new Date(timestamp).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Utility: Truncate text ──────────────────────────────────────────────────
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '...'
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ১. টপ হিরো গ্রিড (Hero Grid)
// ═══════════════════════════════════════════════════════════════════════════════

// প্রধান সংবাদ (বাম পাশে) - বড় ল্যান্ডস্কেপ ইমেজ, ওপরেই হেডলাইন
function HeroMainCard({ article }: { article: FirestoreArticle }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block relative w-full h-full min-h-[380px] md:min-h-[520px] rounded-lg overflow-hidden bg-gray-100">
      <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
      {/* নিচে হালকা ডার্ক গ্রেডিয়েন্ট */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* হেডলাইন - ইমেজের ওপর সরাসরি টেক্সট ওভারলে, বাম দিকে সাদা টেক্সট */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-tight line-clamp-3">
          {article.title}
        </h2>
        <p className="text-white/60 text-xs mt-2">{timeAgo(article.publishedAt)}</p>
      </div>
    </Link>
  )
}

// সেকেন্ডারি সংবাদ (মাঝখানে) - ভার্টিক্যাল ব্লক
function SecondaryFeatureCard({ article }: { article: FirestoreArticle }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block">
      <div className="relative h-44 md:h-52 w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
      </div>
      {/* লাল রঙের বোল্ড সাব-হেডিং */}
      <span className="text-[#FF0000] text-xs font-bold uppercase tracking-wider">
        {article.source || 'বিশেষ'}
      </span>
      {/* কালো রঙের মেইন হেডলাইন */}
      <h3 className="text-[#000000] font-bold text-base md:text-lg leading-snug mt-1.5 line-clamp-2 group-hover:text-[#FF0000] transition-colors">
        {article.title}
      </h3>
      {/* ২-৩ লাইনের সংক্ষিপ্ত বিবরণ */}
      <p className="text-[#444444] text-sm mt-2 line-clamp-2 leading-relaxed">
        {truncate(article.excerpt, 120)}
      </p>
    </Link>
  )
}

// সাইডবার (ডান পাশে) - বিজ্ঞাপন + ট্যাবড উইজেট
function SidebarWidget({ articles }: { articles: FirestoreArticle[] }) {
  const [tab, setTab] = useState<'latest' | 'mostread'>('latest')

  const sorted = useMemo(() => {
    if (tab === 'latest') return articles
    return [...articles].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  }, [articles, tab])

  const top5 = sorted.slice(0, 5)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* ট্যাব */}
      <div className="flex gap-0 mb-4 border-b border-gray-200">
        <button
          onClick={() => setTab('latest')}
          className={`pb-2 px-3 text-sm font-bold border-b-2 transition-colors ${
            tab === 'latest'
              ? 'border-[#FF0000] text-[#000000]'
              : 'border-transparent text-gray-500 hover:text-[#000000]'
          }`}
        >
          সর্বশেষ
        </button>
        <button
          onClick={() => setTab('mostread')}
          className={`pb-2 px-3 text-sm font-bold border-b-2 transition-colors ${
            tab === 'mostread'
              ? 'border-[#FF0000] text-[#000000]'
              : 'border-transparent text-gray-500 hover:text-[#000000]'
          }`}
        >
          পঠিত
        </button>
      </div>

      {/* ১-৫ পর্যন্ত সিরিয়াল নাম্বারে সাজানো */}
      <div className="space-y-3.5">
        {top5.map((article, idx) => (
          <Link
            key={article.docId}
            href={`/article/${article.slug}`}
            className="flex gap-3 group"
          >
            <span className="text-xl font-bold text-gray-300 group-hover:text-[#FF0000]/30 transition-colors leading-none shrink-0 w-7">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#000000] leading-snug line-clamp-2 group-hover:text-[#FF0000] transition-colors">
                {article.title}
              </h4>
              <p className="text-xs text-[#444444] mt-1">
                {timeAgo(article.publishedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ২. থ্রি-কলাম সাব-গ্রিড (Middle Grid)
// ═══════════════════════════════════════════════════════════════════════════════
function GridCard({ article }: { article: FirestoreArticle }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block">
      {/* ইমেজ (উপরে) */}
      <div className="relative h-44 w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      {/* লাল সাব-হেডিং */}
      <span className="text-[#FF0000] text-xs font-bold uppercase tracking-wider">
        {article.source || 'বিশেষ'}
      </span>
      {/* বোল্ড হেডলাইন */}
      <h3 className="text-[#000000] font-bold text-base leading-snug mt-1.5 line-clamp-2 group-hover:text-[#FF0000] transition-colors">
        {article.title}
      </h3>
      {/* সংক্ষিপ্ত বিবরণ (Excerpt) */}
      <p className="text-[#444444] text-sm mt-2 line-clamp-2 leading-relaxed">
        {truncate(article.excerpt, 100)}
      </p>
      {/* টাইমস্ট্যাম্প (নিচে বামে) */}
      <p className="text-xs text-[#444444] mt-3">{timeAgo(article.publishedAt)}</p>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ৩. ভার্টিক্যাল নিউজ লিস্ট (ইমেজ-ডানে)
// ═══════════════════════════════════════════════════════════════════════════════
function ListRow({ article }: { article: FirestoreArticle }) {
  return (
    <Link href={`/article/${article.slug}`} className="group grid grid-cols-4 gap-4 pb-5 border-b border-[#eeeeee] mb-5">
      {/* কলাম ১ (বামে ফাঁকা): ভবিষ্যতে বিজ্ঞাপনের জন্য */}
      <div className="hidden md:block" />

      {/* কলাম ২-৩: বাম পাশে ক্যাপশন + ডান পাশে ইমেজ */}
      <div className="col-span-4 md:col-span-2 flex gap-4">
        {/* বামে: হেডলাইন, বিবরণ, টাইমস্ট্যাম্প */}
        <div className="w-3/5">
          <h3 className="text-[#000000] font-bold text-lg leading-snug line-clamp-2 group-hover:text-[#FF0000] transition-colors">
            {article.title}
          </h3>
          <p
            className="text-[#444444] text-sm mt-2 leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.excerpt}
          </p>
          <p className="text-xs text-[#444444] mt-3">{timeAgo(article.publishedAt)}</p>
        </div>
        {/* ডানে: থাম্বনেইল ইমেজ - 16:9 */}
        <div className="w-2/5 shrink-0">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="20vw"
            />
          </div>
        </div>
      </div>

      {/* কলাম ৪ (ডানে ফাঁকা): ভবিষ্যতে বিজ্ঞাপনের জন্য */}
      <div className="hidden md:block" />
    </Link>
  )
}

// ─── Separator ──────────────────────────────────────────────────────────────
function SectionSeparator() {
  return <hr className="border-t border-gray-200 my-10" />
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function CategoryPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const decodedSlug = decodeURIComponent(slug).trim()
        const [categoryData, allCategoriesData] = await Promise.all([
          getCategoryBySlug(decodedSlug),
          getAllCategories(),
        ])

        if (!categoryData) {
          setNotFound(true)
          return
        }

        setCategory(categoryData)
        setAllCategories(allCategoriesData)

        const [subcategoriesData, articlesData] = await Promise.all([
          getSubcategoriesByCategory(categoryData.id),
          getArticlesByCategory(categoryData.id, 30),
        ])

        setSubcategories(subcategoriesData)
        setArticles(articlesData)
      } catch (error) {
        console.error('[v0] Error loading category page:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  // ── Split articles into sections ──────────────────────────────────────────
  const heroArticle = articles[0] || null
  const secondaryArticle = articles[1] || null
  const gridArticles = articles.slice(2, 5) // only 3 articles for a single 3-column row
  const listArticles = articles.slice(5)

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[520px] bg-gray-200 rounded-lg" />
                <div className="h-[520px] bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (notFound || !category) {
    return (
      <>
        <Header categories={allCategories} />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-gray-400">৪০৪</h1>
            <p className="text-xl text-gray-500">পৃষ্ঠা পাওয়া যায়নি</p>
            <p className="text-gray-500">দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা স্থানান্তরিত হয়েছে।</p>
            <a href="/" className="inline-block mt-4 px-6 py-2 bg-[#FF0000] text-white rounded-md hover:bg-red-700">
              হোমে ফিরে যান
            </a>
          </div>
        </main>
      </>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (articles.length === 0) {
    return (
      <>
        <Header categories={allCategories} />
        <main className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#000000] mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-[#444444]">{category.description}</p>
              )}
            </div>
            <div className="text-center py-12">
              <p className="text-[#444444]">এই ক্যাটাগরিতে কোন নিবন্ধ পাওয়া যায়নি।</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header categories={allCategories} />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* ── Category Header ─────────────────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#000000] mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-[#444444]">{category.description}</p>
            )}
          </div>

          {/* ── Subcategory Pills ──────────────────────────────────────────── */}
          {subcategories.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Link
                  href={`/category/${category.slug}`}
                  className="px-4 py-2 bg-[#FF0000] text-white rounded-full whitespace-nowrap text-sm font-bold"
                >
                  সব
                </Link>
                {subcategories.slice(0, 12).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${category.slug}/${sub.slug}`}
                    className="px-4 py-2 bg-gray-100 text-[#444444] rounded-full whitespace-nowrap text-sm hover:bg-gray-200 transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              ১. টপ হিরো গ্রিড (Hero Grid)
             ═══════════════════════════════════════════════════════════════════ */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* প্রধান সংবাদ (বাম পাশে) - 2 columns */}
            <div className="lg:col-span-2">
              {heroArticle && <HeroMainCard article={heroArticle} />}
            </div>

            {/* ডান কলাম: সেকেন্ডারি সংবাদ + সাইডবার */}
            <div className="flex flex-col gap-6">
              {/* সেকেন্ডারি সংবাদ (মাঝখানে) */}
              {secondaryArticle && <SecondaryFeatureCard article={secondaryArticle} />}

              {/* বিজ্ঞাপন স্লট */}
              <AdRenderer
                slotName="category-sidebar-top"
                className="w-full rounded-lg overflow-hidden bg-gray-50"
              />

              {/* 'সর্বশেষ' এবং 'পঠিত' ট্যাবড উইজেট */}
              <SidebarWidget articles={articles} />
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              ২. থ্রি-কলাম সাব-গ্রিড (Middle Grid)
             ═══════════════════════════════════════════════════════════════════ */}
          {gridArticles.length > 0 && (
            <>
              <SectionSeparator />
              <section className="mb-10">
                <h2 className="text-xl font-bold text-[#000000] mb-6 border-l-4 border-[#FF0000] pl-3">
                  আরও খবর
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridArticles.map((article) => (
                    <GridCard key={article.docId} article={article} />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              ৩. ভার্টিক্যাল নিউজ লিস্ট (ইমেজ-ডানে)
             ═══════════════════════════════════════════════════════════════════ */}
          {listArticles.length > 0 && (
            <>
              <SectionSeparator />
              <section className="mb-10">
                <h2 className="text-xl font-bold text-[#000000] mb-6 border-l-4 border-[#FF0000] pl-3">
                  আরও সংবাদ
                </h2>
                <div className="space-y-0">
                  {listArticles.map((article, idx) => (
                    <div key={article.docId}>
                      <ListRow article={article} />
                      {/* প্রতি ৪-৫টি সংবাদের পর ফুল-উইথ বিজ্ঞাপন */}
                      {(idx + 1) % 4 === 0 && (
                        <div className="my-8">
                          <AdRenderer
                            slotName="category-list-inline"
                            className="w-full rounded-lg overflow-hidden bg-gray-50"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  )
}

export default CategoryPage
