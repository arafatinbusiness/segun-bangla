'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import type { Category } from '@/lib/types'

interface HeaderProps {
  categories: Category[]
}

export function Header({ categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, profile } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top Bar */}
      <div className="bg-foreground text-background text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="text-xs">
            আজকের তারিখ: {new Date().toLocaleDateString('bn-BD')}
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
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-2xl font-bold text-foreground">
            সেগুন বাংলা
          </Link>
          <div className="hidden md:flex gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-foreground/80"
            >
              লাইভ টিভি
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-foreground/80"
            >
              আরও
            </Button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Category Navigation */}
        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block border-t md:border-t-0 pt-4 md:pt-0`}>
          <div className="flex flex-col md:flex-row gap-1 md:gap-6 overflow-x-auto pb-2">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-foreground/80 whitespace-nowrap py-2 md:py-0"
            >
              হোম
            </Link>
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-sm font-medium text-foreground hover:text-foreground/80 whitespace-nowrap py-2 md:py-0"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
