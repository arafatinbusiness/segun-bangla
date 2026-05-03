'use client'

import { useState, useEffect } from 'react'
import { getRecentArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Card } from '@/components/ui/card'
import { FileText, Folder, TrendingUp, Eye, Clock, FileEdit } from 'lucide-react'
import Link from 'next/link'
import type { FirestoreArticle } from '@/lib/types'
import type { Category } from '@/lib/types'

function AdminDashboard() {
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          getRecentArticles(100),
          getAllCategories(),
        ])
        setArticles(articlesData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  const totalArticles = articles.length
  const totalCategories = categories.length
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0)
  const avgViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0
  const draftCount = articles.filter(a => a.status === 'draft').length
  const publishedCount = articles.filter(a => a.status === 'published').length

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ড্যাশবোর্ড</h1>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground mt-2">আপনার সাইটের পরিসংখ্যান এবং সংক্ষিপ্ত পরিদর্শন</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">মোট নিবন্ধ</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalArticles}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {publishedCount} প্রকাশিত
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              {draftCount} খসড়া
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">বিভাগসমূহ</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Folder className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">সক্রিয় বিভাগ</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">মোট দর্শন</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalViews.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">সমস্ত সময়</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">গড় দর্শন</p>
              <p className="text-3xl font-bold text-foreground mt-2">{avgViews}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">প্রতি নিবন্ধ</p>
        </Card>
      </div>

      {/* Recent Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">সর্বশেষ নিবন্ধ</h2>
          <Link href="/admin/articles" className="text-sm text-primary hover:underline">
            সব দেখুন →
          </Link>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">শিরোনাম</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground hidden md:table-cell">বিভাগ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground hidden md:table-cell">দর্শন</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">অবস্থা</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.slice(0, 5).map((article) => (
                  <tr key={article.docId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      {getCategoryName(article.categoryId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {article.viewCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {article.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          প্রকাশিত
                        </span>
                      ) : article.status === 'draft' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                          খসড়া
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          নির্ধারিত
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/articles/${article.docId}`} className="text-primary hover:underline">
                        সম্পাদনা
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
