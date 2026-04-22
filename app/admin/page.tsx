'use client'

import { useState, useEffect } from 'react'
import { getRecentArticles } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/categories'
import { Card } from '@/components/ui/card'
import { FileText, Folder, TrendingUp, Eye } from 'lucide-react'
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

  const totalArticles = articles.length
  const totalCategories = categories.length
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0)
  const avgViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">মোট নিবন্ধ</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalArticles}</p>
            </div>
            <FileText className="w-10 h-10 text-primary/20" />
          </div>
          <p className="text-xs text-muted-foreground mt-4">সমস্ত সাইট জুড়ে</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">বিভাগসমূহ</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalCategories}</p>
            </div>
            <Folder className="w-10 h-10 text-primary/20" />
          </div>
          <p className="text-xs text-muted-foreground mt-4">সক্রিয় বিভাগ</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">মোট দর্শন</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-10 h-10 text-primary/20" />
          </div>
          <p className="text-xs text-muted-foreground mt-4">সমস্ত সময়</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">গড় দর্শন</p>
              <p className="text-3xl font-bold text-foreground mt-2">{avgViews}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary/20" />
          </div>
          <p className="text-xs text-muted-foreground mt-4">প্রতি নিবন্ধ</p>
        </Card>
      </div>

      {/* Recent Articles */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">সর্বশেষ নিবন্ধ</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">শিরোনাম</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">বিভাগ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">দর্শন</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">প্রকাশিত</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.slice(0, 5).map((article) => (
                  <tr key={article.docId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{article.categoryId}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{article.viewCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a href={`/admin/articles/${article.docId}`} className="text-primary hover:underline">
                        সম্পাদনা
                      </a>
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
