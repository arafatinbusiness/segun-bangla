'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getArticleById } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/category-queries'
import { updateArticle } from '@/lib/services/article-mutations'
import { ArticleForm } from '@/components/admin/article-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/lib/types'

function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params?.id as string

  const [article, setArticle] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articleData, cats] = await Promise.all([
          getArticleById(articleId),
          getAllCategories(),
        ])
        if (!articleData) {
          setNotFound(true)
          return
        }
        // Convert old single-category format to new multi-category format
        if (articleData) {
          if (!articleData.categoryIds && articleData.categoryId) {
            articleData.categoryIds = [articleData.categoryId]
          }
          if (!articleData.subcategoryIds && articleData.subcategoryId) {
            articleData.subcategoryIds = [articleData.subcategoryId]
          }
        }
        setArticle(articleData)

        setCategories(cats)
      } catch (error) {
        console.error('Error fetching article:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (articleId) fetchData()
  }, [articleId])

  const handleSubmit = async (data: any) => {
    try {
      // Use first category as primary categoryId for backward compatibility
      let categoryIds = data.categoryIds || []

      // If isSpecial is checked, auto-assign to "special" category
      if (data.isSpecial) {
        const specialCat = categories.find(
          (c) => c.slug === 'special' || c.slug === 'বিশেষ'
        )
        if (specialCat?.id && !categoryIds.includes(specialCat.id)) {
          categoryIds = [...categoryIds, specialCat.id]
        }
      }

      const primaryCategoryId = categoryIds.length > 0 ? categoryIds[0] : data.categoryId || ''
      const subcategoryIds = data.subcategoryIds || []
      const primarySubcategoryId = subcategoryIds.length > 0 ? subcategoryIds[0] : data.subcategoryId || ''

      const articleData = {
        ...data,
        categoryId: primaryCategoryId,
        categoryIds: categoryIds,
        subcategoryId: primarySubcategoryId,
        subcategoryIds: subcategoryIds,
      }
      await updateArticle(articleId, articleData)

      alert('নিবন্ধ সফলভাবে আপডেট হয়েছে')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Error updating article:', error)
      alert('নিবন্ধ আপডেট করতে ত্রুটি হয়েছে')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">নিবন্ধ সম্পাদনা</h1>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">নিবন্ধ পাওয়া যায়নি</h1>
            <p className="text-muted-foreground mt-1">এই নিবন্ধটি বিদ্যমান নেই বা সরানো হয়েছে</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/articles"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">নিবন্ধ সম্পাদনা</h1>
          <p className="text-muted-foreground mt-1">
            "{article.title}" সম্পাদনা করুন
          </p>
        </div>
      </div>

      <ArticleForm
        article={article}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default EditArticlePage
