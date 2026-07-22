'use client'

import { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SlugInput } from '@/components/ui/slug-input'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { generateCleanSlug } from '@/lib/slug-utils'
import { uploadArticleImage, validateImageFile } from '@/lib/services/image-upload'
import { ImagePlus, Upload, X, Link as LinkIcon } from 'lucide-react'
import { CategoryPanel } from '@/components/admin/category-panel'
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
      categoryIds: [],
      subcategoryId: '',
      subcategoryIds: [],
      source: '',
      isLead: false,
      isSpecial: false,
    }
  )

  const [submitting, setSubmitting] = useState(false)
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryToggle = (catId: string) => {
    setFormData((prev) => {
      const current = prev.categoryIds || []
      const exists = current.includes(catId)
      const updated = exists ? current.filter((id) => id !== catId) : [...current, catId]
      return { ...prev, categoryIds: updated }
    })
  }

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
      const cleaned: Record<string, any> = {}
      for (const [key, val] of Object.entries(formData)) {
        if (val !== undefined) {
          cleaned[key] = val
        }
      }
      await onSubmit(cleaned as Partial<Article>)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateImageFile(file)
    if (error) {
      setUploadError(error)
      return
    }
    setUploadError(null)
    setUploading(true)
    setUploadProgress(0)
    try {
      const articleId = article?.id || 'temp-' + Date.now()
      const downloadUrl = await uploadArticleImage(file, articleId, (progress) => {
        setUploadProgress(progress)
      })
      setFormData((prev) => ({ ...prev, imageUrl: downloadUrl }))
    } catch (err) {
      console.error('[v0] Upload failed:', err)
      setUploadError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [article])

  const generateSlug = () => {
    if (!formData.title) return
    const slug = generateCleanSlug(formData.title)
    setFormData((prev) => ({ ...prev, slug }))
  }

  return (
    <div className="relative">
      {/* Sticky Top Save Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border mb-6 -mx-6 px-6 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {article ? 'Edit Article' : 'New Article'}
        </h2>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="article-form"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
            disabled={submitting || isLoading}
          >
            {submitting || isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground font-semibold">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={(e) => {
              handleChange(e)
              if (!article) generateSlug()
            }}
            placeholder="Enter article title"
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
          basePath="/article/"
          placeholder="article-slug"
        />

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-foreground font-semibold">Excerpt</Label>
          <div className="relative">
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt || ''}
              onChange={handleChange}
              placeholder="Short description of the article"
              rows={3}
              className="w-full"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1" title="Font color">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: formData.excerptColor || '#111827' }} />
              <input
                type="color"
                value={formData.excerptColor || '#111827'}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerptColor: e.target.value }))}
                className="w-0 h-0 opacity-0 absolute pointer-events-none"
                id="excerptColor"
              />
              <label htmlFor="excerptColor" className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Color</label>
            </div>
          </div>
        </div>

        {/* Shoulder - Text above title */}
        <div className="space-y-2">
          <Label htmlFor="shoulder" className="text-foreground font-semibold">Shoulder <span className="text-xs text-muted-foreground font-normal">(shown above title)</span></Label>
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                id="shoulder"
                name="shoulder"
                value={formData.shoulder || ''}
                onChange={handleChange}
                placeholder="e.g. Special Report, Breaking News, Exclusive"
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0 flex-wrap">
              <div className="flex items-center gap-1" title="Background color">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: formData.shoulderColor || '#FF0000' }} />
                <input
                  type="color"
                  value={formData.shoulderColor || '#FF0000'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shoulderColor: e.target.value }))}
                  className="w-0 h-0 opacity-0 absolute pointer-events-none"
                  id="shoulderBgColor"
                />
                <label htmlFor="shoulderBgColor" className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Bg</label>
              </div>
              <div className="flex items-center gap-1" title="Text color">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: formData.shoulderTextColor || '#ffffff' }} />
                <input
                  type="color"
                  value={formData.shoulderTextColor || '#ffffff'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shoulderTextColor: e.target.value }))}
                  className="w-0 h-0 opacity-0 absolute pointer-events-none"
                  id="shoulderTextColor"
                />
                <label htmlFor="shoulderTextColor" className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Text</label>
              </div>
              <select
                value={formData.shoulderFontSize || 'sm'}
                onChange={(e) => setFormData((prev) => ({ ...prev, shoulderFontSize: e.target.value }))}
                className="h-6 text-[10px] rounded border bg-background px-1 cursor-pointer"
                title="Font size"
              >
                <option value="xs">XS</option>
                <option value="sm">S</option>
                <option value="base">M</option>
                <option value="lg">L</option>
                <option value="xl">XL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">Bullet Points <span className="text-xs text-muted-foreground font-normal">(key points under title, max 10)</span></Label>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1" title="Font color">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: formData.bulletColor || '#374151' }} />
              <input
                type="color"
                value={formData.bulletColor || '#374151'}
                onChange={(e) => setFormData((prev) => ({ ...prev, bulletColor: e.target.value }))}
                className="w-0 h-0 opacity-0 absolute pointer-events-none"
                id="bulletColor"
              />
              <label htmlFor="bulletColor" className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Color</label>
            </div>
            <select
              value={formData.bulletFontSize || 'sm'}
              onChange={(e) => setFormData((prev) => ({ ...prev, bulletFontSize: e.target.value }))}
              className="h-6 text-[10px] rounded border bg-background px-1 cursor-pointer"
              title="Font size"
            >
              <option value="xs">XS</option>
              <option value="sm">S</option>
              <option value="base">M</option>
              <option value="lg">L</option>
              <option value="xl">XL</option>
            </select>
          </div>
          <div className="space-y-1.5">
            {(formData.bulletPoints?.length ? formData.bulletPoints : ['', '', '']).slice(0, 10).map((point, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0 w-4">{idx + 1}.</span>
                <Input
                  value={point}
                  onChange={(e) => {
                    const current = formData.bulletPoints?.length ? [...formData.bulletPoints] : ['', '', '']
                    while (current.length <= idx) current.push('')
                    current[idx] = e.target.value
                    const cleaned = current.filter((p, i) => p.trim() || i < 3 || i < current.length - 1)
                    setFormData((prev) => ({ ...prev, bulletPoints: cleaned }))
                  }}
                  placeholder={`Point ${idx + 1}`}
                  className="w-full text-sm"
                />
              </div>
            ))}
          </div>
          {(formData.bulletPoints?.length || 3) < 10 && (
            <button
              type="button"
              onClick={() => {
                const current = formData.bulletPoints?.length ? [...formData.bulletPoints] : ['', '', '']
                current.push('')
                setFormData((prev) => ({ ...prev, bulletPoints: current }))
              }}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add more points ({formData.bulletPoints?.length || 3}/10)
            </button>
          )}
        </div>

        {/* Content - Rich Text Editor */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">Content</Label>
          <RichTextEditor
            value={formData.content || ''}
            onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            minHeight="500px"
          />
        </div>

        {/* Image Upload / URL */}
        <div className="space-y-2">
          <Label className="text-foreground font-semibold">Main Image</Label>
          
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
              URL Link
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
              Upload
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
                    alt="Preview"
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
                      <span className="text-sm font-medium">Uploading...</span>
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
                      alt="Uploaded image"
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
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Or drag and drop (max 5MB)
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

          {/* Image Size Selector */}
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Image Size</Label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { value: 'landscape' as const, label: 'Landscape', desc: '16:9 - Wide image (default)' },
                { value: 'portrait' as const, label: 'Portrait', desc: '3:4 - For people/face images' },
                { value: 'square' as const, label: 'Square', desc: '1:1 - Square image' },
                { value: 'full' as const, label: 'Full Width', desc: '100% - Container full width' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageSize: opt.value }))}
                  title={opt.desc}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    (formData.imageSize || 'landscape') === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Live Preview */}
            {formData.imageUrl && (
              <div className="border rounded-lg overflow-hidden bg-muted/30">
                <div className={`${
                  (formData.imageSize || 'landscape') === 'portrait' ? 'aspect-[3/4] max-w-[200px] mx-auto' :
                  (formData.imageSize || 'landscape') === 'square' ? 'aspect-square max-w-[200px] mx-auto' :
                  (formData.imageSize || 'landscape') === 'full' ? '' : 'aspect-video'
                }`}>
                  <img
                    src={formData.imageUrl}
                    alt="Image preview"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: formData.imageFocus?.replace(/-/g, ' ') || 'center' }}
                  />
                </div>
                <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 border-t flex items-center gap-2">
                  <span className="font-medium">Preview:</span>
                  <span>{
                    (formData.imageSize || 'landscape') === 'portrait' ? 'Portrait (3:4)' :
                    (formData.imageSize || 'landscape') === 'square' ? 'Square (1:1)' :
                    (formData.imageSize || 'landscape') === 'full' ? 'Full Width' :
                    'Landscape (16:9)'
                  }</span>
                  {formData.imageFocus && formData.imageFocus !== 'center' && (
                    <span className="text-primary">• Focus: {formData.imageFocus}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image Focus Position */}
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Image Focus Position</Label>
            <p className="text-[10px] text-muted-foreground mb-2">Determines which part of the image is visible when cropped (especially for portrait/square)</p>
            <div className="grid grid-cols-3 gap-1 max-w-[240px]">
              {[
                { value: 'top-left' as const, label: 'Top-Left' },
                { value: 'top' as const, label: 'Top' },
                { value: 'top-right' as const, label: 'Top-Right' },
                { value: 'left' as const, label: 'Left' },
                { value: 'center' as const, label: 'Center' },
                { value: 'right' as const, label: 'Right' },
                { value: 'bottom-left' as const, label: 'Bottom-Left' },
                { value: 'bottom' as const, label: 'Bottom' },
                { value: 'bottom-right' as const, label: 'Bottom-Right' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageFocus: opt.value }))}
                  title={opt.label}
                  className={`px-1.5 py-1 text-[10px] rounded border transition-colors ${
                    (formData.imageFocus || 'center') === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Caption */}
          <div className="mt-3">
            <Label htmlFor="imageCaption" className="text-xs text-muted-foreground mb-1.5 block">Image Caption</Label>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  id="imageCaption"
                  name="imageCaption"
                  value={formData.imageCaption || ''}
                  onChange={handleChange}
                  placeholder="Write caption below image..."
                  className="w-full text-sm"
                />
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <span className="text-[10px] text-muted-foreground">Align:</span>
                {[
                  { value: 'left' as const, label: 'Left' },
                  { value: 'center' as const, label: 'Center' },
                  { value: 'right' as const, label: 'Right' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageCaptionAlign: opt.value }))}
                    title={opt.label}
                    className={`px-1.5 py-1 text-[10px] rounded border transition-colors ${
                      (formData.imageCaptionAlign || 'left') === opt.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Source + Reporter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source" className="text-foreground font-semibold">Source</Label>
            <Input
              id="source"
              name="source"
              value={formData.source || ''}
              onChange={handleChange}
              placeholder="e.g. BSS, UNB, Staff Reporter"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Shown next to published date at article top
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reporterName" className="text-foreground font-semibold">Reporter Name <span className="text-xs text-muted-foreground font-normal">(for special/investigative news)</span></Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="reporterName"
                  name="reporterName"
                  value={formData.reporterName || ''}
                  onChange={handleChange}
                  placeholder="e.g. Mr. X Y Z"
                  className="w-full"
                />
              </div>
              <div className="shrink-0">
                <Input
                  id="reporterImage"
                  name="reporterImage"
                  type="url"
                  value={formData.reporterImage || ''}
                  onChange={handleChange}
                  placeholder="Photo URL"
                  className="w-32"
                  title="Reporter photo URL"
                />
              </div>
              {formData.reporterImage && (
                <div className="w-9 h-9 rounded-full overflow-hidden bg-muted border shrink-0 mt-0.5">
                  <img
                    src={formData.reporterImage}
                    alt="Reporter"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              If filled, reporter name & photo replaces source
            </p>
          </div>
        </div>

        {/* Published At */}
        <div className="space-y-2">
          <Label htmlFor="publishedAt" className="text-foreground font-semibold">Published Date & Time</Label>
          <p className="text-xs text-muted-foreground">
            Change date for reordering special news (newer = above)
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

        {/* Category Panel */}
        <CategoryPanel
          categories={categories}
          selectedCategoryIds={formData.categoryIds || []}
          selectedSubcategoryIds={formData.subcategoryIds || []}
          isLead={formData.isLead || false}
          isSpecial={formData.isSpecial || false}
          onCategoryToggle={handleCategoryToggle}
          onSubcategoryToggle={handleSubcategoryToggle}
          onSpecialChange={(type, index) => {
            if (type === 'none') {
              setFormData((prev) => ({ ...prev, isLead: false, isSpecial: false, isSpecialOrder: undefined }))
            } else if (type === 'lead') {
              setFormData((prev) => ({ ...prev, isLead: true, isSpecial: false, isSpecialOrder: 0 }))
            } else {
              const order = typeof index === 'number' ? index : 1
              setFormData((prev) => ({ ...prev, isLead: false, isSpecial: true, isSpecialOrder: order }))
            }
          }}
          specialIndex={formData.isSpecialOrder !== undefined ? formData.isSpecialOrder : (formData.isLead ? 0 : 1)}
        />

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
                Saving...
              </span>
            ) : (
              'Save Article'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
    </div>
  )
}