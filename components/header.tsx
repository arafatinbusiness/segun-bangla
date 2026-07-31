'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Search, Youtube, Facebook, ChevronDown } from 'lucide-react'

const DEPLOY_VERSION = ''
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
// Auth removed from public header
import { getSubcategoriesByCategory } from '@/lib/services/categories'
import { getArticlesByCategory } from '@/lib/services/article-queries'
import type { Category, Subcategory, FirestoreArticle } from '@/lib/types'

interface HeaderProps {
  categories: Category[]
}

export function Header({ categories }: HeaderProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [menuFontSize, setMenuFontSize] = useState(16)
  const [menuFontWeight, setMenuFontWeight] = useState<'normal' | 'bold'>('bold')
  const [logoHeight, setLogoHeight] = useState(56)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  useEffect(() => {
    import('firebase/firestore').then(({ doc, getDoc }) => {
      import('@/lib/firebase').then(({ db }) => {
        getDoc(doc(db, 'settings', 'typography')).then(snap => {
          if (snap.exists()) {
            const data = snap.data()
            const d = data.menuFontSize || 16
            const m = data.menuFontSizeMobile || 14
            setMenuFontSize(isMobile ? m : d)
            setMenuFontWeight(data.menuFontWeight || 'bold')
            setLogoHeight(isMobile ? (data.logoHeightMobile || 40) : (data.logoHeight || 56))
          }
        }).catch(() => {})
      })
    }).catch(() => {})
  }, [isMobile])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({})
  const [topStories, setTopStories] = useState<Record<string, FirestoreArticle[]>>({})
  const [loadingSubs, setLoadingSubs] = useState<Record<string, boolean>>({})
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const topSectionRef = useRef<HTMLDivElement>(null)
  const dateBarRef = useRef<HTMLDivElement>(null)

  // Pure CSS sticky behavior — like Prothom Alo, zero vibration
  // Logo/date bar = normal flow (scrolls away naturally).
  // Nav bar below = sticky top-0 (stays at top when logo scrolls past).

  useEffect(() => {
    if (!activeCategory) return
    const category = categories.find(c => c.id === activeCategory)
    if (!category) return
    if (!subcategories[activeCategory] && !loadingSubs[activeCategory]) {
      setLoadingSubs(prev => ({ ...prev, [activeCategory]: true }))
      getSubcategoriesByCategory(activeCategory)
        .then(subs => setSubcategories(prev => ({ ...prev, [activeCategory]: subs })))
        .catch(console.error)
        .finally(() => setLoadingSubs(prev => ({ ...prev, [activeCategory]: false })))
    }
    if (!topStories[activeCategory]) {
      getArticlesByCategory(activeCategory, 4)
        .then(articles => setTopStories(prev => ({ ...prev, [activeCategory]: articles })))
        .catch(console.error)
    }
  }, [activeCategory, categories, subcategories, loadingSubs, topStories])

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setActiveCategory(categoryId), 1000)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 300)
  }

  const handleMegaMenuEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  const handleMegaMenuLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 300)
  }

  const getRootSubs = (catId: string) => (subcategories[catId] || []).filter(s => !s.parentId)
  const getChildSubs = (catId: string) => {
    const subs = subcategories[catId] || []
    const rootIds = new Set(subs.filter(s => !s.parentId).map(s => s.id))
    return subs.filter(s => s.parentId && rootIds.has(s.parentId))
  }

  const activeCategoryData = activeCategory ? categories.find(c => c.id === activeCategory) : null
  const activeSubs = activeCategory ? getRootSubs(activeCategory) : []
  const activeChildSubs = activeCategory ? getChildSubs(activeCategory) : []
  const activeTopStories = activeCategory ? (topStories[activeCategory] || []) : []
  const hiddenCategorySlugs = ['Health', 'Get-Help']
  const specialCategory = categories.find(c => c.slug === 'special' || c.slug === 'বিশেষ' || c.name === 'বিশেষ')
  const otherCategories = categories.filter(c => c.id !== specialCategory?.id && !hiddenCategorySlugs.includes(c.slug) && !hiddenCategorySlugs.includes(c.name))
  const visibleCategories = specialCategory ? [specialCategory, ...otherCategories.slice(0, 8)] : otherCategories.slice(0, 9)

  return (
    <>
      {/* Logo + date bar — normal flow, scrolls away naturally like Prothom Alo */}
      <div ref={dateBarRef} className="bg-white">
        <div className="bg-[#1A1A1A] text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">{currentDate}</span>
              <span className="text-[10px] font-bold text-yellow-300 bg-yellow-900/30 px-1.5 py-0.5 rounded">{DEPLOY_VERSION}</span>
            </div>
            <div className="flex gap-4 items-center text-xs">
              <span className="text-[10px] font-bold text-yellow-300 bg-yellow-900/30 px-2 py-0.5 rounded border border-yellow-600/40">পরীক্ষামূলক</span>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center py-3">
          <a href="/"><img src="/logo.png" alt="সেগুন বাংলা" className="w-auto object-contain" style={{ height: logoHeight }} /></a>
        </div>
      </div>

      {/* Nav bar — independently sticky, stays at top when logo scrolls past */}
      <div className="sticky top-0 z-50 bg-white">
        <div className="hidden md:block border-t border-[#E8E8E8]">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center justify-center gap-0">
              <Link href="/search" className="relative flex items-center gap-1 px-4 py-3 transition-colors duration-150 whitespace-nowrap text-[#8B0000] hover:text-[#1A1A1A]"
                style={{ fontSize: menuFontSize, fontWeight: menuFontWeight }}>সর্বশেষ</Link>
              {visibleCategories.map(category => (
                <Link key={category.id} href={`/category/${category.slug}`}
                  className={`relative flex items-center gap-1 px-4 py-3 transition-colors duration-150 whitespace-nowrap ${activeCategory === category.id ? 'text-[#8B0000]' : 'text-[#1A1A1A] hover:text-[#8B0000]'}`}
                  style={{ fontSize: menuFontSize, fontWeight: menuFontWeight }}
                  onMouseEnter={() => handleMouseEnter(category.id)} onMouseLeave={handleMouseLeave}>
                  {category.name}<ChevronDown className="w-4 h-4 opacity-50" />
                </Link>
              ))}
              <button onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-1 px-4 py-3 transition-colors duration-150 whitespace-nowrap text-[#8B0000] hover:text-[#1A1A1A]"
                style={{ fontSize: menuFontSize, fontWeight: menuFontWeight }}>সব দেখুন</button>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#E8E8E8]">
                <Link href="/search" className="text-[#1A1A1A] hover:text-[#8B0000] transition-colors"><Search size={20} /></Link>
                <a href="https://youtube.com" target="_blank" className="text-[#1A1A1A] hover:text-[#8B0000] transition-colors"><Youtube size={20} /></a>
                <a href="https://www.facebook.com/profile.php?id=61589151984086" target="_blank" className="text-[#1A1A1A] hover:text-[#8B0000] transition-colors"><Facebook size={20} /></a>
              </div>
            </nav>
          </div>
        </div>

        {/* Double Border */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="w-full"><div className="h-[2px] bg-[#1A1A1A]" /><div className="h-[2px]" /><div className="h-[1px] bg-[#1A1A1A]" /></div>
        </div>

        {/* Mega Menu — inside sticky container so it always positions relative to nav */}
        {activeCategory && activeCategoryData && (
          <div ref={megaMenuRef} className="absolute left-0 right-0 top-full bg-white shadow-lg border-b border-[#E8E8E8] z-50"
            onMouseEnter={handleMegaMenuEnter} onMouseLeave={handleMegaMenuLeave}>
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-3">
                  <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-4">বিভাগ</p>
                  <div className="space-y-2">
                    {activeSubs.length > 0 ? activeSubs.map(sub => (
                      <Link key={sub.id} href={`/category/${activeCategoryData.slug}/${sub.slug}`}
                        className="block text-sm text-[#1A1A1A] hover:text-[#8B0000] transition-colors py-0.5">{sub.name}</Link>
                    )) : <p className="text-sm text-[#888]">কোন উপবিভাগ নেই</p>}
                  </div>
                </div>
                {activeChildSubs.length > 0 && (
                  <div className="col-span-3">
                    <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-4">আরও পড়ুন</p>
                    <div className="space-y-2">
                      {activeChildSubs.map(sub => (
                        <Link key={sub.id} href={`/category/${activeCategoryData.slug}/${sub.slug}`}
                          className="block text-sm text-[#1A1A1A] hover:text-[#8B0000] transition-colors py-0.5">{sub.name}</Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="col-span-6">
                  <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-4">শীর্ষ সংবাদ</p>
                  <div className="space-y-3">
                    {activeTopStories.length > 0 ? activeTopStories.slice(0, 4).map(article => (
                      <Link key={article.docId} href={`/article/${article.slug}`} className="flex items-start gap-3 group">
                        <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#1A1A1A] group-hover:text-[#8B0000] transition-colors line-clamp-2 leading-snug">{article.title}</p>
                        </div>
                      </Link>
                    )) : <p className="text-sm text-[#888]">কোন শীর্ষ সংবাদ নেই</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden border-t border-[#E8E8E8]">
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Link href="/search" className="px-4 py-2 text-sm font-bold text-white bg-[#8B0000] rounded-full hover:bg-[#a00000] transition-colors whitespace-nowrap shrink-0">সর্বশেষ</Link>
          {categories.slice(0, 3).map(category => (
            <Link key={category.id} href={`/category/${category.slug}`}
              className="px-4 py-2 text-sm font-bold text-[#1A1A1A] bg-gray-100 rounded-full hover:text-[#8B0000] hover:bg-gray-200 transition-colors whitespace-nowrap shrink-0">{category.name}</Link>
          ))}
          {categories.length > 3 && (
            <button onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:text-[#8B0000] hover:bg-gray-100 rounded-full transition-colors shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" /></svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-base font-bold text-[#1A1A1A]">বিভাগ সমূহ</span>
            <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:text-[#8B0000] rounded-full hover:bg-gray-100">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="overflow-y-auto h-full pb-20">
            <div className="max-w-5xl mx-auto px-4 py-6">
              <Link href="/search" onClick={() => setMobileMenuOpen(false)}
                className="inline-block px-6 py-3 mb-6 text-base font-bold text-white bg-[#8B0000] hover:bg-[#a00000] rounded-lg transition-colors">সর্বশেষ</Link>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {categories.map(category => (
                  <Link key={category.id} href={`/category/${category.slug}`} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-5 text-base font-bold text-[#1A1A1A] hover:text-[#8B0000] hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-center">{category.name}</Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/search" onClick={() => setMobileMenuOpen(false)}
                  className="inline-block px-6 py-3 text-base font-bold text-[#8B0000] hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">সার্চ</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}