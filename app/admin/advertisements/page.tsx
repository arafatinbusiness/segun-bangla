'use client'

import { useState, useEffect } from 'react'
import { getAllAdvertisements, createAdvertisement, deleteAdvertisement, getAllAdSlots, createAdSlot, deleteAdSlot } from '@/lib/services/advertisements'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Edit2, Plus, Search, Image, Code, AlertTriangle, X, ToggleLeft, ToggleRight, Megaphone, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import type { Advertisement, AdSlot } from '@/lib/types'

function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [slots, setSlots] = useState<AdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [slotFilter, setSlotFilter] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showNewSlotForm, setShowNewSlotForm] = useState(false)
  const [newSlotName, setNewSlotName] = useState('')
  const [newSlotDesc, setNewSlotDesc] = useState('')
  const [creatingSlot, setCreatingSlot] = useState(false)
  const [deleteSlotConfirm, setDeleteSlotConfirm] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [adsData, slotsData] = await Promise.all([
        getAllAdvertisements(),
        getAllAdSlots(),
      ])
      setAds(adsData)
      setSlots(slotsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSlot = slotFilter === 'all' || ad.slotName === slotFilter
    return matchesSearch && matchesSlot
  })

  const handleDelete = async (adId: string) => {
    setDeleting(true)
    try {
      await deleteAdvertisement(adId)
      setAds((prev) => prev.filter((a) => a.docId !== adId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('বিজ্ঞাপন মুছতে ত্রুটি হয়েছে')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      await deleteAdvertisement(ad.docId!)
      // Re-create with toggled status
      await createAdvertisement({
        title: ad.title,
        slotName: ad.slotName,
        type: ad.type,
        imageUrl: ad.imageUrl,
        linkUrl: ad.linkUrl,
        htmlCode: ad.htmlCode,
        isActive: !ad.isActive,
      })
      fetchData()
    } catch (error) {
      console.error('Error toggling ad status:', error)
    }
  }

  const handleCreateSlot = async () => {
    if (!newSlotName.trim()) return
    setCreatingSlot(true)
    try {
      await createAdSlot(newSlotName.trim(), newSlotDesc.trim())
      setNewSlotName('')
      setNewSlotDesc('')
      setShowNewSlotForm(false)
      fetchData()
    } catch (error) {
      console.error('Error creating slot:', error)
    } finally {
      setCreatingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteAdSlot(slotId)
      setDeleteSlotConfirm(null)
      fetchData()
    } catch (error) {
      console.error('Error deleting slot:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">বিজ্ঞাপন ব্যবস্থাপনা</h1>
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
          <h1 className="text-3xl font-bold text-foreground">বিজ্ঞাপন ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1">
            মোট {ads.length}টি বিজ্ঞাপন • {slots.length}টি স্লট
          </p>
        </div>
        <Link href="/admin/advertisements/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            নতুন বিজ্ঞাপন
          </Button>
        </Link>
      </div>

      {/* Ad Slots Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">বিজ্ঞাপন স্লট</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewSlotForm(!showNewSlotForm)}
            className="gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            নতুন স্লট
          </Button>
        </div>

        {showNewSlotForm && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="slotName" className="text-foreground font-medium">স্লটের নাম</Label>
              <Input
                id="slotName"
                value={newSlotName}
                onChange={(e) => setNewSlotName(e.target.value)}
                placeholder="যেমন: left-sidebar, category-row, bottom-banner"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ স্লটের নাম অবশ্যই হোমপেজে ব্যবহৃত নামের সাথে হুবহু মিলতে হবে। নিচের বাটনে ক্লিক করে দ্রুত স্লট তৈরি করুন:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[
                  { name: 'top-ad-1', desc: 'শীর্ষ লিডারবোর্ড (নেভিগেশনের নিচে, ফুল-উইডথ)' },
                  { name: 'left-sidebar', desc: 'হিরো গ্রিডের বাম পাশের সাইডবার' },
                  { name: 'right-sidebar', desc: 'হিরো গ্রিডের ডান পাশের সাইডবার' },
                  { name: 'bottom-banner', desc: 'পেজের নিচের বড় ব্যানার' },
                ].map((slot) => (
                  <button
                    key={slot.name}
                    type="button"
                    onClick={() => {
                      setNewSlotName(slot.name)
                      setNewSlotDesc(slot.desc)
                    }}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      newSlotName === slot.name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {slot.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotDesc" className="text-foreground font-medium">বিবরণ (ঐচ্ছিক)</Label>
              <Input
                id="slotDesc"
                value={newSlotDesc}
                onChange={(e) => setNewSlotDesc(e.target.value)}
                placeholder="স্লটের অবস্থান সম্পর্কে বিস্তারিত"
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSlot} disabled={!newSlotName.trim() || creatingSlot} size="sm">
                {creatingSlot ? 'সংরক্ষণ করছি...' : 'স্লট তৈরি করুন'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowNewSlotForm(false)}>
                বাতিল
              </Button>
            </div>
          </div>
        )}

        {slots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const adCount = ads.filter(a => a.slotName === slot.name).length
              const activeCount = ads.filter(a => a.slotName === slot.name && a.isActive).length
              return (
                <div key={slot.docId} className="group relative px-3 py-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{slot.name}</span>
                    <span className="text-xs text-muted-foreground">({adCount}টি)</span>
                    {activeCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title={`${activeCount} সক্রিয়`} />
                    )}
                    {deleteSlotConfirm === slot.docId ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteSlot(slot.docId!)}
                          className="p-1 text-red-600 hover:text-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="নিশ্চিত"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteSlotConfirm(null)}
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          title="বাতিল"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteSlotConfirm(slot.docId!)}
                        className="p-1 text-muted-foreground hover:text-red-600 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                        title="স্লট মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {slot.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{slot.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            এখনও কোন স্লট তৈরি করা হয়নি। "নতুন স্লট" বাটনে ক্লিক করে প্রথম স্লট তৈরি করুন।
          </p>
        )}
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="বিজ্ঞাপন খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={slotFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSlotFilter('all')}
            >
              সব স্লট
            </Button>
            {slots.map((slot) => (
              <Button
                key={slot.docId}
                variant={slotFilter === slot.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSlotFilter(slot.name)}
              >
                {slot.name}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Ads Grid */}
      {filteredAds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAds.map((ad) => (
            <Card key={ad.docId} className={`p-4 ${!ad.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  {ad.type === 'image' ? (
                    <Image className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : (
                    <Code className="w-4 h-4 text-purple-500 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-foreground truncate">{ad.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/admin/advertisements/${ad.docId}`}>
                    <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted" title="সম্পাদনা">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                  {deleteConfirm === ad.docId ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(ad.docId!)}
                        disabled={deleting}
                        className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        title="নিশ্চিত"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                        title="বাতিল"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(ad.docId!)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded-lg hover:bg-muted"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slot Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  <LayoutGrid className="w-3 h-3" />
                  {ad.slotName}
                </span>
                <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                  ad.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {ad.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>

              {/* Preview */}
              {ad.type === 'image' && ad.imageUrl && (
                <div className="relative h-24 w-full rounded-lg overflow-hidden bg-muted mb-3">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              {ad.type === 'html' && ad.htmlCode && (
                <div className="h-24 rounded-lg bg-muted/30 border flex items-center justify-center mb-3">
                  <Code className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground ml-2">HTML কোড</span>
                </div>
              )}

              {/* Link URL */}
              {ad.type === 'image' && ad.linkUrl && (
                <p className="text-xs text-muted-foreground truncate mb-2">
                  🔗 {ad.linkUrl}
                </p>
              )}

              {/* Date */}
              <p className="text-[10px] text-muted-foreground">
                তৈরি: {new Date(ad.createdAt).toLocaleDateString('bn-BD')}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">কোন বিজ্ঞাপন পাওয়া যায়নি</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || slotFilter !== 'all'
              ? 'আপনার ফিল্টারের সাথে মিলে এমন কোন বিজ্ঞাপন নেই'
              : 'এখনও কোন বিজ্ঞাপন তৈরি করা হয়নি'}
          </p>
          {!searchQuery && slotFilter === 'all' && (
            <Link href="/admin/advertisements/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                প্রথম বিজ্ঞাপন তৈরি করুন
              </Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}

export default AdvertisementsPage
