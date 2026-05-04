'use client'

import { useState, useEffect } from 'react'
import { getAllCategories, getSubcategoriesByCategory } from '@/lib/services/categories'
import { deleteCategory, updateCategory, createSubcategory, deleteSubcategory } from '@/lib/services/category-mutations'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Edit2, Plus, Folder, Search, ChevronDown, ChevronRight, Hash, AlertTriangle, X, Check, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import type { Category, Subcategory } from '@/lib/types'

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [newSubSlug, setNewSubSlug] = useState('')
  const [newSubParentId, setNewSubParentId] = useState<string>('')
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null)
  const [submittingSub, setSubmittingSub] = useState(false)
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<string | null>(null)
  const [orderValue, setOrderValue] = useState<number>(0)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderConflict, setOrderConflict] = useState<{ categoryId: string; name: string } | null>(null)

  const fetchData = async () => {
    try {
      const data = await getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const loadSubcategories = async (categoryId: string) => {
    if (subcategories[categoryId]) return
    const subs = await getSubcategoriesByCategory(categoryId)
    setSubcategories((prev) => ({ ...prev, [categoryId]: subs }))
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (categoryId: string) => {
    setDeleting(true)
    try {
      await deleteCategory(categoryId)
      setCategories((prev) => prev.filter((c) => c.id !== categoryId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('বিভাগ মুছতে ত্রুটি হয়েছে')
    } finally {
      setDeleting(false)
    }
  }

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubName.trim() || !newSubSlug.trim()) return
    setSubmittingSub(true)
    try {
      const subId = await createSubcategory(categoryId, {
        name: newSubName.trim(),
        slug: newSubSlug.trim(),
        parentId: newSubParentId || null,
        order: (subcategories[categoryId]?.length || 0) + 1,
      })
      if (subId) {
        const subs = await getSubcategoriesByCategory(categoryId)
        setSubcategories((prev) => ({ ...prev, [categoryId]: subs }))
        setNewSubName('')
        setNewSubSlug('')
        setNewSubParentId('')
        setAddingSubTo(null)
      }
    } catch (error) {
      console.error('Error creating subcategory:', error)
      alert('উপবিভাগ তৈরিতে ত্রুটি হয়েছে')
    } finally {
      setSubmittingSub(false)
    }
  }

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    try {
      await deleteSubcategory(categoryId, subcategoryId)
      const subs = await getSubcategoriesByCategory(categoryId)
      setSubcategories((prev) => ({ ...prev, [categoryId]: subs }))
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">বিভাগ পরিচালনা</h1>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">বিভাগ পরিচালনা</h1>
          <p className="text-muted-foreground mt-1">মোট {categories.length}টি বিভাগ</p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            নতুন বিভাগ
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="বিভাগ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="p-5 hover:shadow-md transition-all group">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: category.color || '#e5e7eb' }}
                  >
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground truncate">{category.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/categories/${category.id}`}>
                    <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                  {deleteConfirm === category.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(category.id!)}
                        disabled={deleting}
                        className="p-1.5 text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(category.id!)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded-lg hover:bg-muted"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {category.description}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3" />
                  {editingOrder === category.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={orderValue}
                        onChange={(e) => {
                          const newVal = parseInt(e.target.value) || 0
                          setOrderValue(newVal)
                          // Check for conflict
                          const conflict = categories.find(
                            (c) => c.id !== category.id && c.order === newVal
                          )
                          setOrderConflict(
                            conflict
                              ? { categoryId: conflict.id!, name: conflict.name }
                              : null
                          )
                        }}
                        className={`w-16 h-7 text-xs ${orderConflict ? 'border-amber-500 focus-visible:ring-amber-500' : ''}`}
                        min={0}
                        autoFocus
                      />
                      {orderConflict ? (
                        <button
                          onClick={async () => {
                            setSavingOrder(true)
                            try {
                              // Swap: give the conflicting category the old order value
                              const oldOrder = category.order || 0
                              await updateCategory(orderConflict.categoryId, { order: oldOrder })
                              await updateCategory(category.id!, { order: orderValue })
                              setCategories((prev) =>
                                prev.map((c) => {
                                  if (c.id === category.id) return { ...c, order: orderValue }
                                  if (c.id === orderConflict.categoryId) return { ...c, order: oldOrder }
                                  return c
                                })
                              )
                              setEditingOrder(null)
                              setOrderConflict(null)
                            } catch (error) {
                              console.error('Error swapping order:', error)
                              alert('ক্রম অদলবদল করতে ত্রুটি হয়েছে')
                            } finally {
                              setSavingOrder(false)
                            }
                          }}
                          disabled={savingOrder}
                          className="p-1 text-amber-600 hover:text-amber-700 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 text-[10px] font-medium"
                          title="অদলবদল করুন"
                        >
                          অদলবদল
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            setSavingOrder(true)
                            try {
                              await updateCategory(category.id!, { order: orderValue })
                              setCategories((prev) =>
                                prev.map((c) =>
                                  c.id === category.id ? { ...c, order: orderValue } : c
                                )
                              )
                              setEditingOrder(null)
                            } catch (error) {
                              console.error('Error updating order:', error)
                              alert('ক্রম আপডেট করতে ত্রুটি হয়েছে')
                            } finally {
                              setSavingOrder(false)
                            }
                          }}
                          disabled={savingOrder}
                          className="p-1 text-green-600 hover:text-green-700 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingOrder(null)
                          setOrderConflict(null)
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingOrder(category.id!)
                        setOrderValue(category.order || 0)
                        setOrderConflict(null)
                      }}
                      className="flex items-center gap-1 hover:text-foreground transition-colors group/order"
                    >
                      <span>ক্রম {category.order || 0}</span>
                      <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/order:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    const newId = expandedId === category.id ? null : category.id!
                    setExpandedId(newId)
                    if (newId) loadSubcategories(newId)
                  }}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {expandedId === category.id ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <span>উপবিভাগ</span>
                </button>
              </div>

              {/* Subcategories */}
              {expandedId === category.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {/* Existing subcategories - show with hierarchy */}
                  {(subcategories[category.id] || []).length > 0 ? (
                    <div className="space-y-1">
                      {/* Recursive subcategory display */}
                      {(() => {
                        const renderSubTree = (parentId: string | null, depth: number) => {
                          const children = subcategories[category.id].filter(
                            s => (s.parentId || null) === parentId
                          )
                          if (children.length === 0) return null
                          return children.map((sub) => (
                            <div key={sub.id}>
                              <div
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group/sub"
                                style={{ marginLeft: `${depth * 16}px` }}
                              >
                                <div className="min-w-0 flex items-center gap-2">
                                  {depth > 0 && (
                                    <span className="text-muted-foreground text-xs shrink-0">└</span>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">/{sub.slug}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                  {deleteSubConfirm === sub.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleDeleteSubcategory(category.id!, sub.id!)}
                                        className="p-1 text-red-600 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                      >
                                        <AlertTriangle className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteSubConfirm(null)}
                                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteSubConfirm(sub.id!)}
                                      className="p-1 text-muted-foreground hover:text-red-600 rounded hover:bg-muted"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              {/* Render children recursively */}
                              {renderSubTree(sub.id!, depth + 1)}
                            </div>
                          ))
                        }
                        return renderSubTree(null, 0)
                      })()}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground">কোন উপবিভাগ নেই</p>
                    </div>
                  )}

                  {/* Add subcategory form */}
                  {addingSubTo === category.id ? (
                    <div className="space-y-2 p-3 rounded-lg border bg-card">
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
                      {/* Parent subcategory selector */}
                      {subcategories[category.id] && subcategories[category.id].length > 0 && (
                        <div>
                          <Select value={newSubParentId || '__none__'} onValueChange={(val) => setNewSubParentId(val === '__none__' ? '' : val)}>
                            <SelectTrigger className="text-sm w-full">
                              <SelectValue placeholder="প্যারেন্ট উপবিভাগ (ঐচ্ছিক)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">কোনটি নয় (মূল স্তর)</SelectItem>
                              {(() => {
                                const renderSubOptions = (parentId: string | null, depth: number) => {
                                  const children = subcategories[category.id].filter(
                                    s => (s.parentId || null) === parentId
                                  )
                                  if (children.length === 0) return null
                                  return children.map((sub) => (
                                    <div key={sub.id}>
                                      <SelectItem value={sub.id!}>
                                        {'\u00A0\u00A0'.repeat(depth)}{sub.name}
                                      </SelectItem>
                                      {renderSubOptions(sub.id!, depth + 1)}
                                    </div>
                                  ))
                                }
                                return renderSubOptions(null, 0)
                              })()}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleAddSubcategory(category.id!)}
                          disabled={submittingSub || !newSubName.trim() || !newSubSlug.trim()}
                        >
                          <Check className="w-3 h-3" />
                          {submittingSub ? 'সংরক্ষণ...' : 'সংরক্ষণ'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAddingSubTo(null)
                            setNewSubName('')
                            setNewSubSlug('')
                            setNewSubParentId('')
                          }}
                        >
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 text-xs gap-1"
                      onClick={() => setAddingSubTo(category.id!)}
                    >
                      <Plus className="w-3 h-3" />
                      উপবিভাগ যোগ করুন
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Folder className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">কোন বিভাগ পাওয়া যায়নি</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন বিভাগ নেই'
              : 'এখনও কোন বিভাগ তৈরি করা হয়নি'}
          </p>
          {!searchQuery && (
            <Link href="/admin/categories/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                প্রথম বিভাগ তৈরি করুন
              </Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}

export default CategoriesPage
