'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getArticleById } from '@/lib/services/article-queries'
import { getAllCategories } from '@/lib/services/category-queries'
import { updateArticle } from '@/lib/services/article-mutations'
import { ArticleForm } from '@/components/admin/article-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { autoShiftSlots, reverseShiftSlots, getSlotAssignments } from '@/lib/services/slot-shift'
import { db } from '@/lib/firebase'
import type { Category } from '@/lib/types'


function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
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

      const subcategoryIds = data.subcategoryIds || []
      const primarySubcategoryId = subcategoryIds.length > 0 ? subcategoryIds[0] : data.subcategoryId || ''

      const articleData: Record<string, any> = {
        ...data,
        categoryIds: categoryIds,
        subcategoryId: primarySubcategoryId,
        subcategoryIds: subcategoryIds,
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
      await updateArticle(articleId, articleData, editor)

      // Check if this article was previously in a slot
      const slotAssignments = await getSlotAssignments()
      let foundSlot = -1
      const SLOT_KEYS = ['lead', 'sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8', 'sp9', 'sp10']
      for (let i = 0; i < SLOT_KEYS.length; i++) {
        if (slotAssignments[SLOT_KEYS[i]] === articleId) {
          foundSlot = i
          break
        }
      }

      const targetSlot = data.isLead ? 0 : (typeof data.isSpecialOrder === 'number' ? data.isSpecialOrder : -1)

      if (data.isLead || data.isSpecial) {
        if (targetSlot === foundSlot) {
          // Article already in this exact slot — no shift needed
          // Just update its flags in case they changed
          await updateDoc(doc(db, 'articles', articleId), {
            isLead: targetSlot === 0,
            isSpecial: targetSlot !== 0,
            isSpecialOrder: targetSlot,
          })
          // Also update slot-assignments to ensure it's there
          const newSlots = { ...slotAssignments, [SLOT_KEYS[targetSlot]]: articleId }
          await setDoc(doc(db, 'settings', 'slot-assignments'), newSlots)
        } else {
          // Article is being assigned to a DIFFERENT slot → push/shift down
          await autoShiftSlots(targetSlot, articleId)
        }
      } else if (foundSlot >= 0) {
        // Article was in a slot but no longer special → remove and shift up
        await reverseShiftSlots(foundSlot)
      }

      alert('Article updated successfully')
      router.push('/admin/articles')

    } catch (error) {
      console.error('Error updating article:', error)
      alert('Error updating article')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Article</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Article Not Found</h1>
            <p className="text-muted-foreground mt-1">This article does not exist or has been removed</p>
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
          <h1 className="text-3xl font-bold text-foreground">Edit Article</h1>
          <p className="text-muted-foreground mt-1">
            Editing "{article.title}"
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
