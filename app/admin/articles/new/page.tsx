'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllCategories } from '@/lib/services/category-queries'
import { createArticle } from '@/lib/services/article-mutations'
import { ArticleForm } from '@/components/admin/article-form'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { autoShiftSlots } from '@/lib/services/slot-shift'
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
        console.error('Error loading categories:', error)
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

      // Note: Do NOT auto-add "স্পেশাল" category. 
      // Column 1 (special slot) and Column 2 (categories) are independent.
      // Selecting SP-1 in Column 1 should NOT check "স্পেশাল" in Column 2.

      const subcategoryIds = data.subcategoryIds || []
      const primarySubcategoryId = subcategoryIds.length > 0 ? subcategoryIds[0] : data.subcategoryId || ''

      const articleData: Record<string, any> = {
        ...data,
        categoryIds: categoryIds,
        subcategoryId: primarySubcategoryId,
        subcategoryIds: subcategoryIds,
        authorId: user?.uid || 'unknown',
      }
      // Only set categoryId if a category is selected (for backward compatibility)
      if (categoryIds.length > 0) {
        articleData.categoryId = categoryIds[0]
      }

      const editor = user ? {
        uid: user.uid,
        name: user.displayName || user.email || 'Unknown',
        email: user.email || 'unknown@email.com',
      } : undefined
      const articleId = await createArticle(articleData, editor)

      if (articleId) {
        // If this article is assigned to a special slot, auto-shift all slots
        if (data.isLead || data.isSpecial) {
          const targetSlot = typeof data.isSpecialOrder === 'number' ? data.isSpecialOrder : 0
          await autoShiftSlots(targetSlot, articleId)
        }
        
        alert('Article created successfully')
        router.push('/admin/articles')
      } else {
        alert('Error creating article')
      }

    } catch (error) {
      console.error('Error creating article:', error)
      alert('Error creating article')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Article</h1>
        <p className="text-muted-foreground mt-2">Fill in the form to create a new article</p>
      </div>

      {!loading ? (
        <ArticleForm categories={categories} onSubmit={handleSubmit} />
      ) : (
        <div className="text-center text-muted-foreground">Loading...</div>
      )}
    </div>
  )
}

export default NewArticlePage
