'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getCategoryBySlug, getSubcategoriesByCategory, getAllCategories } from '@/lib/services/categories'
import { getArticlesByCategory } from '@/lib/services/article-queries'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import type { FirestoreArticle } from '@/lib/types'
import type { Category, Subcategory } from '@/lib/types'

function CategoryPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryData, allCategoriesData] = await Promise.all([
          getCategoryBySlug(slug),
          getAllCategories(),
        ])

        if (!categoryData) {
          setNotFound(true)
          return
        }

        setCategory(categoryData)
        setAllCategories(allCategoriesData)

        const [subcategoriesData, articlesData] = await Promise.all([
          getSubcategoriesByCategory(categoryData.id),
          getArticlesByCategory(categoryData.id),
        ])

        setSubcategories(subcategoriesData)
        setArticles(articlesData)
      } catch (error) {
        console.error('[v0] Error loading category page:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-40 bg-muted rounded-lg"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (notFound || !category) {
    return (
      <>
        <Header categories={allCategories} />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-muted-foreground">৪০৪</h1>
            <p className="text-xl text-muted-foreground">পৃষ্ঠা পাওয়া যায়নি</p>
            <p className="text-muted-foreground">দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা স্থানান্তরিত হয়েছে।</p>
            <a href="/" className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              হোমে ফিরে যান
            </a>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header categories={allCategories} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <a
                  href={`/category/${category.slug}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded whitespace-nowrap"
                >
                  সব
                </a>
                {subcategories.slice(0, 10).map((sub) => (
                  <a
                    key={sub.id}
                    href={`/category/${category.slug}/${sub.slug}`}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded whitespace-nowrap hover:bg-muted/80"
                  >
                    {sub.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.map((article) => (
                  <ArticleCard key={article.docId} article={article} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">এই ক্যাটাগরিতে কোন নিবন্ধ পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default CategoryPage
