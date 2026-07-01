'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllCategories } from '@/lib/services/category-queries'
import { createArticle } from '@/lib/services/article-mutations'
import { ArticleForm } from '@/components/admin/article-form'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

import { db } from '@/lib/firebase'
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
        // If this article is assigned to a special slot, update slot-assignments
        if (data.isLead || data.isSpecial) {
          const slotKey = 
            data.isSpecialOrder === 0 ? 'lead' :
            data.isSpecialOrder === 1 ? 'sp1' :
            data.isSpecialOrder === 2 ? 'sp2' :
            data.isSpecialOrder === 3 ? 'sp3' :
            data.isSpecialOrder === 4 ? 'sp4' :
            data.isSpecialOrder === 5 ? 'extra1' :
            data.isSpecialOrder === 6 ? 'extra2' :
            data.isSpecialOrder === 7 ? 'sp5' :
            data.isSpecialOrder === 8 ? 'sp6' :
            data.isSpecialOrder === 9 ? 'sp7' :
            data.isSpecialOrder === 10 ? 'sp8' : null
          
          if (slotKey) {
            // Get current slot assignments
            const slotDoc = await getDoc(doc(db, 'settings', 'slot-assignments'))
            const currentSlots = slotDoc.exists() ? slotDoc.data() : {}
            
            // If this slot already has an article, clear its special flags
            const existingArticleId = currentSlots[slotKey]
            if (existingArticleId && existingArticleId !== articleId) {
              const existingRef = doc(db, 'articles', existingArticleId)
              await updateDoc(existingRef, {
                isLead: false,
                isSpecial: false,
                isSpecialOrder: -1,
              })
            }
            
            // Update slot-assignments with new article
            await setDoc(doc(db, 'settings', 'slot-assignments'), {
              ...currentSlots,
              [slotKey]: articleId,
            })
          }
        }
        
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
