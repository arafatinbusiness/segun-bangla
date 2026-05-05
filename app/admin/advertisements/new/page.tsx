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
import { ArrowLeft, Image, Code, Eye, Maximize2, Square, RectangleHorizontal, RectangleVertical, Monitor, Ruler } from 'lucide-react'
import Link from 'next/link'
import type { AdSlot, AdShape } from '@/lib/types'

const SHAPE_OPTIONS: { value: AdShape; label: string; labelBn: string; width: number; height: number; icon: React.ReactNode; desc: string }[] = [
  { value: 'leaderboard', label: 'Leaderboard', labelBn: 'লিডারবোর্ড', width: 728, height: 90, icon: <RectangleHorizontal className="w-5 h-5" />, desc: 'ফুল-উইডথ ব্যানার (728×90)' },
  { value: 'wide', label: 'Wide Banner', labelBn: 'ওয়াইড ব্যানার', width: 970, height: 90, icon: <Monitor className="w-5 h-5" />, desc: 'বড় ফুল-উইডথ ব্যানার (970×90)' },
  { value: 'rectangle', label: 'Medium Rectangle', labelBn: 'মিডিয়াম রেক্ট্যাঙ্গেল', width: 300, height: 250, icon: <RectangleVertical className="w-5 h-5" />, desc: 'মাঝারি আয়তক্ষেত্র (300×250)' },
  { value: 'square', label: 'Square', labelBn: 'স্কয়ার', width: 250, height: 250, icon: <Square className="w-5 h-5" />, desc: 'বর্গাকার (250×250)' },
  { value: 'skyscraper', label: 'Skyscraper', labelBn: 'স্কাইস্ক্র্যাপার', width: 160, height: 600, icon: <Maximize2 className="w-5 h-5" />, desc: 'লম্বা ব্যানার (160×600)' },
  { value: 'custom', label: 'Custom', labelBn: 'কাস্টম', width: 0, height: 0, icon: <Ruler className="w-5 h-5" />, desc: 'নিজের পছন্দের সাইজ' },
]

function NewAdvertisementPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<AdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slotName: '',
    type: 'image' as 'image' | 'html',
    imageUrl: '',
    linkUrl: '',
    htmlCode: '',
    isActive: true,
    adShape: 'leaderboard' as AdShape,
    adWidth: 728,
    adHeight: 90,
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

  const handleShapeChange = (shape: AdShape) => {
    const option = SHAPE_OPTIONS.find(o => o.value === shape)
    if (option) {
      setFormData((prev) => ({
        ...prev,
        adShape: shape,
        adWidth: option.width,
        adHeight: option.height,
      }))
    }
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
      const id = await createAdvertisement({
        title: formData.title,
        slotName: formData.slotName,
        type: formData.type,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        htmlCode: formData.htmlCode,
        isActive: formData.isActive,
        adShape: formData.adShape,
        adWidth: formData.adWidth,
        adHeight: formData.adHeight,
      })
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

  const selectedShape = SHAPE_OPTIONS.find(o => o.value === formData.adShape)

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
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
                      {Array.from(new Map(slots.map(s => [s.name, s])).values()).map((slot) => (
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

              {/* Ad Shape Selection */}
              {formData.type === 'image' && (
                <div className="space-y-2">
                  <Label className="text-foreground font-semibold">ছবির আকৃতি / সাইজ</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SHAPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleShapeChange(option.value)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          formData.adShape === option.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className={`mx-auto mb-1 ${formData.adShape === option.value ? 'text-primary' : 'text-muted-foreground'}`}>
                          {option.icon}
                        </div>
                        <p className={`font-medium text-xs ${formData.adShape === option.value ? 'text-primary' : 'text-foreground'}`}>
                          {option.labelBn}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {option.width}×{option.height}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Custom Size Inputs */}
                  {formData.adShape === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label htmlFor="adWidth" className="text-xs text-muted-foreground">প্রস্থ (px)</Label>
                        <Input
                          id="adWidth"
                          name="adWidth"
                          type="number"
                          value={formData.adWidth || ''}
                          onChange={(e) => setFormData((prev) => ({ ...prev, adWidth: parseInt(e.target.value) || 0 }))}
                          placeholder="যেমন: 300"
                          className="w-full mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adHeight" className="text-xs text-muted-foreground">উচ্চতা (px)</Label>
                        <Input
                          id="adHeight"
                          name="adHeight"
                          type="number"
                          value={formData.adHeight || ''}
                          onChange={(e) => setFormData((prev) => ({ ...prev, adHeight: parseInt(e.target.value) || 0 }))}
                          placeholder="যেমন: 250"
                          className="w-full mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

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

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">লাইভ প্রিভিউ</h3>
            </div>

            {/* Preview Container */}
            <div className="border rounded-lg bg-[#F8F9FA] p-4 flex items-center justify-center min-h-[200px]">
              {formData.type === 'image' && formData.imageUrl ? (
                <div
                  className="relative overflow-hidden rounded border bg-white shadow-sm"
                  style={{
                    width: formData.adShape === 'custom' && formData.adWidth ? `${formData.adWidth}px` : '100%',
                    maxWidth: '100%',
                    aspectRatio: formData.adWidth && formData.adHeight ? `${formData.adWidth}/${formData.adHeight}` : 'auto',
                    height: formData.adShape === 'custom' && formData.adHeight ? `${Math.min(formData.adHeight, 300)}px` : 'auto',
                    maxHeight: '300px',
                  }}
                >
                  <img
                    src={formData.imageUrl}
                    alt="প্রিভিউ"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              ) : formData.type === 'html' && formData.htmlCode ? (
                <div className="text-center text-muted-foreground">
                  <Code className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">HTML কোড প্রিভিউ</p>
                  <p className="text-[10px] mt-1">নিরাপত্তার কারণে HTML রেন্ডার করা হয়নি</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">ছবির URL দিন</p>
                  <p className="text-xs mt-1">প্রিভিউ এখানে দেখাবে</p>
                </div>
              )}
            </div>

            {/* Preview Info */}
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span>আকৃতি</span>
                <span className="font-medium text-foreground">{selectedShape?.labelBn || 'কাস্টম'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span>সাইজ</span>
                <span className="font-medium text-foreground">
                  {formData.adWidth} × {formData.adHeight} px
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span>স্লট</span>
                <span className="font-medium text-foreground">{formData.slotName || 'নির্বাচিত নয়'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span>স্ট্যাটাস</span>
                <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {formData.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </span>
              </div>
            </div>

            {/* Size Reference */}
            <div className="mt-4 p-3 rounded-lg border border-blue-100 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800">
              <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium mb-1">📐 সাইজ রেফারেন্স</p>
              <ul className="text-[10px] text-blue-600 dark:text-blue-300 space-y-0.5">
                <li>• লিডারবোর্ড: 728×90 (ফুল-উইডথ)</li>
                <li>• ওয়াইড: 970×90 (বড় ব্যানার)</li>
                <li>• রেক্ট্যাঙ্গেল: 300×250 (মাঝারি)</li>
                <li>• স্কয়ার: 250×250 (বর্গাকার)</li>
                <li>• স্কাইস্ক্র্যাপার: 160×600 (লম্বা)</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NewAdvertisementPage
