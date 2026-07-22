'use client'

import { useState, useEffect } from 'react'
import { getRecentArticles } from '@/lib/services/article-queries'
import { Card } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import type { FirestoreArticle } from '@/lib/types'

function AdminDashboard() {
  const [totalArticles, setTotalArticles] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesData = await getRecentArticles(100)
        setTotalArticles(articlesData.length)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(async () => {
      try {
        const articlesData = await getRecentArticles(100)
        setTotalArticles(articlesData.length)
      } catch {}
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-28 rounded-xl bg-muted/50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
      </div>

      <div className="w-full max-w-xs">
        <Card className="relative overflow-hidden border border-border/50">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Total Articles</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{totalArticles}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <FileText className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 bg-clip-text text-transparent" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard