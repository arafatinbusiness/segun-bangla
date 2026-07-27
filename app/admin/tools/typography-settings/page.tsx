'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, Save, Loader2, Check, AlertCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface TypographyConfig {
  // Menu
  menuFontSize: number; menuFontSizeMobile: number
  menuFontWeight: 'normal' | 'bold'
  logoHeight: number; logoHeightMobile: number

  // Hero Lead
  leadTitleFontSize: number; leadTitleFontSizeMobile: number
  leadExcerptFontSize: number; leadExcerptFontSizeMobile: number

  // Side slots (SP-1, SP-2)
  sideSlotTitleFontSize: number; sideSlotTitleFontSizeMobile: number
  sideSlotExcerptFontSize: number; sideSlotExcerptFontSizeMobile: number

  // Grid slots (SP-3 to SP-10)
  gridSlotTitleFontSize: number; gridSlotTitleFontSizeMobile: number
  gridSlotExcerptFontSize: number; gridSlotExcerptFontSizeMobile: number

  // Category rows
  categoryRowHeadingSize: number; categoryRowHeadingSizeMobile: number
  categoryLeadArticleTitleSize: number; categoryLeadArticleTitleSizeMobile: number
  categoryArticleTitleSize: number; categoryArticleTitleSizeMobile: number
  categoryArticleExcerptSize: number; categoryArticleExcerptSizeMobile: number

  // Recent news
  recentHeadingSize: number; recentHeadingSizeMobile: number
  recentArticleTitleSize: number; recentArticleTitleSizeMobile: number

  // Social widget
  socialWidgetFontSize: number; socialWidgetFontSizeMobile: number
}

const DEFAULTS: TypographyConfig = {
  menuFontSize: 16, menuFontSizeMobile: 14,
  menuFontWeight: 'bold',
  logoHeight: 56, logoHeightMobile: 40,
  leadTitleFontSize: 22, leadTitleFontSizeMobile: 18,
  leadExcerptFontSize: 14, leadExcerptFontSizeMobile: 12,
  sideSlotTitleFontSize: 14, sideSlotTitleFontSizeMobile: 12,
  sideSlotExcerptFontSize: 12, sideSlotExcerptFontSizeMobile: 10,
  gridSlotTitleFontSize: 14, gridSlotTitleFontSizeMobile: 12,
  gridSlotExcerptFontSize: 12, gridSlotExcerptFontSizeMobile: 10,
  categoryRowHeadingSize: 24, categoryRowHeadingSizeMobile: 18,
  categoryLeadArticleTitleSize: 14, categoryLeadArticleTitleSizeMobile: 12,
  categoryArticleTitleSize: 14, categoryArticleTitleSizeMobile: 12,
  categoryArticleExcerptSize: 12, categoryArticleExcerptSizeMobile: 10,
  recentHeadingSize: 22, recentHeadingSizeMobile: 17,
  recentArticleTitleSize: 14, recentArticleTitleSizeMobile: 12,
  socialWidgetFontSize: 13, socialWidgetFontSizeMobile: 11,
}

type SectionKey = 'menu' | 'hero' | 'side' | 'grid' | 'category' | 'recent' | 'social'

interface FieldDef { desktopKey: keyof TypographyConfig; mobileKey: keyof TypographyConfig; label: string; desktopMax?: number; mobileMax?: number }

interface SectionDef {
  key: SectionKey
  label: string
  desc: string
  fields: FieldDef[]
}

