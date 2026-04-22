'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory } from '@/lib/services/category-mutations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

function NewCategoryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '',
    order: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const categoryId = await createCategory(formData)
      if (categoryId) {
        alert('বিভাগ সফলভাবে তৈরি হয়েছে')
        router.push('/admin/categories')
      } else {
        alert('বিভাগ তৈরিতে ত্রুটি হয়েছে')
      }
    } catch (error) {
      console.error('ত্রুটি বিভাগ তৈরি করছি:', error)
      alert('বিভাগ তৈরিতে ত্রুটি হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">নতুন বিভাগ তৈরি করুন</h1>
        <p className="text-muted-foreground mt-2">একটি নতুন বিভাগ তৈরি করতে ফর্মটি পূরণ করুন</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">নাম</Label>
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
            <Label htmlFor="slug" className="text-foreground">স্লাগ (URL)</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="category-slug"
              className="w-full"
              required
            />
            <p className="text-xs text-muted-foreground">URL এ ব্যবহৃত হবে</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">বিবরণ</Label>
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

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className="text-foreground">রঙ</Label>
            <Input
              id="color"
              name="color"
              type="color"
              value={formData.color || '#000000'}
              onChange={handleChange}
              className="w-20 h-10 p-1"
            />
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order" className="text-foreground">ক্রম</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleNumberChange}
              placeholder="0"
              className="w-32"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? 'সংরক্ষণ করছি...' : 'সংরক্ষণ করুন'}
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

export default NewCategoryPage
