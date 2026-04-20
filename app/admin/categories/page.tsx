import { getAllCategories } from '@/lib/services/categories'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'

async function CategoriesPage() {
  const categories = await getAllCategories()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">বিভাগ পরিচালনা</h1>
          <p className="text-muted-foreground mt-2">সমস্ত বিভাগ দেখুন এবং পরিচালনা করুন</p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            নতুন বিভাগ তৈরি করুন
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{category.slug}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Link href={`/admin/categories/${category.id}`}>
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </Link>
                <button className="p-2 text-muted-foreground hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            )}
            <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
              <span>স্লাগ: {category.slug}</span>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">কোন বিভাগ পাওয়া যায়নি</p>
        </Card>
      )}
    </div>
  )
}

export default CategoriesPage
