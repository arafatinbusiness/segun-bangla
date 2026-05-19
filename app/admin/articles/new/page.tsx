'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllCategories } from '@/lib/services/category-queries'
import { createArticle } from '@/lib/services/article-mutations'
import { ArticleForm } from '@/components/admin/article-form'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { Category } from '@/lib/types'

function NewArticlePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getAllCategories()
        setCategories(cats)
      } catch (error) {
        console.error('ত্রুটি বিভাগ লোডিং:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

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
        authorId: user?.uid || 'unknown',
      }
      const articleId = await createArticle(articleData)

      if (articleId) {
        alert('নিবন্ধ সফলভাবে তৈরি হয়েছে')
        router.push('/admin/articles')
      } else {
        alert('নিবন্ধ তৈরিতে ত্রুটি হয়েছে')
      }
    } catch (error) {
      console.error('ত্রুটি নিবন্ধ তৈরি করছি:', error)
      alert('নিবন্ধ তৈরিতে ত্রুটি হয়েছে')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">নতুন নিবন্ধ তৈরি করুন</h1>
        <p className="text-muted-foreground mt-2">একটি নতুন নিবন্ধ তৈরি করতে ফর্মটি পূরণ করুন</p>
      </div>

      {!loading ? (
        <ArticleForm categories={categories} onSubmit={handleSubmit} />
      ) : (
        <div className="text-center text-muted-foreground">লোডিং...</div>
      )}
    </div>
  )
}

export default NewArticlePage
