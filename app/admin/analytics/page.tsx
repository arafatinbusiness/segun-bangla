import { getRecentArticles } from '@/lib/services/articles'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Eye, Clock } from 'lucide-react'

async function AnalyticsPage() {
  const articles = await getRecentArticles(100)

  const topArticles = articles
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 10)

  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0)
  const avgViews = articles.length > 0 ? Math.round(totalViews / articles.length) : 0
  const maxViews = Math.max(...articles.map(a => a.viewCount || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">বিশ্লেষণ</h1>
        <p className="text-muted-foreground mt-2">আপনার সাইটের পারফরম্যান্স এবং পরিসংখ্যান দেখুন</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">মোট দর্শন</p>
              <p className="text-3xl font-bold text-foreground mt-2">{totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-10 h-10 text-blue-500/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">গড় দর্শন</p>
              <p className="text-3xl font-bold text-foreground mt-2">{avgViews}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">সর্বোচ্চ দর্শন</p>
              <p className="text-3xl font-bold text-foreground mt-2">{maxViews.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">মোট নিবন্ধ</p>
              <p className="text-3xl font-bold text-foreground mt-2">{articles.length}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500/20" />
          </div>
        </Card>
      </div>

      {/* Top Articles */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">শীর্ষ ১০ নিবন্ধ</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">র‍্যাঙ্ক</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">শিরোনাম</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">দর্শন</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">শতাংশ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">প্রকাশিত</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topArticles.map((article, index) => {
                  const percentage = totalViews > 0 ? Math.round(((article.viewCount || 0) / totalViews) * 100) : 0
                  return (
                    <tr key={article.docId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground max-w-sm truncate">
                        {article.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                        {(article.viewCount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span>{percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(article.publishedAt).toLocaleDateString('bn-BD')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
