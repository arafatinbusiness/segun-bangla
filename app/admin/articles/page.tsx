'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAdminArticles } from '@/lib/services/article-queries'
import { deleteArticle } from '@/lib/services/article-mutations'
import { getAllCategories } from '@/lib/services/categories'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Edit2, Eye, Plus, Search, FileText, AlertTriangle, X, ChevronLeft, ChevronRight, Image } from 'lucide-react'
import Link from 'next/link'
import { generateAndDownloadSocialCard } from '@/lib/social-card-generator'
import type { FirestoreArticle, Category } from '@/lib/types'

const PAGE_SIZE = 20

function ArticlesPage() {
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCursors, setPageCursors] = useState<any[]>([null]) // cursor for each page

  const fetchData = useCallback(async (page: number) => {
    if (page === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    try {
      const cursor = pageCursors[page - 1] || null
      const [categoriesData, result] = await Promise.all([
        getAllCategories(),
        getAdminArticles(PAGE_SIZE, cursor),
      ])
      setCategories(categoriesData)
      setArticles(result.articles)
      setLastDoc(result.lastVisible)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [pageCursors])

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage, fetchData])

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || categoryId
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            প্রকাশিত
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            খসড়া
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            নির্ধারিত
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            অজানা
          </span>
        )
    }
  }

  const handleDelete = async (articleId: string) => {
    setDeleting(true)
    try {
      await deleteArticle(articleId)
      setArticles((prev) => prev.filter((a) => a.docId !== articleId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('নিবন্ধ মুছতে ত্রুটি হয়েছে')
    } finally {
      setDeleting(false)
    }
  }

  const goToPage = (page: number) => {
    if (page < 1) return
    if (page > currentPage && !hasMore) return
    // Store the cursor for the current page before navigating
    if (page > pageCursors.length - 1) {
      setPageCursors((prev) => [...prev, lastDoc])
    }
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">নিবন্ধ পরিচালনা</h1>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">নিবন্ধ পরিচালনা</h1>
          <p className="text-muted-foreground mt-1">
            পৃষ্ঠা {currentPage} • {articles.length}টি নিবন্ধ
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            নতুন নিবন্ধ
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="নিবন্ধ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'published', 'draft', 'scheduled'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="whitespace-nowrap"
              >
                {status === 'all' ? 'সব' : status === 'published' ? 'প্রকাশিত' : status === 'draft' ? 'খসড়া' : 'নির্ধারিত'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Articles Table */}
      <Card>
        {filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">শিরোনাম</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground hidden md:table-cell">বিভাগ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground hidden md:table-cell">দর্শন</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground hidden lg:table-cell">প্রকাশিত</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">অবস্থা</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredArticles.map((article) => (
                  <tr key={article.docId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {article.imageUrl && (
                          <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0 hidden sm:block">
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[250px] md:max-w-[300px]">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            /{article.slug}
                          </p>
                        </div>
                      </div>
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
                    <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('bn-BD', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/article/${article.slug}`} target="_blank">
                          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted" title="দেখুন">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            const dateStr = article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString('bn-BD', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : new Date().toLocaleDateString('bn-BD', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                            generateAndDownloadSocialCard(
                              {
                                title: article.title,
                                date: dateStr,
                                imageUrl: article.imageUrl,
                              },
                              `social-card-${article.slug}.png`
                            )
                          }}
                          className="p-2 text-muted-foreground hover:text-purple-600 transition-colors rounded-lg hover:bg-muted"
                          title="সোশ্যাল কার্ড তৈরি করুন"
                        >
                          <Image className="w-4 h-4" />
                        </button>
                        <Link href={`/admin/articles/${article.docId}`}>
                          <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted" title="সম্পাদনা">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        {deleteConfirm === article.docId ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(article.docId!)}
                              disabled={deleting}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                              title="নিশ্চিত করুন"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                              title="বাতিল"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(article.docId!)}
                            className="p-2 text-muted-foreground hover:text-red-600 transition-colors rounded-lg hover:bg-muted"
                            title="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">কোন নিবন্ধ পাওয়া যায়নি</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'আপনার ফিল্টারের সাথে মিলে এমন কোন নিবন্ধ নেই'
                : 'এখনও কোন নিবন্ধ তৈরি করা হয়নি'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/admin/articles/new">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  প্রথম নিবন্ধ তৈরি করুন
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {filteredArticles.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            পৃষ্ঠা {currentPage} • প্রতি পৃষ্ঠায় {PAGE_SIZE}টি
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1 || loadingMore}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              পূর্ববর্তী
            </Button>
            <span className="text-sm font-medium text-foreground px-3 py-1 rounded-lg bg-muted">
              {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasMore || loadingMore}
              className="gap-1"
            >
              পরবর্তী
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Loading overlay for page transitions */}
      {loadingMore && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-foreground">লোড হচ্ছে...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticlesPage
