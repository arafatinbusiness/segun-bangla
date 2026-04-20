import { Metadata } from 'next'
import { searchArticles } from '@/lib/services/articles'
import { getAllCategories } from '@/lib/services/categories'
import { Header } from '@/components/header'
import { ArticleCard } from '@/components/article-card'
import { SearchClient } from '@/components/search-client'

export const dynamic = 'force-dynamic'
export const revalidate = 60

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    date?: string
  }>
}

export async function generateMetadata(
  { searchParams }: SearchPageProps,
): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" সন্ধান ফলাফল - সেগুন বাংলা` : 'অনুসন্ধান - সেগুন বাংলা',
  }
}

async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const [categories, results] = await Promise.all([
    getAllCategories(),
    q ? searchArticles(q, 50) : Promise.resolve([]),
  ])

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              অনুসন্ধান
            </h1>
            {q && (
              <p className="text-lg text-muted-foreground">
                &quot;{q}&quot; এর জন্য {results.length} ফলাফল পাওয়া গেছে
              </p>
            )}
          </div>

          {/* Advanced Search Component */}
          <SearchClient categories={categories} initialQuery={q} results={results} />
        </div>
      </main>
    </>
  )
}

export default SearchPage
