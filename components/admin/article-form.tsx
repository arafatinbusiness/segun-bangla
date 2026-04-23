'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { Article, Category } from '@/lib/types'

interface ArticleFormProps {
  article?: Article
  categories: Category[]
  onSubmit: (data: Partial<Article>) => Promise<void>
  isLoading?: boolean
}

export function ArticleForm({ article, categories, onSubmit, isLoading }: ArticleFormProps) {
  const [formData, setFormData] = useState<Partial<Article>>(
    article || {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      categoryId: '',
      isLead: false,
      isSpecial: false,
    }
  )

  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }

  const handleCheckChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground">শিরোনাম</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            placeholder="নিবন্ধ শিরোনাম প্রবেশ করুন"
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
            value={formData.slug || ''}
            onChange={handleChange}
            placeholder="article-slug"
            className="w-full"
            required
          />
          <p className="text-xs text-muted-foreground">URL এ ব্যবহৃত হবে (উদা: /article/article-slug)</p>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-foreground">সংক্ষিপ্ত বর্ণনা</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt || ''}
            onChange={handleChange}
            placeholder="নিবন্ধের সংক্ষিপ্ত বর্ণনা"
            rows={3}
            className="w-full"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content" className="text-foreground">বিষয়বস্তু</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content || ''}
            onChange={handleChange}
            placeholder="নিবন্ধের সম্পূর্ণ বিষয়বস্তু"
            rows={10}
            className="w-full font-mono text-sm"
            required
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-foreground">ছবির URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-foreground">বিভাগ</Label>
          <Select value={formData.categoryId || ''} onValueChange={handleSelectChange}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-foreground">স্ট্যাটাস</Label>
          <Select 
            value={formData.status || 'draft'} 
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'draft' | 'published' | 'scheduled' }))}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">খসড়া (Draft)</SelectItem>
              <SelectItem value="published">প্রকাশিত (Published)</SelectItem>
              <SelectItem value="scheduled">নির্ধারিত (Scheduled)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isLead"
              checked={formData.isLead || false}
              onCheckedChange={(checked) => handleCheckChange('isLead', checked as boolean)}
            />
            <Label htmlFor="isLead" className="text-foreground cursor-pointer">
              প্রধান নিবন্ধ হিসাবে চিহ্নিত করুন
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSpecial"
              checked={formData.isSpecial || false}
              onCheckedChange={(checked) => handleCheckChange('isSpecial', checked as boolean)}
            />
            <Label htmlFor="isSpecial" className="text-foreground cursor-pointer">
              বিশেষ নিবন্ধ হিসাবে চিহ্নিত করুন
            </Label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={submitting || isLoading}
          >
            {submitting || isLoading ? 'সংরক্ষণ করছি...' : 'সংরক্ষণ করুন'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            বাতিল করুন
          </Button>
        </div>
      </form>
    </Card>
  )
}
