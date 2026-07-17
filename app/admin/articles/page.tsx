'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAdminArticles } from '@/lib/services/article-queries'
import { deleteArticle } from '@/lib/services/article-mutations'
import { getAllCategories } from '@/lib/services/categories'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Edit2, Eye, Plus, Search, FileText, ChevronLeft, ChevronRight, Image, Facebook, Instagram, Video, IdCard, Film, History, LayoutGrid } from 'lucide-react'
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

import { generateAndDownloadSocialCard } from '@/lib/social-card-generator'
import type { SocialCardFormat } from '@/lib/social-card-generator'
import type { FirestoreArticle, Category } from '@/lib/types'

const PAGE_SIZE = 20

function ArticlesPage() {
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [deleting, setDeleting] = useState(false)

  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCursors, setPageCursors] = useState<any[]>([null]) // cursor for each page
  const [generating, setGenerating] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const generatingRef = useRef(false)

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
      // Dialog closes automatically via AlertDialog

    } catch (error) {
      console.error('Error deleting article:', error)
      alert('নিবন্ধ মুছতে ত্রুটি হয়েছে')
    } finally {
      setDeleting(false)
    }
  }

  const handleGenerateCard = async (article: FirestoreArticle, format: SocialCardFormat, label: string) => {
    if (generatingRef.current) return
    generatingRef.current = true
    setGenerating(true)
    setProgressMsg(`সোশ্যাল কার্ড তৈরি হচ্ছে (${label})...`)
    
    try {
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
      
      const formatLabels: Record<SocialCardFormat, string> = {
        facebook: 'ফেসবুক',
        square: 'ইনস্টাগ্রাম',
        story: 'স্টোরি/টিকটক',
        passport: 'পোর্ট্রেট',
      }
      
      await generateAndDownloadSocialCard(
        { title: article.title, date: dateStr, imageUrl: article.imageUrl },
        `Segun Bangla - ${article.slug}.png`,
        format,
        (msg) => {
          if (msg) setProgressMsg(msg)
        }
      )
    } finally {
      generatingRef.current = false
      setGenerating(false)
      setProgressMsg('')
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
                      {getCategoryNames(article)}
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
                        {/* Social Card Dropdown */}
                        <div className="relative group">
                          <button
                            className="p-2 text-muted-foreground hover:text-purple-600 transition-colors rounded-lg hover:bg-muted"
                            title="সোশ্যাল কার্ড"
                          >
                            <Image className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                            <div className="py-1">
                              <button
                                onClick={() => handleGenerateCard(article, 'facebook', 'ফেসবুক')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Facebook className="w-4 h-4 text-blue-600" />
                                <span className="text-left">ফেসবুক</span>
                                <span className="ml-auto text-[10px] text-gray-400">4:5</span>
                              </button>
                              <button
                                onClick={() => handleGenerateCard(article, 'square', 'ইনস্টাগ্রাম')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Instagram className="w-4 h-4 text-pink-600" />
                                <span className="text-left">ইনস্টাগ্রাম</span>
                                <span className="ml-auto text-[10px] text-gray-400">1:1</span>
                              </button>
                              <button
                                onClick={() => handleGenerateCard(article, 'story', 'স্টোরি/টিকটক')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Video className="w-4 h-4 text-purple-600" />
                                <span className="text-left">স্টোরি/টিকটক</span>
                                <span className="ml-auto text-[10px] text-gray-400">9:16</span>
                              </button>
                              <button
                                onClick={() => handleGenerateCard(article, 'passport', 'পোর্ট্রেট')}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <IdCard className="w-4 h-4 text-amber-700" />
                                <span className="text-left">পোর্ট্রেট</span>
                                <span className="ml-auto text-[10px] text-gray-400">ছবি</span>
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                              <a
                                href={`${process.env.NEXT_PUBLIC_STUDIO_URL || 'https://segun-bangla-studio.vercel.app'}/studio?article=${article.docId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Film className="w-4 h-4 text-red-600" />
                                <span className="text-left">ভিডিও রিল</span>
                                <span className="ml-auto text-[10px] text-gray-400">9:16</span>
                              </a>
                            </div>
                          </div>
                        </div>
                        <Link href={`/admin/articles/${article.docId}`}>
                          <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted" title="সম্পাদনা">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        {/* Edit History Button */}
                        {article.editHistory && article.editHistory.length > 0 && (
                          <div className="relative group">
                            <button
                              className="p-2 text-muted-foreground hover:text-amber-600 transition-colors rounded-lg hover:bg-muted"
                              title="সম্পাদনার ইতিহাস"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-foreground">সম্পাদনার ইতিহাস</h4>
                              </div>
                              <div className="max-h-60 overflow-y-auto">
                                {[...article.editHistory].reverse().map((entry, idx) => (
                                  <div key={idx} className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                        entry.action === 'created' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        entry.action === 'published' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        entry.action === 'updated' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                      }`}>
                                        {entry.action === 'created' ? 'তৈরি' :
                                         entry.action === 'published' ? 'প্রকাশিত' :
                                         entry.action === 'updated' ? 'হালনাগাদ' : 'অপ্রকাশিত'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-foreground mt-1">{entry.editorName}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {new Date(entry.timestamp).toLocaleString('bn-BD', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 text-muted-foreground hover:text-red-600 transition-colors rounded-lg hover:bg-muted"
                              title="মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>নিবন্ধটি মুছবেন?</AlertDialogTitle>
                              <AlertDialogDescription>
                                আপনি কি নিশ্চিতভাবে "{article.title}" নিবন্ধটি মুছতে চান? 
                                এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(article.docId!)}
                                disabled={deleting}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                {deleting ? 'মুছছে...' : 'মুছুন'}
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
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">কোন নিবন্ধ পাওয়া যায়নি</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'আপনার ফিল্টারের সাথে মিলে এমন কোন নিবন্ধ নেই'
                : 'এখনও কোন নিবন্ধ তৈরি করা হয়নি'}
            </p>
            {!searchQuery && (

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

      {/* Social Card Generation Progress */}
      {generating && (
        <div className="fixed inset-0 bg-background/60 flex items-center justify-center z-[100]">
          <div className="bg-card p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 min-w-[280px]">
            <div className="relative w-12 h-12">
              <span className="absolute inset-0 w-12 h-12 border-[3px] border-primary/20 rounded-full" />
              <span className="absolute inset-0 w-12 h-12 border-[3px] border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-sm font-medium text-foreground text-center">{progressMsg}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticlesPage
