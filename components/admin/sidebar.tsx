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
  LogOut,
  Newspaper,
  Megaphone,
  Wrench,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    label: 'Dashboard',
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
    label: 'Advertisements',
    href: '/admin/advertisements',
    icon: Megaphone,
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
  {
    label: 'Tools',
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
    <aside className="w-56 border-r border-border/50 bg-card flex flex-col shrink-0 shadow-sm">
      {/* Logo */}
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20 group-hover:shadow-md group-hover:shadow-primary/30 transition-shadow">
            <Newspaper className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
              Segun Bangla
            </p>
            <p className="text-[10px] text-muted-foreground/70 font-medium">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm relative group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-foreground/80 hover:text-foreground hover:bg-muted/70'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'bg-white/15'
                  : 'bg-muted/50 group-hover:bg-muted-foreground/10'
              )}>
                <Icon className={cn(
                  'w-4 h-4',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground/70'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block truncate font-medium leading-tight">{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1 h-6 rounded-full bg-white/60 absolute right-2" />
              )}
              {!isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-all duration-200" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 space-y-3 bg-gradient-to-b from-transparent to-muted/20">
        <div className="px-3.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-muted-foreground/60 font-medium">System Online</p>
          </div>
          <p className="text-[9px] text-muted-foreground/40 mt-0.5">v1.0.0</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-destructive border-border/50 hover:border-destructive/30 hover:bg-destructive/5 transition-all rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  )
}