'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { logoutUser } from '@/lib/services/auth'
import {
  BarChart3,
  FileText,
  Folder,
  Settings,
  Users,
  Home,
  ChevronRight,
  LogOut,
  Newspaper,
  Megaphone,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    label: 'ড্যাশবোর্ড',
    labelEn: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    label: 'নিবন্ধ',
    labelEn: 'Articles',
    href: '/admin/articles',
    icon: FileText,
  },
  {
    label: 'বিভাগ',
    labelEn: 'Categories',
    href: '/admin/categories',
    icon: Folder,
  },
  {
    label: 'বিজ্ঞাপন',
    labelEn: 'Advertisements',
    href: '/admin/advertisements',
    icon: Megaphone,
  },
  {
    label: 'বিশ্লেষণ',
    labelEn: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'ব্যবহারকারী',
    labelEn: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'সেটিংস',
    labelEn: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    label: 'টুলস',
    labelEn: 'Tools',
    href: '/admin/tools',
    icon: Wrench,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <aside className="w-52 border-r bg-card flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Newspaper className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              সেগুন বাংলা
            </p>
            <p className="text-[10px] text-muted-foreground">অ্যাডমিন প্যানেল</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
              <div className="flex-1 min-w-0">
                <span className="block truncate">{item.label}</span>
                <span className={cn(
                  'block text-[10px] truncate',
                  isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {item.labelEn}
                </span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
        <div className="px-3">
          <p className="text-[10px] text-muted-foreground">সংস্করণ 1.0.0</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>লগ আউট</span>
        </Button>
      </div>
    </aside>
  )
}
