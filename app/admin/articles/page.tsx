import { getRecentArticles } from '@/lib/services/articles'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, Eye } from 'lucide-react'
import Link from 'next/link'

async function ArticlesPage() {
  const articles = await getRecentArticles(100)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">নিবন্ধ পরিচালনা</h1>
          <p className="text-muted-foreground mt-2">আপনার সমস্ত নিবন্ধ দেখুন এবং পরিচালনা করুন</p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            নতুন নিবন্ধ তৈরি করুন
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">শিরোনাম</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">বিভাগ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">দর্শন</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">প্রকাশিত</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">অবস্থা</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map((article) => (
                <tr key={article.docId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground max-w-sm truncate">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {article.categoryId}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {article.viewCount || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      প্রকাশিত
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/article/${article.slug}`} target="_blank">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/articles/${article.docId}`}>
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button className="text-muted-foreground hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {articles.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">কোন নিবন্ধ পাওয়া যায়নি</p>
        </Card>
      )}
    </div>
  )
}

export default ArticlesPage
