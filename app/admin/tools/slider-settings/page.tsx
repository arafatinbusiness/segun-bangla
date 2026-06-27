'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, Save, Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const SLIDER_DOC = 'category-sliders'

function SliderSettingsPage() {
  const [config, setConfig] = useState<Record<string, boolean>>({})
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', SLIDER_DOC))
        const existing = snap.exists() ? snap.data() : {}
        const { getAllCategories } = await import('@/lib/services/categories')
        const cats = await getAllCategories()
        const nameMap: Record<string, string> = {}
        const cfg: Record<string, boolean> = {}
        cats.forEach(cat => { nameMap[cat.id] = cat.name; cfg[cat.id] = existing[cat.id] ?? true })
        setCategoryNames(nameMap)
        setConfig(cfg)
      } catch (e) { console.error('Error:', e) }
      finally { setLoading(false) }
    }
    fetchConfig()
  }, [])

  const toggle = (id: string) => { setConfig(p => ({ ...p, [id]: !p[id] })); setSaveStatus('idle') }

  const handleSave = async () => {
    setSaving(true); setSaveStatus('idle')
    try { await setDoc(doc(db, 'settings', SLIDER_DOC), config); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000) }
    catch (e) { console.error('Error:', e); setSaveStatus('error') }
    finally { setSaving(false) }
  }

  if (loading) return (<div className="flex items-center gap-4 p-6"><Link href="/admin/tools"><ArrowLeft className="w-4 h-4" /></Link><p className="text-sm">লোড হচ্ছে...</p></div>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tools"><ArrowLeft className="w-4 h-4" /></Link>
          <div><h1 className="text-2xl font-bold">ক্যাটাগরি স্লাইডার</h1><p className="text-sm text-muted-foreground mt-1">প্রতিটি ক্যাটাগরির জন্য স্লাইডার অন/অফ</p></div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ...</> : saveStatus === 'success' ? <><Check className="w-4 h-4" /> সংরক্ষিত</> : <><Save className="w-4 h-4" /> সংরক্ষণ</>}
        </button>
      </div>

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200"><AlertCircle className="w-4 h-4 text-red-500" /><p className="text-xs text-red-600">সংরক্ষণে ত্রুটি!</p></div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(config).map(([id, enabled]) => (
          <div key={id} className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${enabled ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50/50'} shadow-sm`}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="font-semibold">{categoryNames[id] || id}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{enabled ? 'স্লাইডার সক্রিয়' : 'স্লাইডার বন্ধ'}</p>
              </div>
              <button onClick={() => toggle(id)}
                className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SliderSettingsPage