const SECTIONS: SectionDef[] = [
  {
    key: 'menu',
    label: '📋 মেনু বার',
    desc: 'হেডারের ক্যাটাগরি নাম ও লোগো',
    fields: [
      { desktopKey: 'menuFontSize', mobileKey: 'menuFontSizeMobile', label: 'মেনু আইটেম সাইজ' },
      { desktopKey: 'logoHeight', mobileKey: 'logoHeightMobile', label: 'লোগোর উচ্চতা (px)', desktopMax: 150, mobileMax: 120 },
    ],
  },
  {
    key: 'hero',
    label: '📰 হিরো সেকশন — লিড',
    desc: 'পেজের প্রধান বড় নিবন্ধ',
    fields: [
      { desktopKey: 'leadTitleFontSize', mobileKey: 'leadTitleFontSizeMobile', label: 'শিরোনাম সাইজ' },
      { desktopKey: 'leadExcerptFontSize', mobileKey: 'leadExcerptFontSizeMobile', label: 'এক্সসার্পট সাইজ' },
    ],
  },
  {
    key: 'side',
    label: '📎 হিরো সেকশন — সাইড স্লট (SP-1, SP-2)',
    desc: 'প্রধান নিবন্ধের পাশের ছোট বক্স',
    fields: [
      { desktopKey: 'sideSlotTitleFontSize', mobileKey: 'sideSlotTitleFontSizeMobile', label: 'শিরোনাম সাইজ' },
      { desktopKey: 'sideSlotExcerptFontSize', mobileKey: 'sideSlotExcerptFontSizeMobile', label: 'এক্সসার্পট সাইজ' },
    ],
  },
  {
    key: 'grid',
    label: '🔲 স্পেশাল গ্রিড (SP-3 to SP-10)',
    desc: 'হিরো সেকশনের নিচে ৪টি কলামের গ্রিড',
    fields: [
      { desktopKey: 'gridSlotTitleFontSize', mobileKey: 'gridSlotTitleFontSizeMobile', label: 'শিরোনাম সাইজ' },
      { desktopKey: 'gridSlotExcerptFontSize', mobileKey: 'gridSlotExcerptFontSizeMobile', label: 'এক্সসার্পট সাইজ' },
    ],
  },
  {
    key: 'category',
    label: '🏷️ ক্যাটাগরি রো (নিচের ৩টি সারি)',
    desc: 'রাজনীতি, আন্তর্জাতিক, জাতীয় — প্রতিটি সারিতে ৮টি স্লট',
    fields: [
      { desktopKey: 'categoryRowHeadingSize', mobileKey: 'categoryRowHeadingSizeMobile', label: 'ক্যাটাগরি শিরোনাম (যেমন: "রাজনীতি")' },
      { desktopKey: 'categoryLeadArticleTitleSize', mobileKey: 'categoryLeadArticleTitleSizeMobile', label: 'প্রথম নিবন্ধের শিরোনাম (বাম কলাম)' },
      { desktopKey: 'categoryArticleTitleSize', mobileKey: 'categoryArticleTitleSizeMobile', label: 'অন্যান্য নিবন্ধের শিরোনাম' },
      { desktopKey: 'categoryArticleExcerptSize', mobileKey: 'categoryArticleExcerptSizeMobile', label: 'এক্সসার্পট সাইজ' },
    ],
  },
  {
    key: 'recent',
    label: '⏳ সর্বশেষ সংবাদ',
    desc: 'পেজের নিচের অংশ',
    fields: [
      { desktopKey: 'recentHeadingSize', mobileKey: 'recentHeadingSizeMobile', label: 'শিরোনাম ("সর্বশেষ সংবাদ")' },
      { desktopKey: 'recentArticleTitleSize', mobileKey: 'recentArticleTitleSizeMobile', label: 'নিবন্ধের শিরোনাম' },
    ],
  },
  {
    key: 'social',
    label: '🔗 সোশ্যাল উইজেট',
    desc: 'Facebook / YouTube প্রমোশন কার্ড',
    fields: [
      { desktopKey: 'socialWidgetFontSize', mobileKey: 'socialWidgetFontSizeMobile', label: 'টেক্সট সাইজ' },
    ],
  },
]

const SETTINGS_DOC = 'typography'

