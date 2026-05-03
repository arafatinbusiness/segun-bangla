'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { User, Search, Youtube, Facebook } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import type { Category } from '@/lib/types'

interface HeaderProps {
  categories: Category[]
}

export function Header({ categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState('')
  const { isAuthenticated, profile } = useAuth()

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('bn-BD'))
  }, [])

  const row1Categories = categories.slice(0, 9)
  const row2Categories = categories.slice(9)

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top Bar */}
      <div className="bg-foreground text-background text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-xs">
            আজকের তারিখ: {currentDate}
          </div>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-xs">{profile?.displayName}</span>
                <Link href="/profile" className="hover:underline flex items-center gap-1">
                  <User size={16} />
                  প্রোফাইল
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">
                  লগইন
                </Link>
                <Link href="/register" className="hover:underline">
                  নিবন্ধন
                </Link>
              </>
            )}
            <a href="#" className="hover:underline">
              সাবস্ক্রাইব
            </a>
          </div>
        </div>
      </div>

      {/* Logo and Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-stretch gap-0 md:w-fit md:mx-auto">
          {/* Logo - spans full height of two nav rows */}
          <Link
            href="/"
            className="flex items-center min-w-[140px] pr-6 border-r border-border shrink-0"
          >
            <span className="text-2xl font-bold text-foreground leading-tight">
              সেগুন বাংলা
            </span>
          </Link>

          {/* Navigation Grid - Two Rows */}
          <div className="flex flex-col justify-center pl-6 min-w-0">
            {/* Row 1 - First 9 categories + Search icon */}
            <div className="flex items-center gap-1 md:gap-5 flex-wrap pb-2">
              {row1Categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-sm font-medium text-foreground hover:text-foreground/80 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                href="/search"
                className="text-foreground hover:text-foreground/80"
              >
                <Search size={18} />
              </Link>
            </div>

            {/* Row 2 - Remaining categories + icons */}
            <div className="flex items-center gap-1 md:gap-5 flex-wrap pt-2 border-t border-border">
              {row2Categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-sm font-medium text-foreground hover:text-foreground/80 whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-foreground/80"
              >
                <Youtube size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-foreground/80"
              >
                <Facebook size={18} />
              </a>
              <Link
                href="/search"
                className="text-sm font-medium text-primary hover:text-primary/80 whitespace-nowrap font-semibold"
              >
                সব দেখুন →
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Category Navigation */}
        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden pt-4`}>
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-sm font-medium text-foreground hover:text-foreground/80 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-sm font-medium text-primary hover:text-primary/80 font-semibold py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              সব দেখুন →
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
