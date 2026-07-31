'use client'

import { useRef, useState, useEffect } from 'react'
import type { FirestoreArticle } from '@/lib/types'

interface Props { articles: FirestoreArticle[]; name: string; slug: string }

export function NewsSlider({ articles, name, slug }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState(false)
  const [right, setRight] = useState(true)
  const [page, setPage] = useState(0)
  const total = Math.max(1, Math.ceil(articles.length / 4))
  const check = () => {
    const el = ref.current; if (!el) return
    setLeft(el.scrollLeft > 10)
    setRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    setPage(Math.round(el.scrollLeft / (el.clientWidth || 1)))
  }
  const go = (d: 'l' | 'r') => {
    const el = ref.current; if (!el) return
    const scrollAmt = el.clientWidth * 0.75
    el.scrollBy({ left: (d === 'l' ? -1 : 1) * scrollAmt, behavior: 'smooth' })
  }
  // Auto-play: scroll every 4 seconds
  useEffect(() => {
    const el = ref.current; if (!el || articles.length <= 4) return
    const interval = setInterval(() => {
      if (!el) return
      // Check if we're at the end
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 20
      if (atEnd) {
        // Scroll back to start smoothly
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll forward by one card width
        el.scrollBy({ left: 200, behavior: 'smooth' })
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [articles.length])

  useEffect(() => {
    const el = ref.current; if (!el) return
    el.addEventListener('scroll', check)
    check()
    return () => el.removeEventListener('scroll', check)
  }, [])
  if (!articles.length) return null

  return (
    <div className="relative mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <a href={`/category/${slug}`} className="text-sm font-bold border-l-[3px] border-[#C00000] pl-2.5 leading-none">{name}</a>
        <a href={`/category/${slug}`} className="text-[10px] text-gray-400 hover:text-[#C00000] shrink-0">সব দেখুন →</a>
      </div>

      {/* Slider with overflow hidden wrapper */}
      <div className="relative">
        {/* Left Arrow */}
        {left && (
          <button onClick={() => go('l')}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-all">
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}

        {/* Scrollable track */}
        <div ref={ref} className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {articles.map(a => (
            <div key={a.docId} className="w-[calc(25%-6px)] min-w-[130px] sm:min-w-[140px] md:min-w-[150px] lg:min-w-[165px] shrink-0">
              <a href={`/article/${a.slug}`} className="block group bg-[#F0F6FF] rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
                <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  {a.imageUrl ? (
                    <img src={a.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                  )}
                </div>

                <div className="p-2 text-center">
                  <h3 className="text-[13px] font-bold leading-[1.4] text-[#1A1A1A] line-clamp-2 group-hover:text-[#C00000] transition-colors">
                    {a.shoulder && (
                      <span className="text-[#FF0000] mr-1">{a.shoulder} •</span>
                    )}
                    {a.title}
                  </h3>

                  {a.excerpt && (
                    <p className="text-[12px] text-[#555] leading-[1.6] line-clamp-3 mt-1.5">{a.excerpt}</p>
                  )}

                  <p className="text-[10px] text-gray-400 mt-2">১ ঘণ্টা আগে</p>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {right && (
          <button onClick={() => go('r')}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center hover:bg-gray-50 transition-all">
            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {/* Pagination Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? 'bg-[#1A1A1A]' : 'bg-gray-300'}`} />
          ))}
        </div>
      )}
    </div>
  )
}
