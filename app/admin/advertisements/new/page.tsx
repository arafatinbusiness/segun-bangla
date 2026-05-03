'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAdvertisement, getAllAdSlots } from '@/lib/services/advertisements'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Image, Code, Eye } from 'lucide-react'
import Link from 'next/link'
import type { AdSlot } from '@/lib/types'

function NewAdvertisementPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<AdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slotName: '',
    type: 'image' as 'image' | 'html',
    imageUrl: '',
    linkUrl: '',
    htmlCode: '',
    isActive: true,
  })

  useEffect(() => {
    const fetchSlots = async () => {
      const slotsData = await getAllAdSlots()
      setSlots(slotsData)
      setLoading(false)
    }
    fetchSlots()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.slotName) {
      alert('অনুগ্রহ করে একটি স্লট নির্বাচন করুন')
      return
    }
    if (formData.type === 'image' && !formData.imageUrl) {
      alert('ছবির URL প্রয়োজন')
      return
    }
    if (formData.type === 'html' && !formData.htmlCode) {
      alert('HTML কোড প্রয়োজন')
      return
    }

    setSubmitting(true)
    try {
      const id = await createAdvertisement(formData)
      if (id) {
        router.push('/admin/advertisements')
      } else {
        alert('বিজ্ঞাপন তৈরি করতে ত্রুটি হয়েছে')
      }
    } catch (error) {
      console.error('Error creating ad:', error)
      alert('বিজ্ঞাপন তৈরি করতে ত্রুটি হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">নতুন বিজ্ঞাপন</h1>
          <p className="text-muted-foreground mt-2">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/advertisements" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">নতুন বিজ্ঞাপন</h1>
          <p className="text-muted-foreground mt-1">হোমপেজে দেখানোর জন্য নতুন বিজ্ঞাপন তৈরি করুন</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-semibold">বিজ্ঞাপনের শিরোনাম</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="যেমন: স্পনসর ব্যানার ১"
              className="w-full"
              required
            />
          </div>

          {/* Slot Selection */}
          <div className="space-y-2">
            <Label htmlFor="slot" className="text-foreground font-semibold">স্লট</Label>
            {slots.length > 0 ? (
              <Select value={formData.slotName} onValueChange={(value) => setFormData((prev) => ({ ...prev, slotName: value }))}>
                <SelectTrigger id="slot" className="w-full">
                  <SelectValue placeholder="স্লট নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((slot) => (
                    <SelectItem key={slot.docId} value={slot.name}>
                      {slot.name}
                      {slot.description && <span className="text-muted-foreground ml-2">- {slot.description}</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  এখনও কোন স্লট তৈরি করা হয়নি। প্রথমে{' '}
                  <Link href="/admin/advertisements" className="underline font-medium">বিজ্ঞাপন স্লট</Link> তৈরি করুন।
                </p>
              </div>
            )}
          </div>

          {/* Ad Type */}
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">বিজ্ঞাপনের ধরন</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'image' }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.type === 'image'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <Image className={`w-8 h-8 mx-auto mb-2 ${formData.type === 'image' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`font-medium text-sm ${formData.type === 'image' ? 'text-primary' : 'text-foreground'}`}>
                  ছবির বিজ্ঞাপন
                </p>
                <p className="text-xs text-muted-foreground mt-1">ছবি + ক্লিকযোগ্য লিংক</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'html' }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.type === 'html'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <Code className={`w-8 h-8 mx-auto mb-2 ${formData.type === 'html' ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`font-medium text-sm ${formData.type === 'html' ? 'text-primary' : 'text-foreground'}`}>
                  HTML কোড
                </p>
                <p className="text-xs text-muted-foreground mt-1">Google AdSense বা কাস্টম কোড</p>
              </button>
            </div>
          </div>

          {/* Image Ad Fields */}
          {formData.type === 'image' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-foreground font-semibold">ছবির URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/ad-banner.jpg"
                  className="w-full"
                  required
                />
                {formData.imageUrl && (
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="প্রিভিউ"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl" className="text-foreground font-semibold">লিংক URL</Label>
                <Input
                  id="linkUrl"
                  name="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">ব্যবহারকারী ছবিতে ক্লিক করলে এই লিংকে যাবে</p>
              </div>
            </>
          )}

          {/* HTML Ad Fields */}
          {formData.type === 'html' && (
            <div className="space-y-2">
              <Label htmlFor="htmlCode" className="text-foreground font-semibold">HTML কোড</Label>
              <Textarea
                id="htmlCode"
                name="htmlCode"
                value={formData.htmlCode}
                onChange={handleChange}
                placeholder="<script async src='...'></script>&#10;<!-- AdSense code -->&#10;<ins class='adsbygoogle' ...></ins>"
                rows={8}
                className="w-full font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Google AdSense বা যেকোনো কাস্টম HTML/JavaScript কোড পেস্ট করুন
              </p>
              {formData.htmlCode && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">প্রিভিউ (নিরাপদে রেন্ডার করা হয়নি)</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {formData.htmlCode}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div>
              <Label htmlFor="isActive" className="text-foreground cursor-pointer font-medium">
                সক্রিয়
              </Label>
              <p className="text-xs text-muted-foreground">সক্রিয় থাকলে হোমপেজে দেখানো হবে</p>
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
                'বিজ্ঞাপন তৈরি করুন'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/advertisements')}
            >
              বাতিল করুন
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default NewAdvertisementPage
