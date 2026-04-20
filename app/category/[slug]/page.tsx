import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getSubcategoriesByCategory } from '@/lib/services/categories'
import { getArticlesByCategory } from '@/lib/services/articles'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

// Basic default metadata
export const metadata: Metadata = {
  title: 'বিভাগ - সেগুন বাংলা',
  description: 'বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল',
}

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  
  try {
    const [category, allCategories] = await Promise.all([
      getCategoryBySlug(slug),
      getAllCategories(),
    ])

    if (!category) {
      notFound()
    }

    const [subcategories, articles] = await Promise.all([
      getSubcategoriesByCategory(category.id),
      getArticlesByCategory(category.id),
    ])

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
  } catch (error) {
    console.error('[v0] Error loading category page:', error)
    notFound()
  }
}

export default CategoryPage
