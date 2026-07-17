'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, Save, Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ExcerptConfig {
  heroExcerpt: boolean
  leadExcerpt: boolean
  transitionalExcerpt: boolean
  extraExcerpt: boolean
  categoryLeadExcerpt: boolean
  categoryListExcerpt: boolean
  extraLineClamp: number
  extraFontSize: string
  extraHeadingLineClamp: number
  extraAutoProportion: boolean
}

const DEFAULT_CONFIG: ExcerptConfig = {
  heroExcerpt: true,
  leadExcerpt: true,
  transitionalExcerpt: true,
  extraExcerpt: true,
  categoryLeadExcerpt: true,
  categoryListExcerpt: true,
  extraLineClamp: 6,
  extraFontSize: 'text-sm',
  extraHeadingLineClamp: 2,
  extraAutoProportion: false,
}

const SETTINGS_DOC = 'homepage-excerpts'

const SETTINGS: { key: keyof ExcerptConfig; label: string; desc: string }[] = [
  { key: 'heroExcerpt', label: 'হিরো সেকশন (SP-1 to SP-4)', desc: 'সাইডবারের স্পেশাল বক্স' },
  { key: 'leadExcerpt', label: 'লিড নিবন্ধ', desc: 'প্রধান নিবন্ধের এক্সসার্পট' },
  { key: 'transitionalExcerpt', label: 'ট্রানজিশনাল গ্রিড (SP-5 to SP-8)', desc: 'জাতীয় ক্যাটাগরির আগের রো' },
  { key: 'extraExcerpt', label: 'EXTRA-1 ও EXTRA-2', desc: 'লিডের নিচে দুটি বক্স' },
  { key: 'categoryLeadExcerpt', label: 'ক্যাটাগরি লিড', desc: 'প্রতিটি ক্যাটাগরির প্রথম নিবন্ধ' },
  { key: 'categoryListExcerpt', label: 'ক্যাটাগরি লিস্ট', desc: 'ক্যাটাগরি সেকশনের তালিকা' },
]

function ExcerptSettingsPage() {
  const [config, setConfig] = useState<ExcerptConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC))
        if (snap.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...snap.data() as Partial<ExcerptConfig> })
        }
      } catch (e) {
        console.error('Error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const toggle = (key: keyof ExcerptConfig) => {
    setConfig(p => ({ ...p, [key]: !p[key] }))
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tools" className="p-1.5 rounded-lg hover:bg-muted"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold">এক্সসার্পট সেটিংস</h1>
            <p className="text-sm text-muted-foreground mt-1">হোমপেজের বিভিন্ন অংশে এক্সসার্পট দেখানো/লুকানো</p>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ...</> : saveStatus === 'success' ? <><Check className="w-4 h-4" /> সংরক্ষিত</> : <><Save className="w-4 h-4" /> সংরক্ষণ</>}
        </button>
      </div>

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs text-red-600">সংরক্ষণে ত্রুটি!</p>
        </div>
      )}

      <div className="space-y-3">
        {SETTINGS.map(s => (
          <div key={s.key} className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h3 className="font-semibold">{s.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
              <button onClick={() => toggle(s.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${config[s.key] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config[s.key] ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EXTRA-1 / EXTRA-2 Specific Controls */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold">EXTRA-1 ও EXTRA-2 — বিস্তারিত সেটিংস</h3>
          <p className="text-xs text-muted-foreground mt-0.5">হেডিং ও এক্সসার্পটের লাইন সংখ্যা এবং ফন্ট সাইজ কন্ট্রোল</p>
        </div>
        <div className="p-4 space-y-4">
          {/* Auto Proportion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <div className="flex-1 mr-4">
              <label className="text-sm font-bold text-gray-800">🔄 অটো প্রোপোর্শন</label>
              <p className="text-[10px] text-gray-500 mt-0.5">চালু করলে EXTRA-1 ও EXTRA-2 সবসময় সমান উচ্চতায় থাকবে — বড় হেডিংয়ে এক্সসার্পট কম দেখাবে, ছোট হেডিংয়ে বেশি</p>
            </div>
            <button
              onClick={() => { setConfig(p => ({ ...p, extraAutoProportion: !p.extraAutoProportion })); setSaveStatus('idle') }}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${config.extraAutoProportion ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${config.extraAutoProportion ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Manual controls — shown only when auto proportion is OFF */}
          {!config.extraAutoProportion && (
            <>
              {/* Heading Line Clamp */}
              <div>
                <label className="text-sm font-medium text-gray-700">হেডিং লাইনের সংখ্যা</label>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">শিরোনাম কত লাইন পর্যন্ত দেখাবে</p>
                <div className="flex gap-2">
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => { setConfig(p => ({ ...p, extraHeadingLineClamp: n })); setSaveStatus('idle') }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        config.extraHeadingLineClamp === n
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {n} লাইন
                    </button>
                  ))}
                </div>
              </div>

              {/* Excerpt Line Clamp */}
              <div>
                <label className="text-sm font-medium text-gray-700">এক্সসার্পট লাইনের সংখ্যা (Line Clamp)</label>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">এক্সসার্পট কত লাইন দেখাবে</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => { setConfig(p => ({ ...p, extraLineClamp: n })); setSaveStatus('idle') }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        config.extraLineClamp === n
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {n} লাইন
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-sm font-medium text-gray-700">এক্সসার্পট ফন্ট সাইজ</label>
                <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">এক্সসার্পটের টেক্সট সাইজ</p>
                <div className="flex gap-2">
                  {[
                    { value: 'text-xs', label: 'অতি ছোট' },
                    { value: 'text-sm', label: 'ছোট' },
                    { value: 'text-base', label: 'মাঝারি' },
                    { value: 'text-lg', label: 'বড়' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setConfig(p => ({ ...p, extraFontSize: opt.value })); setSaveStatus('idle') }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        config.extraFontSize === opt.value
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Auto proportion info — shown when auto is ON */}
          {config.extraAutoProportion && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-xs text-purple-700">
                <strong>🔄 অটো প্রোপোর্শন চালু:</strong> হেডিং যত লাইন নেবে, এক্সসার্পট তত লাইন কম পাবে — ফলে দুটি কার্ড সবসময় সমান উচ্চতায় থাকবে।
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-muted-foreground"><strong>ব্যবহার:</strong> টগল সুইচ ব্যবহার করে এক্সসার্পট দেখানো/লুকান। EXTRA-1 ও EXTRA-2 এর জন্য আলাদাভাবে লাইন সংখ্যা ও ফন্ট সাইজ সেট করুন। সংরক্ষণ ক্লিক করলে Firestore-এ সেভ হবে।</p>
      </div>
    </div>
  )
}

export default ExcerptSettingsPage