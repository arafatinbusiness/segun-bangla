'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { SlugInput } from '@/components/ui/slug-input'
import { getSubcategoriesByCategory } from '@/lib/services/categories'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { generateCleanSlug } from '@/lib/slug-utils'
import type { Article, Category, Subcategory } from '@/lib/types'

interface ArticleFormProps {
  article?: Article
  categories: Category[]
  onSubmit: (data: Partial<Article>) => Promise<void>
  isLoading?: boolean
}

// Recursive component to render subcategory tree with text-based indentation
function SubcategoryTreeItem({
  subcategory,
  allSubcategories,
  depth,
}: {
  subcategory: Subcategory
  allSubcategories: Subcategory[]
  depth: number
}) {
  const children = allSubcategories.filter((s) => s.parentId === subcategory.id)
  // Use text-based indentation since SelectItem doesn't support rich HTML
  const indent = depth > 0 ? '\u00A0\u00A0\u00A0\u00A0'.repeat(depth) + '└ ' : ''

  return (
    <>
      <SelectItem key={subcategory.id} value={subcategory.id!}>
        {indent}{subcategory.name}
      </SelectItem>
      {children.map((child) => (
        <SubcategoryTreeItem
          key={child.id}
          subcategory={child}
          allSubcategories={allSubcategories}
          depth={depth + 1}
        />
      ))}
    </>
  )
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
      subcategoryId: '',
      isLead: false,
      isSpecial: false,
      status: 'published',
    }
  )

  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      setSubcategoriesLoading(true)
      getSubcategoriesByCategory(formData.categoryId)
        .then((subs) => {
          setSubcategories(subs)
          // If editing and the article has a subcategoryId, keep it
          // If the subcategory is no longer valid, clear it
          if (formData.subcategoryId && !subs.find(s => s.id === formData.subcategoryId)) {
            setFormData((prev) => ({ ...prev, subcategoryId: '' }))
          }
        })
        .catch((err) => console.error('Error loading subcategories:', err))
        .finally(() => setSubcategoriesLoading(false))
    } else {
      setSubcategories([])
      setFormData((prev) => ({ ...prev, subcategoryId: '' }))
    }
  }, [formData.categoryId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value, subcategoryId: '' }))
  }

  const handleSubcategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subcategoryId: value }))
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

  // Generate slug from title - strips all special characters including %
  const generateSlug = () => {
    if (!formData.title || formData.slug) return
    const slug = formData.title
      .toLowerCase()
      // Remove Bengali and other non-ASCII characters
      .replace(/[^\w\s-]/g, '')
      // Replace whitespace with hyphens
      .replace(/\s+/g, '-')
      // Collapse multiple hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
      .trim()
    setFormData((prev) => ({ ...prev, slug }))
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground font-semibold">শিরোনাম</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={(e) => {
              handleChange(e)
              if (!article) generateSlug()
            }}
            placeholder="নিবন্ধ শিরোনাম প্রবেশ করুন"
            className="w-full text-lg"
            required
          />
        </div>

        {/* Slug */}
        <SlugInput
          value={formData.slug || ''}
          onChange={(value) => setFormData((prev) => ({ ...prev, slug: value }))}
          onAutoGenerate={() => generateCleanSlug(formData.title || '')}
          required
          disabled={!!article}
          basePath="/article/"
          placeholder="article-slug"
        />

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-foreground font-semibold">সংক্ষিপ্ত বর্ণনা</Label>
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

        {/* Content - Rich Text Editor */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">বিষয়বস্তু</Label>
          <RichTextEditor
            value={formData.content || ''}
            onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            minHeight="500px"
          />
        </div>

        {/* Image URL with compact preview */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-foreground font-semibold">প্রধান ছবির URL</Label>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
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
            {formData.imageUrl && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted border shrink-0">
                <img
                  src={formData.imageUrl}
                  alt="প্রিভিউ"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-foreground font-semibold">বিভাগ</Label>
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

        {/* Subcategory - shown only when category has subcategories */}
        {formData.categoryId && subcategories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="subcategory" className="text-foreground font-semibold">
              উপবিভাগ
              <span className="text-xs text-muted-foreground ml-2">(আবশ্যক)</span>
            </Label>
            <Select value={formData.subcategoryId || ''} onValueChange={handleSubcategoryChange}>
              <SelectTrigger id="subcategory" className="w-full">
                <SelectValue placeholder="উপবিভাগ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {/* Render root subcategories (no parentId) */}
                {subcategories
                  .filter((sub) => !sub.parentId)
                  .map((sub) => (
                    <SubcategoryTreeItem
                      key={sub.id}
                      subcategory={sub}
                      allSubcategories={subcategories}
                      depth={0}
                    />
                  ))}
              </SelectContent>
            </Select>
            {!formData.subcategoryId && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                এই বিভাগে উপবিভাগ রয়েছে। অনুগ্রহ করে একটি উপবিভাগ নির্বাচন করুন।
              </p>
            )}
          </div>
        )}

        {/* Subcategory loading state */}
        {formData.categoryId && subcategoriesLoading && (
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">উপবিভাগ</Label>
            <div className="h-10 rounded-lg border bg-muted/30 flex items-center px-3 text-sm text-muted-foreground">
              উপবিভাগ লোড হচ্ছে...
            </div>
          </div>
        )}

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-foreground font-semibold">স্ট্যাটাস</Label>
          <Select 
            value={formData.status || 'draft'} 
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as 'draft' | 'published' | 'scheduled' }))}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  খসড়া (Draft)
                </div>
              </SelectItem>
              <SelectItem value="published">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  প্রকাশিত (Published)
                </div>
              </SelectItem>
              <SelectItem value="scheduled">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  নির্ধারিত (Scheduled)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <Checkbox
              id="isLead"
              checked={formData.isLead || false}
              onCheckedChange={(checked) => handleCheckChange('isLead', checked as boolean)}
            />
            <div>
              <Label htmlFor="isLead" className="text-foreground cursor-pointer font-medium">
                প্রধান নিবন্ধ
              </Label>
              <p className="text-xs text-muted-foreground">হোমপেজের প্রধান স্লাইডারে দেখাবে</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <Checkbox
              id="isSpecial"
              checked={formData.isSpecial || false}
              onCheckedChange={(checked) => handleCheckChange('isSpecial', checked as boolean)}
            />
            <div>
              <Label htmlFor="isSpecial" className="text-foreground cursor-pointer font-medium">
                বিশেষ নিবন্ধ
              </Label>
              <p className="text-xs text-muted-foreground">হোমপেজের সাইডবারে দেখাবে</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
            disabled={submitting || isLoading}
          >
            {submitting || isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                সংরক্ষণ করছি...
              </span>
            ) : (
              'সংরক্ষণ করুন'
            )}
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
