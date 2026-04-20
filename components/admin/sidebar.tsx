'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  FileText,
  Folder,
  Settings,
  Users,
  Home,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  {
    label: 'Overview',
    href: '/admin',
    icon: Home,
  },
  {
    label: 'Articles',
    href: '/admin/articles',
    icon: FileText,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: Folder,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/50 p-6">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold text-foreground hover:text-primary">
          সেগুন বাংলা
        </Link>
        <p className="text-xs text-muted-foreground mt-1">অ্যাডমিন প্যানেল</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t">
        <p className="text-xs text-muted-foreground font-medium mb-3">সংস্করণ</p>
        <p className="text-xs text-muted-foreground">1.0.0</p>
      </div>
    </aside>
  )
}
