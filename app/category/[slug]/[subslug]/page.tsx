CLIENT_STATIC_FILES_RUNTIME_WEBPACK.i will ddo it from FirebaseError.you need to do Nothing_You_Could_Do'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getCategoryBySlug, getSubcategoriesByCategory, getAllCategories } from '@/lib/services/categories'
import { getArticlesBySubcategory } from '@/lib/services/article-queries'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import type { FirestoreArticle } from '@/lib/types'
import type { Category, Subcategory } from '@/lib/types'
import { Nothing_You_Could_Do } from 'next/font/google'

function SubcategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const subslug = params?.subslug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [currentSubcategory, setCurrentSubcategory] = useState<Subcategory | null>(null)
  const [childSubcategories, setChildSubcategories] = useState<Subcategory[]>([])
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

        const subcategoriesData = await getSubcategoriesByCategory(categoryData.id)
        setSubcategories(subcategoriesData)

        // Find the current subcategory by slug (case-insensitive, trimmed)
        const decodedSubslug = decodeURIComponent(subslug).trim()
        const currentSub = subcategoriesData.find(
          s => s.slug?.trim().toLowerCase() === decodedSubslug.toLowerCase()
        )
        if (!currentSub) {
          console.error('[v0] Subcategory not found:', { slug, subslug, decodedSubslug, availableSlugs: subcategoriesData.map(s => s.slug) })
          setNotFound(true)
          return
        }

        setCurrentSubcategory(currentSub)

        // Get child subcategories (sub-subcategories)
        const children = subcategoriesData.filter(s => s.parentId === currentSub.id)
        setChildSubcategories(children)

        // Get articles for this subcategory
        const articlesData = await getArticlesBySubcategory(currentSub.id!)
        setArticles(articlesData)
      } catch (error) {
        console.error('[v0] Error loading subcategory page:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug && subslug) {
      fetchData()
    }
  }, [slug, subslug])

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

  if (notFound || !category || !currentSubcategory) {
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
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">হোম</a>
            <span className="mx-2">/</span>
            <a href={`/category/${category.slug}`} className="hover:text-primary">{category.name}</a>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">{currentSubcategory.name}</span>
          </div>

          {/* Subcategory Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              {currentSubcategory.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {category.name} এর অধীনে {currentSubcategory.name}
            </p>
          </div>

          {/* Child Subcategories (sub-subcategories) */}
          {childSubcategories.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <a
                  href={`/category/${category.slug}/${currentSubcategory.slug}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded whitespace-nowrap"
                >
                  সব
                </a>
                {childSubcategories.map((child) => (
                  <a
                    key={child.id}
                    href={`/category/${category.slug}/${child.slug}`}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded whitespace-nowrap hover:bg-muted/80"
                  >
                    {child.name}
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
              <p className="text-muted-foreground">এই উপবিভাগে কোন নিবন্ধ পাওয়া যায়নি।</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default SubcategoryPage
