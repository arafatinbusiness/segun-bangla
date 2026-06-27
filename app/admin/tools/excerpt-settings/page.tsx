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
}

const DEFAULT_CONFIG: ExcerptConfig = {
  heroExcerpt: true,
  leadExcerpt: true,
  transitionalExcerpt: true,
  extraExcerpt: true,
  categoryLeadExcerpt: true,
  categoryListExcerpt: true,
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

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-muted-foreground"><strong>ব্যবহার:</strong> টগল সুইচ ব্যবহার করে এক্সসার্পট দেখানো/লুকান। সংরক্ষণ ক্লিক করলে Firestore-এ সেভ হবে।</p>
      </div>
    </div>
  )
}

export default ExcerptSettingsPage