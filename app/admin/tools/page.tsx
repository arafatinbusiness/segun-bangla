'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, ArrowUpDown, UserSquare2, Eye, Palette, SlidersHorizontal, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Segun Bangla Studio URL — change to production URL when deployed
const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL || 'http://localhost:3000'

const toolItems = [
  {
    label: 'বিশেষ নিবন্ধ সিরিয়াল রিঅ্যারেঞ্জ',
    labelEn: 'Special Articles Reorder',
    description: '১০টি বিশেষ নিবন্ধের ক্রম পরিবর্তন করুন (ড্র্যাগ-এন্ড-ড্রপ)',
    href: '/admin/tools/reorder-special',
    icon: ArrowUpDown,
    status: 'available' as const,
  },
  {
    label: 'ক্যাটাগরি স্লাইডার',
    labelEn: 'Category Sliders',
    description: 'প্রতিটি ক্যাটাগরির জন্য নিউজ স্লাইডার অন/অফ করুন',
    href: '/admin/tools/slider-settings',
    icon: SlidersHorizontal,
    status: 'available' as const,
  },
  {
    label: 'UI টেমপ্লেট',
    labelEn: 'UI Template',
    description: 'ওয়েবসাইটের ডিজাইন টেমপ্লেট পরিবর্তন করুন',
    href: '/admin/tools/ui-template',
    icon: Palette,
    status: 'available' as const,
  },
  {
    label: 'এক্সসার্পট সেটিংস',
    labelEn: 'Excerpt Settings',
    description: 'হোমপেজের বিভিন্ন বিভাগে এক্সসার্পট অন/অফ করুন',
    href: '/admin/tools/excerpt-settings',
    icon: Eye,
    status: 'available' as const,
  },
]

function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">টুলস</h1>
        <p className="text-muted-foreground mt-2">বিভিন্ন টুল ও ইউটিলিটি</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolItems.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="p-6 hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{tool.label}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                        সক্রিয়
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tool.labelEn}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Segun Bangla Studio Integration */}
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <UserSquare2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">প্রোফাইল কার্ড জেনারেটর</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                স্টুডিওতে খুলুন
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              সেগুন বাংলা স্টুডিওতে প্রোফাইল/কোট কার্ড তৈরি করুন — ২টি টেমপ্লেট, ফুল কালার কাস্টমাইজেশন, PNG ডাউনলোড
            </p>
            <a
              href={`${STUDIO_URL}/photocard`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Segun Bangla Studio তে খুলুন
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ToolsPage
