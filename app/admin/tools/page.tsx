'use client'

import { Card } from '@/components/ui/card'
import { Wrench, ArrowUpDown, Eye, Palette, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

const toolItems = [
  {
    label: 'Special Articles Reorder',
    description: 'Drag & drop to reorder SP-1 to SP-10',
    href: '/admin/tools/reorder-special',
    icon: ArrowUpDown,
    status: 'available' as const,
  },
  {
    label: 'Category Sliders',
    description: 'Enable/disable news sliders per category',
    href: '/admin/tools/slider-settings',
    icon: SlidersHorizontal,
    status: 'available' as const,
  },
  {
    label: 'UI Template',
    description: 'Change website design template',
    href: '/admin/tools/ui-template',
    icon: Palette,
    status: 'available' as const,
  },
  {
    label: 'Excerpt Settings',
    description: 'Enable/disable excerpts on homepage sections',
    href: '/admin/tools/excerpt-settings',
    icon: Eye,
    status: 'available' as const,
  },
]

function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tools</h1>
        <p className="text-muted-foreground mt-2">Manage special features and configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolItems.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="p-6 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tool.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ToolsPage