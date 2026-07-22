'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAdminArticles } from '@/lib/services/article-queries'
import { deleteArticle, deleteArticles } from '@/lib/services/article-mutations'
import { getAllCategories } from '@/lib/services/categories'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Edit2, Eye, Plus, Search, FileText, ChevronLeft, ChevronRight, Film, History, LayoutGrid, Image, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'

import type { FirestoreArticle, Category } from '@/lib/types'

const PAGE_SIZE = 20

function ArticlesPage() {
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCursors, setPageCursors] = useState<any[]>([null])

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

  const getCategoryNames = (article: FirestoreArticle): string => {
    const ids = article.categoryIds || (article.categoryId ? [article.categoryId] : [])
    return ids.map(id => {
      const cat = categories.find(c => c.id === id)
      return cat?.name || id
    }).join(', ')
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Published</span>
      case 'draft':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Draft</span>
      case 'scheduled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Scheduled</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Unknown</span>
    }
  }

  const handleDelete = async (articleId: string) => {
    setDeleting(true)
    try {
      await deleteArticle(articleId)
      setArticles((prev) => prev.filter((a) => a.docId !== articleId))
      toast.success('Article deleted')
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    try {
      await deleteArticles(Array.from(selectedIds))
      setArticles((prev) => prev.filter((a) => a.docId && !selectedIds.has(a.docId)))
      toast.success(`${selectedIds.size} articles deleted`)
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Error bulk deleting:', error)
      toast.error('Failed to delete some articles')
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredArticles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredArticles.map((a) => a.docId!)))
    }
  }

  const goToPage = (page: number) => {
    if (page < 1) return
    if (page > currentPage && !hasMore) return
    if (page > pageCursors.length - 1) {
      setPageCursors((prev) => [...prev, lastDoc])
    }
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Page {currentPage} &bull; {articles.length} articles
          </p>
        </div>
        <Link href="/admin/articles/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="p-4 border border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border/50 focus-visible:ring-primary/30"
          />
        </div>
      </Card>

      {/* Articles Table */}
      <Card className="border border-border/50 overflow-hidden">
        {filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-b border-border/50">
                  <th className="px-6 py-4 text-left w-10">
                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.size === filteredArticles.length && filteredArticles.length > 0} className="w-4 h-4 accent-primary rounded" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/70 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/70 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground/70 uppercase tracking-wider hidden lg:table-cell">Published</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-foreground/70 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredArticles.map((article) => (
                  <tr key={article.docId} className={`hover:bg-primary/[0.02] transition-colors group ${selectedIds.has(article.docId!) ? 'bg-primary/[0.03]' : ''}`}>
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedIds.has(article.docId!)} onChange={() => toggleSelect(article.docId!)} className="w-4 h-4 accent-primary rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {article.imageUrl && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block border border-border/40">
                            <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground/90 group-hover:text-foreground truncate max-w-[250px] md:max-w-[300px] transition-colors">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground/50 truncate max-w-[250px]">
                            /{article.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground/70 hidden md:table-cell">
                      {getCategoryNames(article)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground/70 hidden lg:table-cell">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/article/${article.slug}`} target="_blank">
                          <button className="p-2 text-muted-foreground/60 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <a href={`${process.env.NEXT_PUBLIC_STUDIO_URL || 'https://segun-bangla-studio.vercel.app'}/social-card?article=${article.docId}`} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground/60 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950" title="Social Card">
                          <Image className="w-4 h-4" />
                        </a>
                        <a href={`${process.env.NEXT_PUBLIC_STUDIO_URL || 'https://segun-bangla-studio.vercel.app'}/studio?article=${article.docId}`} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground/60 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950" title="Video Reel">
                          <Film className="w-4 h-4" />
                        </a>
                        <Link href={`/admin/articles/${article.docId}`}>
                          <button className="p-2 text-muted-foreground/60 hover:text-primary transition-colors rounded-lg hover:bg-primary/5" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        {article.editHistory && article.editHistory.length > 0 && (
                          <div className="relative group">
                            <button className="p-2 text-muted-foreground/60 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950" title="History">
                              <History className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-foreground">Edit History</h4>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                {[...article.editHistory].reverse().map((entry, idx) => (
                                  <div key={idx} className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                      entry.action === 'created' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                      entry.action === 'published' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                      entry.action === 'updated' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                    }`}>
                                      {entry.action === 'created' ? 'Created' : entry.action === 'published' ? 'Published' : entry.action === 'updated' ? 'Updated' : 'Unpublished'}
                                    </span>
                                    <p className="text-xs text-foreground mt-1">{entry.editorName}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {new Date(entry.timestamp).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-2 text-muted-foreground/60 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{article.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.docId!)} disabled={deleting} className="bg-red-600 text-white hover:bg-red-700">
                                {deleting ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'No articles match your filter' : 'No articles created yet'}
            </p>
            {!searchQuery && (
              <Link href="/admin/articles/new">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Article
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Bulk Delete Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border/50 shadow-xl rounded-xl px-5 py-3 flex items-center gap-4">
          <span className="text-sm text-foreground font-medium">{selectedIds.size} selected</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-red-600 text-white hover:bg-red-700 gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedIds.size} articles?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-red-600 text-white hover:bg-red-700">
                  {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size} Articles`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())} className="border-border/50">
            Clear
          </Button>
        </div>
      )}

      {/* Pagination */}
      {filteredArticles.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} &bull; {PAGE_SIZE} per page
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || loadingMore} className="gap-1 border-border/50">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm font-medium text-foreground px-3 py-1 rounded-lg bg-muted/70">{currentPage}</span>
            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={!hasMore || loadingMore} className="gap-1 border-border/50">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {loadingMore && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl shadow-lg flex items-center gap-3 border border-border/50">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-foreground">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticlesPage