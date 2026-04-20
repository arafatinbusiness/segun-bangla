import { getLeadArticles, getFeaturedArticles, getRecentArticles } from '@/lib/services/articles'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

async function HomePage() {
  try {
    const [leadArticles, featuredArticles, recentArticles, categories] = await Promise.all([
      getLeadArticles(1),
      getFeaturedArticles(5),
      getRecentArticles(8),
      getAllCategories(),
    ])

    const mainArticle = leadArticles[0]

    return (
      <>
        <Header categories={categories} />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
            {/* Hero Section - 65/35 Split */}
            {mainArticle && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Main Hero Article - 65% */}
                <div className="md:col-span-2">
                  <article className="group relative h-64 md:h-96 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={mainArticle.imageUrl}
                      alt={mainArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                      <a href={`/article/${mainArticle.slug}`} className="group">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:underline">
                          {mainArticle.title}
                        </h1>
                      </a>
                      <p className="text-white/90 text-sm line-clamp-2">
                        {mainArticle.excerpt}
                      </p>
                    </div>
                  </article>
                </div>

                {/* Sidebar - 35% */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-4 text-foreground">শীর্ষ সংবাদ</h3>
                    <div className="space-y-4">
                      {featuredArticles.slice(0, 3).map((article) => (
                        <ArticleCard key={article.docId} article={article} variant="small" />
                      ))}
                    </div>
                  </div>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm text-muted-foreground">বিজ্ঞাপন স্থান</p>
                  </Card>
                </div>
              </section>
            )}

            {/* Featured Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b pb-3">
                বৈশিষ্ট্যযুক্ত
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {featuredArticles.map((article) => (
                  <ArticleCard key={article.docId} article={article} variant="featured" />
                ))}
              </div>
            </section>

            {/* Recent News by Category */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b pb-3">
                সর্বশেষ সংবাদ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentArticles.slice(0, 4).map((article) => (
                  <ArticleCard key={article.docId} article={article} />
                ))}
              </div>
            </section>

            {/* Another Row of Recent Articles */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentArticles.slice(4, 8).map((article) => (
                  <ArticleCard key={article.docId} article={article} />
                ))}
              </div>
            </section>

            {/* Advertisement Section */}
            <section className="mb-8">
              <Card className="p-12 bg-muted flex items-center justify-center min-h-40">
                <p className="text-center text-muted-foreground">বড় বিজ্ঞাপন স্থান</p>
              </Card>
            </section>

            {/* Category Rows */}
            {categories.slice(0, 3).map((category) => (
              <section key={category.id} className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground border-b pb-3 flex-1">
                    {category.name}
                  </h2>
                  <a
                    href={`/category/${category.slug}`}
                    className="text-primary hover:underline text-sm font-medium ml-4 whitespace-nowrap"
                  >
                    সব দেখুন →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentArticles.slice(0, 4).map((article) => (
                    <ArticleCard key={article.docId} article={article} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
        <Footer />
      </>
    )
  } catch (error) {
    console.error('[v0] Error loading home page:', error)
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">ত্রুটি ঘটেছে</h1>
            <p className="text-muted-foreground">পৃষ্ঠা লোড করতে ত্রুটি হয়েছে। দয়া করে পরে চেষ্টা করুন।</p>
          </div>
        </main>
      </>
    )
  }
}

export default HomePage
