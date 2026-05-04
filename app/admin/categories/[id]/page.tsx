'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAllCategories, getSubcategoriesByCategory } from '@/lib/services/categories'
import { updateCategory, createSubcategory, updateSubcategory, deleteSubcategory } from '@/lib/services/category-mutations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SlugInput } from '@/components/ui/slug-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Palette, Plus, Trash2, Check, X, Edit2, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { Category, Subcategory } from '@/lib/types'
import { generateCleanSlug } from '@/lib/slug-utils'

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

  // Subcategory state
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [subsLoading, setSubsLoading] = useState(true)
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState('')
  const [editSubSlug, setEditSubSlug] = useState('')
  const [editSubParentId, setEditSubParentId] = useState<string | null | undefined>(undefined)
  const [savingSub, setSavingSub] = useState(false)
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<string | null>(null)
  const [newSubName, setNewSubName] = useState('')
  const [newSubSlug, setNewSubSlug] = useState('')
  const [newSubParentId, setNewSubParentId] = useState<string | null | undefined>(undefined)
  const [addingSub, setAddingSub] = useState(false)
  const [creatingSub, setCreatingSub] = useState(false)
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set())

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

  // Load subcategories
  useEffect(() => {
    if (!categoryId) return
    setSubsLoading(true)
    getSubcategoriesByCategory(categoryId)
      .then(setSubcategories)
      .catch(console.error)
      .finally(() => setSubsLoading(false))
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

  // Get root subcategories (no parentId)
  const getRootSubs = () => subcategories.filter(s => !s.parentId)

  // Get children of a subcategory
  const getChildSubs = (parentId: string) => subcategories.filter(s => s.parentId === parentId)

  // Check if a subcategory has children
  const hasChildren = (subId: string) => subcategories.some(s => s.parentId === subId)

  const toggleExpand = (subId: string) => {
    setExpandedSubs(prev => {
      const next = new Set(prev)
      if (next.has(subId)) next.delete(subId)
      else next.add(subId)
      return next
    })
  }

  // Subcategory handlers
  const startEditSub = (sub: Subcategory) => {
    setEditingSubId(sub.id!)
    setEditSubName(sub.name)
    setEditSubSlug(sub.slug)
    setEditSubParentId(sub.parentId ?? null)
  }

  const cancelEditSub = () => {
    setEditingSubId(null)
    setEditSubName('')
    setEditSubSlug('')
    setEditSubParentId(undefined)
  }

  const saveEditSub = async (subId: string) => {
    if (!editSubName.trim() || !editSubSlug.trim()) return
    setSavingSub(true)
    try {
      const updateData: Partial<Subcategory> = {
        name: editSubName.trim(),
        slug: editSubSlug.trim(),
      }
      // Only include parentId if it was explicitly set
      if (editSubParentId !== undefined) {
        updateData.parentId = editSubParentId || null
      }
      await updateSubcategory(categoryId, subId, updateData)
      const subs = await getSubcategoriesByCategory(categoryId)
      setSubcategories(subs)
      cancelEditSub()
    } catch (error) {
      console.error('Error updating subcategory:', error)
      alert('উপবিভাগ আপডেট করতে ত্রুটি হয়েছে')
    } finally {
      setSavingSub(false)
    }
  }

  const handleDeleteSub = async (subId: string) => {
    try {
      // Delete all children first
      const children = getChildSubs(subId)
      for (const child of children) {
        await deleteSubcategory(categoryId, child.id!)
      }
      await deleteSubcategory(categoryId, subId)
      const subs = await getSubcategoriesByCategory(categoryId)
      setSubcategories(subs)
      setDeleteSubConfirm(null)
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      alert('উপবিভাগ মুছতে ত্রুটি হয়েছে')
    }
  }

  const generateSubSlug = () => {
    if (!newSubName || newSubSlug) return
    const slug = newSubName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setNewSubSlug(slug)
  }

  const handleAddSub = async () => {
    if (!newSubName.trim() || !newSubSlug.trim()) return
    setCreatingSub(true)
    try {
      const subData: Partial<Subcategory> = {
        name: newSubName.trim(),
        slug: newSubSlug.trim(),
        order: subcategories.length + 1,
      }
      if (newSubParentId) {
        subData.parentId = newSubParentId
      }
      const subId = await createSubcategory(categoryId, subData)
      if (subId) {
        const subs = await getSubcategoriesByCategory(categoryId)
        setSubcategories(subs)
        setNewSubName('')
        setNewSubSlug('')
        setNewSubParentId(undefined)
        setAddingSub(false)
      }
    } catch (error) {
      console.error('Error creating subcategory:', error)
      alert('উপবিভাগ তৈরিতে ত্রুটি হয়েছে')
    } finally {
      setCreatingSub(false)
    }
  }

  // Render a single subcategory item (recursive for children)
  const renderSubItem = (sub: Subcategory, depth: number = 0) => {
    const children = getChildSubs(sub.id!)
    const hasKids = children.length > 0
    const isExpanded = expandedSubs.has(sub.id!)

    return (
      <div key={sub.id}>
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group/sub"
          style={{ marginLeft: depth * 16 }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasKids ? (
              <button
                onClick={() => toggleExpand(sub.id!)}
                className="p-0.5 text-muted-foreground hover:text-foreground shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
              <p className="text-xs text-muted-foreground truncate">/{sub.slug}</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0 ml-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setAddingSub(true)
                setNewSubParentId(sub.id!)
              }}
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
              title="উপ-উপবিভাগ যোগ করুন"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => startEditSub(sub)}
              className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted"
              title="সম্পাদনা"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {deleteSubConfirm === sub.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDeleteSub(sub.id!)}
                  className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteSubConfirm(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteSubConfirm(sub.id!)}
                className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded-lg hover:bg-muted"
                title="মুছুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasKids && isExpanded && (
          <div className="border-l-2 border-muted ml-6 mt-1 mb-1">
            {children.map(child => renderSubItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
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

  // Get available parent options (all subs except the one being edited)
  const getParentOptions = (excludeId?: string) =>
    subcategories.filter(s => s.id !== excludeId)

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Details */}
        <div className="lg:col-span-2">
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
              <SlugInput
                value={formData.slug}
                onChange={(value) => setFormData((prev) => ({ ...prev, slug: value }))}
                onAutoGenerate={() => generateCleanSlug(formData.name)}
                required
                basePath="/category/"
                placeholder="category-slug"
              />

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

        {/* Subcategories Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">উপবিভাগ</h2>
              {!addingSub && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setAddingSub(true)
                    setNewSubParentId(undefined)
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন
                </Button>
              )}
            </div>

            {/* Add new subcategory form */}
            {addingSub && (
              <div className="space-y-2 mb-4 p-3 rounded-lg border bg-muted/20">
                <Input
                  placeholder="উপবিভাগের নাম"
                  value={newSubName}
                  onChange={(e) => {
                    setNewSubName(e.target.value)
                    if (!newSubSlug) generateSubSlug()
                  }}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="slug-name"
                    value={newSubSlug}
                    onChange={(e) => setNewSubSlug(e.target.value)}
                    className="text-sm flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={generateSubSlug} className="shrink-0">
                    অটো
                  </Button>
                </div>
                {/* Parent selector */}
                <Select
                  value={newSubParentId || ''}
                  onValueChange={(val) => setNewSubParentId(val || undefined)}
                >
                  <SelectTrigger className="text-sm h-8">
                    <SelectValue placeholder="প্যারেন্ট (ঐচ্ছিক)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">কোনটি নয় (মূল উপবিভাগ)</SelectItem>
                    {getParentOptions().map(p => (
                      <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1"
                    onClick={handleAddSub}
                    disabled={creatingSub || !newSubName.trim() || !newSubSlug.trim()}
                  >
                    <Check className="w-3 h-3" />
                    {creatingSub ? 'সংরক্ষণ...' : 'সংরক্ষণ'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAddingSub(false)
                      setNewSubName('')
                      setNewSubSlug('')
                      setNewSubParentId(undefined)
                    }}
                  >
                    বাতিল
                  </Button>
                </div>
              </div>
            )}

            {/* Subcategory list */}
            {subsLoading ? (
              <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
            ) : subcategories.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground">কোন উপবিভাগ নেই</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Edit form for a subcategory */}
                {editingSubId && (
                  <div className="p-3 rounded-lg border bg-card mb-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">সম্পাদনা</p>
                    <Input
                      value={editSubName}
                      onChange={(e) => setEditSubName(e.target.value)}
                      placeholder="নাম"
                      className="text-sm"
                    />
                    <Input
                      value={editSubSlug}
                      onChange={(e) => setEditSubSlug(e.target.value)}
                      placeholder="slug"
                      className="text-sm"
                    />
                    <Select
                      value={editSubParentId ?? ''}
                      onValueChange={(val) => setEditSubParentId(val || null)}
                    >
                      <SelectTrigger className="text-sm h-8">
                        <SelectValue placeholder="প্যারেন্ট (ঐচ্ছিক)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">কোনটি নয় (মূল উপবিভাগ)</SelectItem>
                        {getParentOptions(editingSubId).map(p => (
                          <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1"
                        onClick={() => saveEditSub(editingSubId)}
                        disabled={savingSub || !editSubName.trim() || !editSubSlug.trim()}
                      >
                        <Check className="w-3 h-3" />
                        {savingSub ? 'সংরক্ষণ...' : 'সংরক্ষণ'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditSub}
                      >
                        বাতিল
                      </Button>
                    </div>
                  </div>
                )}

                {/* Render root subcategories */}
                {getRootSubs().map(sub => renderSubItem(sub))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EditCategoryPage
