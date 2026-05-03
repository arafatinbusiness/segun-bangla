'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAllCategories } from '@/lib/services/categories'
import { updateCategory } from '@/lib/services/category-mutations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Palette } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/lib/types'

function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params?.id as string

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#2563eb',
    order: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const cats = await getAllCategories()
        const cat = cats.find((c) => c.id === categoryId)
        if (!cat) {
          setNotFound(true)
          return
        }
        setFormData({
          name: cat.name || '',
          slug: cat.slug || '',
          description: cat.description || '',
          color: cat.color || '#2563eb',
          order: cat.order || 0,
        })
      } catch (error) {
        console.error('Error fetching category:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (categoryId) fetchCategory()
  }, [categoryId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const generateSlug = () => {
    if (!formData.name) return
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await updateCategory(categoryId, formData)
      alert('বিভাগ সফলভাবে আপডেট হয়েছে')
      router.push('/admin/categories')
    } catch (error) {
      console.error('Error updating category:', error)
      alert('বিভাগ আপডেট করতে ত্রুটি হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">বিভাগ সম্পাদনা</h1>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">বিভাগ পাওয়া যায়নি</h1>
            <p className="text-muted-foreground mt-1">এই বিভাগটি বিদ্যমান নেই বা সরানো হয়েছে</p>
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
          href="/admin/categories"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">বিভাগ সম্পাদনা</h1>
          <p className="text-muted-foreground mt-1">"{formData.name}" সম্পাদনা করুন</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-semibold">নাম</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="বিভাগের নাম"
              className="w-full"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-foreground font-semibold">স্লাগ (URL)</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="category-slug"
                className="w-full"
                required
              />
              <Button type="button" variant="outline" size="sm" onClick={generateSlug} className="shrink-0">
                অটো
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground font-semibold">বিবরণ</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="বিভাগের বিবরণ"
              rows={3}
              className="w-full"
            />
          </div>

          {/* Color + Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="color" className="text-foreground font-semibold">রঙ</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  {formData.color}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order" className="text-foreground font-semibold">ক্রম</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleNumberChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <Label className="text-foreground font-semibold mb-3 block">প্রিভিউ</Label>
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.color || '#2563eb' }}
              >
                <span className="text-white font-bold text-sm">
                  {formData.name ? formData.name.charAt(0) : '?'}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{formData.name}</p>
                <p className="text-xs text-muted-foreground">/{formData.slug}</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  সংরক্ষণ করছি...
                </span>
              ) : (
                'আপডেট করুন'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/categories')}
            >
              বাতিল করুন
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default EditCategoryPage
