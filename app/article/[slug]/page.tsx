import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getRecentArticles } from '@/lib/services/articles'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

// Basic default metadata
export const metadata: Metadata = {
  title: 'নিবন্ধ - সেগুন বাংলা',
  description: 'বাংলাদেশের শীর্ষস্থানীয় সংবাদ পোর্টাল',
}

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  
  try {
    const [article, recentArticles, categories] = await Promise.all([
      getArticleBySlug(slug),
      getRecentArticles(5),
      getAllCategories(),
    ])

    if (!article) {
      notFound()
    }

    const publishDate = new Date(article.publishedAt).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Structured data for SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt,
      image: article.imageUrl,
      datePublished: new Date(article.publishedAt).toISOString(),
      dateModified: new Date(article.updatedAt || article.publishedAt).toISOString(),
      author: {
        '@type': 'Organization',
        name: 'সেগুন বাংলা',
      },
      publisher: {
        '@type': 'Organization',
        name: 'সেগুন বাংলা',
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/logo.png`,
        },
      },
    }

    return (
      <>
        <Header categories={categories} />
        <main className="min-h-screen bg-background">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Article Header */}
            <article>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  {article.title}
                </h1>
                <div className="flex flex-col gap-3 text-sm text-muted-foreground border-b pb-6">
                  <div className="flex items-center gap-2">
                    <span>{publishDate}</span>
                    <span>•</span>
                    <span>{article.viewCount} ভিউ</span>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden bg-muted">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-lg text-muted-foreground mb-6 font-semibold">
                      {article.excerpt}
                    </p>
                    <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {article.content}
                    </div>
                  </div>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="font-semibold mb-3">ট্যাগ:</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <a
                            key={tag}
                            href={`/search?q=${encodeURIComponent(tag)}`}
                            className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm hover:bg-muted/80"
                          >
                            {tag}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside>
                  {/* Related Articles */}
                  <div className="bg-muted p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">সম্পর্কিত সংবাদ</h3>
                    <div className="space-y-4">
                      {recentArticles.map((relatedArticle) => (
                        <ArticleCard
                          key={relatedArticle.docId}
                          article={relatedArticle}
                          variant="small"
                        />
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          </div>
        </main>
      </>
    )
  } catch (error) {
    console.error('ত্রুটি নিবন্ধ লোড করছি:', error)
    notFound()
  }
}

export default ArticlePage