function TypographyPage() {
  const [config, setConfig] = useState<TypographyConfig>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC))
        if (snap.exists()) {
          setConfig({ ...DEFAULTS, ...snap.data() as Partial<TypographyConfig> })
        }
      } catch (e) {
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const update = (key: keyof TypographyConfig, val: number | 'normal' | 'bold') => {
    setConfig(p => ({ ...p, [key]: val }))
    setSaveStatus('idle')
  }

  const reset = () => {
    setConfig(DEFAULTS)
    setSaveStatus('idle')
  }

  const save = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      await setDoc(doc(db, 'settings', SETTINGS_DOC), config)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (e) {
      console.error('Error:', e)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (key: string) => {
    setCollapsed(p => ({ ...p, [key]: !p[key] }))
  }

  if (loading) {
    return (
      <div className="flex items-center gap-4 p-6">
        <Link href="/admin/tools" className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
        <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tools" className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold">🔤 টাইপোগ্রাফি</h1>
            <p className="text-sm text-muted-foreground mt-1">ডেস্কটপ ও মোবাইলের জন্য আলাদা ফন্ট সাইজ (১২-৪০px)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all">
            <RotateCcw className="w-4 h-4" /> রিসেট
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ...</> : saveStatus === 'success' ? <><Check className="w-4 h-4" /> সংরক্ষিত</> : <><Save className="w-4 h-4" /> সংরক্ষণ</>}
          </button>
        </div>
      </div>

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs text-red-600">সংরক্ষণে ত্রুটি!</p>
        </div>
      )}

      <div className="space-y-4">
        {SECTIONS.map(section => (
          <div key={section.key} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <h2 className="font-bold text-foreground">{section.label}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
              </div>
              {collapsed[section.key] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
            </button>

            {!collapsed[section.key] && (
              <div className="p-4 pt-0 space-y-5">
                {section.fields.map(field => (
                  <div key={field.desktopKey}>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">{field.label}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Desktop slider */}
                      <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-blue-700">💻 ডেস্কটপ</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">{config[field.desktopKey]}px</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={field.desktopMax || 45}
                          step={1}
                          value={config[field.desktopKey] as number}
                          onChange={e => update(field.desktopKey, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      {/* Mobile slider */}
                      <div className="p-3 rounded-lg border border-green-100 bg-green-50/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-green-700">📱 মোবাইল</span>
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">{config[field.mobileKey]}px</span>
                        </div>
                        <input
                          type="range"
                          min={8}
                          max={field.mobileMax || 40}
                          step={1}
                          value={config[field.mobileKey] as number}
                          onChange={e => update(field.mobileKey, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {/* Menu font weight only for menu section */}
                {section.key === 'menu' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">ফন্ট ওয়েট (সবার জন্য)</label>
                    <div className="flex gap-2">
                      {(['normal', 'bold'] as const).map(w => (
                        <button
                          key={w}
                          onClick={() => update('menuFontWeight', w)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            config.menuFontWeight === w
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {w === 'bold' ? 'বোল্ড' : 'নরমাল'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview section */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <h3 className="font-bold text-sm mb-2">👁️ প্রিভিউ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-blue-700 mb-1">💻 ডেস্কটপ</p>
            <p>মেনু: <span style={{ fontSize: config.menuFontSize }}>রাজনীতি খেলা</span></p>
            <p>লিড: <span style={{ fontSize: config.leadTitleFontSize }}>শিরোনাম</span> | <span style={{ fontSize: config.leadExcerptFontSize }}>এক্সসার্পট</span></p>
            <p>ক্যাটাগরি: <span style={{ fontSize: config.categoryRowHeadingSize }}>রাজনীতি</span></p>
          </div>
          <div>
            <p className="font-semibold text-green-700 mb-1">📱 মোবাইল</p>
            <p>মেনু: <span style={{ fontSize: config.menuFontSizeMobile }}>রাজনীতি খেলা</span></p>
            <p>লিড: <span style={{ fontSize: config.leadTitleFontSizeMobile }}>শিরোনাম</span> | <span style={{ fontSize: config.leadExcerptFontSizeMobile }}>এক্সসার্পট</span></p>
            <p>ক্যাটাগরি: <span style={{ fontSize: config.categoryRowHeadingSizeMobile }}>রাজনীতি</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypographyPage