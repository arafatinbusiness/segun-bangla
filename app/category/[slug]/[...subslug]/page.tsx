'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getCategoryBySlug, getSubcategoriesByCategory, getAllCategories } from '@/lib/services/categories'
import { getArticlesBySubcategory } from '@/lib/services/article-queries'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import type { FirestoreArticle } from '@/lib/types'
import type { Category, Subcategory } from '@/lib/types'

function SubcategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const subslug = params?.subslug as string[] | undefined

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [currentSubcategory, setCurrentSubcategory] = useState<Subcategory | null>(null)
  const [childSubcategories, setChildSubcategories] = useState<Subcategory[]>([])
  const [breadcrumbPath, setBreadcrumbPath] = useState<Subcategory[]>([])
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

        // If no subslug segments, this is the category page - shouldn't happen but handle gracefully
        if (!subslug || subslug.length === 0) {
          setNotFound(true)
          return
        }

        // Traverse the hierarchy using parentId to find the deepest subcategory
        // The URL segments are: /category/slug/level1/level2/level3/...
        // We need to find the chain: root subcategory → child → grandchild → ...
        const decodedSegments = subslug.map(s => decodeURIComponent(s).trim())

        // Find the first-level subcategory (parentId is null or undefined)
        let currentLevel: Subcategory[] = subcategoriesData.filter(
          s => !s.parentId || s.parentId === ''
        )

        let foundSub: Subcategory | null = null
        const path: Subcategory[] = []

        for (let i = 0; i < decodedSegments.length; i++) {
          const segmentSlug = decodedSegments[i]
          // Try exact match first, then try replacing hyphens with spaces
          // (since slugs in DB may have spaces but URLs use hyphens)
          const match = currentLevel.find(
            s => s.slug?.trim().toLowerCase() === segmentSlug.toLowerCase() ||
                 s.slug?.trim().toLowerCase() === segmentSlug.replace(/-/g, ' ').toLowerCase()
          )
          if (!match) {
            console.error('[v0] Subcategory not found at level', i, ':', segmentSlug)
            setNotFound(true)
            return
          }
          foundSub = match
          path.push(match)
          // Get children for next level
          currentLevel = subcategoriesData.filter(s => s.parentId === match.id)
        }

        if (!foundSub) {
          setNotFound(true)
          return
        }

        setCurrentSubcategory(foundSub)
        setBreadcrumbPath(path)

        // Get child subcategories (next level down)
        const children = subcategoriesData.filter(s => s.parentId === foundSub.id)
        setChildSubcategories(children)

        // Get articles for this subcategory
        const articlesData = await getArticlesBySubcategory(foundSub.id!)
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
            {breadcrumbPath.map((sub, index) => {
              // Build the URL path up to this level
              const pathSoFar = breadcrumbPath.slice(0, index + 1).map(s => s.slug).join('/')
              const isLast = index === breadcrumbPath.length - 1
              return (
                <span key={sub.id}>
                  <span className="mx-2">/</span>
                  {isLast ? (
                    <span className="text-foreground font-medium">{sub.name}</span>
                  ) : (
                    <a href={`/category/${category.slug}/${pathSoFar}`} className="hover:text-primary">
                      {sub.name}
                    </a>
                  )}
                </span>
              )
            })}
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

          {/* Child Subcategories (next level down) */}
          {childSubcategories.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <a
                  href={`/category/${category.slug}/${subslug?.join('/')}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded whitespace-nowrap"
                >
                  সব
                </a>
                {childSubcategories.map((child) => (
                  <a
                    key={child.id}
                    href={`/category/${category.slug}/${subslug?.join('/')}/${child.slug}`}
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
