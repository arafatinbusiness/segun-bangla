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
import { uploadArticleImage, validateImageFile } from '@/lib/services/image-upload'
import { ImagePlus, Upload, X, Link as LinkIcon } from 'lucide-react'
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
      categoryIds: [],
      subcategoryId: '',
      subcategoryIds: [],
      source: '',
      isLead: false,
      isSpecial: false,
    }
  )

  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([])
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load subcategories for ALL selected categories
  useEffect(() => {
    const selectedIds = formData.categoryIds || []
    if (selectedIds.length > 0) {
      setSubcategoriesLoading(true)
      Promise.all(selectedIds.map((catId) => getSubcategoriesByCategory(catId)))
        .then((results) => {
          const merged = results.flat()
          // Deduplicate by id
          const unique = merged.filter((sub, idx, self) => self.findIndex(s => s.id === sub.id) === idx)
          setAllSubcategories(unique)
          // Clean up subcategoryIds that are no longer valid
          const currentSubIds = formData.subcategoryIds || []
          const validSubIds = currentSubIds.filter((sid) => unique.some((s) => s.id === sid))
          if (validSubIds.length !== currentSubIds.length) {
            setFormData((prev) => ({ ...prev, subcategoryIds: validSubIds }))
          }
        })
        .catch((err) => console.error('Error loading subcategories:', err))
        .finally(() => setSubcategoriesLoading(false))
    } else {
      setAllSubcategories([])
      setFormData((prev) => ({ ...prev, subcategoryIds: [] }))
    }
  }, [formData.categoryIds])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Toggle a category on/off
  const handleCategoryToggle = (catId: string) => {
    setFormData((prev) => {
      const current = prev.categoryIds || []
      const exists = current.includes(catId)
      const updated = exists ? current.filter((id) => id !== catId) : [...current, catId]
      return { ...prev, categoryIds: updated }
    })
  }

  // Toggle a subcategory on/off
  const handleSubcategoryToggle = (subId: string) => {
    setFormData((prev) => {
      const current = prev.subcategoryIds || []
      const exists = current.includes(subId)
      const updated = exists ? current.filter((id) => id !== subId) : [...current, subId]
      return { ...prev, subcategoryIds: updated }
    })
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

  // Handle file selection and upload to Firebase Storage
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const error = validateImageFile(file)
    if (error) {
      setUploadError(error)
      return
    }

    setUploadError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      // Use a temporary ID for new articles, or the existing article ID
      const articleId = article?.id || 'temp-' + Date.now()
      const downloadUrl = await uploadArticleImage(file, articleId, (progress) => {
        setUploadProgress(progress)
      })
      setFormData((prev) => ({ ...prev, imageUrl: downloadUrl }))
    } catch (err) {
      console.error('[v0] Upload failed:', err)
      setUploadError('ছবি আপলোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setUploading(false)
    }
  }, [article])

  // Generate slug from title - uses transliteration for Bengali text
  const generateSlug = () => {
    if (!formData.title || formData.slug) return
    const slug = generateCleanSlug(formData.title)
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

        {/* Image Upload / URL */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">প্রধান ছবি</Label>
          
          {/* Tabs: URL or Upload */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                imageMode === 'url'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              URL লিংক
            </button>
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                imageMode === 'upload'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              আপলোড
            </button>
          </div>

          {imageMode === 'url' ? (
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
          ) : (
            <div className="space-y-3">
              {/* Upload area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files[0]
                  if (file) handleFileSelect(file)
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
                {uploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-6 h-6 text-primary animate-pulse" />
                      <span className="text-sm font-medium">আপলোড হচ্ছে...</span>
                    </div>
                    <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                  </div>
                ) : formData.imageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.imageUrl}
                      alt="আপলোড করা ছবি"
                      className="max-h-40 rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFormData((prev) => ({ ...prev, imageUrl: '' }))
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">ছবি আপলোড করতে ক্লিক করুন</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        অথবা ড্র্যাগ ও ড্রপ করুন (সর্বোচ্চ ৫MB)
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, WebP, GIF, AVIF
                    </p>
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
            </div>
          )}
        </div>

        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source" className="text-foreground font-semibold">সোর্স/উৎস</Label>
          <Input
            id="source"
            name="source"
            value={formData.source || ''}
            onChange={handleChange}
            placeholder="যেমন: বাসস, ইউএনবি, নিজস্ব প্রতিবেদক"
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            নিবন্ধের শীর্ষে প্রকাশের তারিখের পাশে দেখানো হবে
          </p>
        </div>

        {/* Published At - Date/Time picker for reordering special news */}
        <div className="space-y-2">
          <Label htmlFor="publishedAt" className="text-foreground font-semibold">প্রকাশের তারিখ ও সময়</Label>
          <p className="text-xs text-muted-foreground">
            বিশেষ সংবাদ সাজানোর জন্য তারিখ পরিবর্তন করুন (নতুনতর = উপরে)
          </p>
          <Input
            id="publishedAt"
            type="datetime-local"
            value={
              formData.publishedAt
                ? new Date(formData.publishedAt).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)
            }
            onChange={(e) => {
              const val = e.target.value
              if (val) {
                const timestamp = new Date(val).getTime()
                setFormData((prev) => ({ ...prev, publishedAt: timestamp }))
              }
            }}
            className="w-full"
          />
        </div>


        {/* Categories - Multi-select checkboxes */}
        <div className="space-y-3">
          <Label className="text-foreground font-semibold">বিভাগ সমূহ</Label>
          <p className="text-xs text-muted-foreground">এক বা একাধিক বিভাগ নির্বাচন করুন</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const isSelected = (formData.categoryIds || []).includes(cat.id!)
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleCategoryToggle(cat.id!)}
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </label>
              )
            })}
          </div>
          {(formData.categoryIds || []).length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              অনুগ্রহ করে অন্তত একটি বিভাগ নির্বাচন করুন।
            </p>
          )}
        </div>

        {/* Subcategories - Multi-select checkboxes (shown when categories are selected) */}
        {(formData.categoryIds || []).length > 0 && (
          <div className="space-y-3">
            <Label className="text-foreground font-semibold">উপবিভাগ সমূহ</Label>
            <p className="text-xs text-muted-foreground">ঐচ্ছিক — এক বা একাধিক উপবিভাগ নির্বাচন করুন</p>
            {subcategoriesLoading ? (
              <div className="h-10 rounded-lg border bg-muted/30 flex items-center px-3 text-sm text-muted-foreground">
                উপবিভাগ লোড হচ্ছে...
              </div>
            ) : allSubcategories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allSubcategories.map((sub) => {
                  const isSelected = (formData.subcategoryIds || []).includes(sub.id!)
                  return (
                    <label
                      key={sub.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSubcategoryToggle(sub.id!)}
                      />
                      <span className="text-sm font-medium">{sub.name}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">নির্বাচিত বিভাগে কোনো উপবিভাগ নেই।</p>
            )}
          </div>
        )}



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
