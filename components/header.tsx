'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { User, Search, Youtube, Facebook, ChevronDown } from 'lucide-react'

// ─── Deployment Version Marker ──────────────────────────────────────────────
// Change this value manually before each deployment to verify the client
// is seeing the latest version. Ask the client: "What version do you see?"
// DEPLOY_VERSION = 'v1'  // Initial deployment
// DEPLOY_VERSION = 'v2'  // After menu redesign
const DEPLOY_VERSION = 'v4'
// ────────────────────────────────────────────────────────────────────────────
import { useAuth } from '@/lib/auth-context'
import { getSubcategoriesByCategory } from '@/lib/services/categories'
import { getArticlesByCategory } from '@/lib/services/article-queries'
import type { Category, Subcategory, FirestoreArticle } from '@/lib/types'

interface HeaderProps {
  categories: Category[]
}

export function Header({ categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({})
  const [topStories, setTopStories] = useState<Record<string, FirestoreArticle[]>>({})
  const [loadingSubs, setLoadingSubs] = useState<Record<string, boolean>>({})
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { isAuthenticated, profile } = useAuth()

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('bn-BD'))
  }, [])

  // Scroll detection for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load subcategories and top stories when a category is hovered
  useEffect(() => {
    if (!activeCategory) return

    const category = categories.find(c => c.id === activeCategory)
    if (!category) return

    // Load subcategories if not already loaded
    if (!subcategories[activeCategory] && !loadingSubs[activeCategory]) {
      setLoadingSubs(prev => ({ ...prev, [activeCategory]: true }))
      getSubcategoriesByCategory(activeCategory)
        .then(subs => {
          setSubcategories(prev => ({ ...prev, [activeCategory]: subs }))
        })
        .catch(console.error)
        .finally(() => {
          setLoadingSubs(prev => ({ ...prev, [activeCategory]: false }))
        })
    }

    // Load top stories if not already loaded
    if (!topStories[activeCategory]) {
      getArticlesByCategory(activeCategory, 4)
        .then(articles => {
          setTopStories(prev => ({ ...prev, [activeCategory]: articles }))
        })
        .catch(console.error)
    }
  }, [activeCategory, categories, subcategories, loadingSubs, topStories])

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveCategory(categoryId)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null)
    }, 200)
  }

  const handleMegaMenuEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleMegaMenuLeave = () => {
    setActiveCategory(null)
  }

  // Get root subcategories (no parentId) for column 1
  const getRootSubs = (catId: string) => {
    const subs = subcategories[catId] || []
    return subs.filter(s => !s.parentId)
  }

  // Get child subcategories for column 2
  const getChildSubs = (catId: string) => {
    const subs = subcategories[catId] || []
    const rootIds = new Set(subs.filter(s => !s.parentId).map(s => s.id))
    return subs.filter(s => s.parentId && rootIds.has(s.parentId))
  }

  const activeCategoryData = activeCategory ? categories.find(c => c.id === activeCategory) : null
  const activeSubs = activeCategory ? getRootSubs(activeCategory) : []
  const activeChildSubs = activeCategory ? getChildSubs(activeCategory) : []
  const activeTopStories = activeCategory ? (topStories[activeCategory] || []) : []

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Bar - Hidden when scrolled */}
      {!scrolled && (
        <div className="bg-[#1A1A1A] text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">{currentDate}</span>
              <span className="text-[10px] font-bold text-yellow-300 bg-yellow-900/30 px-1.5 py-0.5 rounded">
                {DEPLOY_VERSION}
              </span>
            </div>
            <div className="flex gap-4 items-center text-xs">
              {isAuthenticated ? (
                <>
                  <span className="text-white/70">{profile?.displayName}</span>
                  <Link href="/profile" className="hover:text-white flex items-center gap-1 text-white/70">
                    <User size={14} />
                    প্রোফাইল
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-white text-white/70">
                    লগইন
                  </Link>
                  <Link href="/register" className="hover:text-white text-white/70">
                    নিবন্ধন
                  </Link>
                </>
              )}
              <a href="#" className="hover:text-white text-white/70">
                সাবস্ক্রাইব
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Logo Section */}
      <div className={`transition-all duration-300 ${scrolled ? 'py-1' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <Link href="/">
            {scrolled ? (
              <img
                src="/logo.png"
                alt="সেগুন বাংলা"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <img
                src="/logo.png"
                alt="সেগুন বাংলা"
                className="h-14 w-auto object-contain"
              />
            )}
          </Link>
        </div>
      </div>

      {/* Navigation Row - Desktop only */}
      <div className="hidden md:block border-t border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-center gap-0">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`
                  relative flex items-center gap-1 px-4 py-3 text-base font-bold
                  transition-colors duration-150 whitespace-nowrap
                  ${activeCategory === category.id
                    ? 'text-[#8B0000]'
                    : 'text-[#1A1A1A] hover:text-[#8B0000]'
                  }
                `}
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                {category.name}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Link>
            ))}
            {/* "সব দেখুন" - 13th item linking to all categories */}
            <Link
              href="/search"
              className="flex items-center gap-1 px-4 py-3 text-base font-bold text-[#8B0000] hover:text-[#1A1A1A] transition-colors duration-150 whitespace-nowrap"
            >
              সব দেখুন
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#E8E8E8]">
              <Link href="/search" className="text-[#1A1A1A] hover:text-[#8B0000] transition-colors">
                <Search size={16} />
              </Link>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-[#8B0000] transition-colors">
                <Youtube size={16} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-[#8B0000] transition-colors">
                <Facebook size={16} />
              </a>
            </div>
          </nav>
        </div>
      </div>

      {/* Signature Double Border */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="w-full">
          <div className="h-[2px] bg-[#1A1A1A]" />
          <div className="h-[2px]" />
          <div className="h-[1px] bg-[#1A1A1A]" />
        </div>
      </div>

      {/* Mega-Menu Panel */}
      {activeCategory && activeCategoryData && (
        <div
          ref={megaMenuRef}
          className="absolute left-0 right-0 bg-white shadow-lg border-b border-[#E8E8E8] z-50"
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-8">
              {/* Column 1 - Sections (Root Subcategories) */}
              <div className="col-span-3">
                <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-4">
                  বিভাগ
                </p>
                <div className="space-y-2">
                  {activeSubs.length > 0 ? (
                    activeSubs.map(sub => (
                      <Link
                        key={sub.id}
                        href={`/category/${activeCategoryData.slug}/${sub.slug}`}
                        className="block text-sm text-[#1A1A1A] hover:text-[#8B0000] transition-colors py-0.5"
                      >
                        {sub.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[#888]">কোন উপবিভাগ নেই</p>
                  )}
                </div>
              </div>

              {/* Column 2 - Sub-sections (Child Subcategories) */}
              <div className="col-span-3">
                <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-4">
                  আরও পড়ুন
                </p>
                <div className="space-y-2">
                  {activeChildSubs.length > 0 ? (
                    activeChildSubs.map(sub => (
                      <Link
                        key={sub.id}
                        href={`/category/${activeCategoryData.slug}/${sub.slug}`}
                        className="block text-sm text-[#1A1A1A] hover:text-[#8B0000] transition-colors py-0.5"
                      >
                        {sub.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[#888]">কোন উপ-উপবিভাগ নেই</p>
                  )}
                </div>
              </div>

              {/* Column 3 - Top Stories */}
              <div className="col-span-6">
                <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-4">
                  শীর্ষ সংবাদ
                </p>
                <div className="space-y-3">
                  {activeTopStories.length > 0 ? (
                    activeTopStories.slice(0, 4).map(article => (
                      <Link
                        key={article.docId}
                        href={`/article/${article.slug}`}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#1A1A1A] group-hover:text-[#8B0000] transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[#888]">কোন শীর্ষ সংবাদ নেই</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Categories - First 4 visible + always-visible three-dots */}
      <div className="md:hidden border-t border-[#E8E8E8]">
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="px-4 py-2 text-sm font-bold text-[#1A1A1A] bg-gray-100 rounded-full hover:text-[#8B0000] hover:bg-gray-200 transition-colors whitespace-nowrap shrink-0"
            >
              {category.name}
            </Link>
          ))}
          {categories.length > 4 && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:text-[#8B0000] hover:bg-gray-100 rounded-full transition-colors shrink-0"
              aria-label="আরও বিভাগ"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </button>
          )}
        </div>

        {/* Full-screen overlay menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            {/* Close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-base font-bold text-[#1A1A1A]">বিভাগ সমূহ</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-[#1A1A1A] hover:text-[#8B0000] rounded-full hover:bg-gray-100"
                aria-label="বন্ধ করুন"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* Category list */}
            <div className="overflow-y-auto h-full pb-20">
              {categories.slice(4).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block px-6 py-4 text-base font-bold text-[#1A1A1A] hover:text-[#8B0000] hover:bg-gray-50 border-b border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/search"
                className="block px-6 py-4 text-base font-bold text-[#8B0000] hover:bg-gray-50 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                সার্চ
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
