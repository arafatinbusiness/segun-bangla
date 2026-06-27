'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, Save, Loader2, Check, AlertCircle, Palette } from 'lucide-react'
import Link from 'next/link'

interface UITemplate {
  id: string
  name: string
  desc: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  bgColor: string
  cardBg: string
  textColor: string
  headingColor: string
  borderColor: string
  borderRadius: string
  cardShadow: string
  imageRadius: string
  spacing: string
}

const TEMPLATES: Record<string, UITemplate> = {
  'default': {
    id: 'default', name: 'ক্লাসিক সেগুন', desc: 'বর্তমান ডিফল্ট UI — বর্তমান গ্রিড লেআউট',
    primaryColor: '#FF0000', secondaryColor: '#000000', accentColor: '#FF4444',
    bgColor: '#FFFFFF', cardBg: '#FFFFFF', textColor: '#000000',
    headingColor: '#000000', borderColor: '#E5E7EB',
    borderRadius: '8px', cardShadow: '0 1px 3px rgba(0,0,0,0.1)', imageRadius: '8px', spacing: '16px',
  },
  'prothom-alo': {
    id: 'prothom-alo', name: 'প্রথম আলো স্টাইল', desc: 'প্রথম আলোর মতো ৩-কলাম গ্রিড লেআউট',
    primaryColor: '#CC0000', secondaryColor: '#1A1A1A', accentColor: '#E00000',
    bgColor: '#FFFFFF', cardBg: '#FFFFFF', textColor: '#1A1A1A',
    headingColor: '#1A1A1A', borderColor: '#E0E0E0',
    borderRadius: '0px', cardShadow: '0 1px 2px rgba(0,0,0,0.06)', imageRadius: '0px', spacing: '12px',
  },
  'news-grid': {
    id: 'news-grid', name: 'নিউজপেপার গ্রিড', desc: '৪-কলাম ক্লাসিক নিউজপেপার লেআউট',
    primaryColor: '#C00000', secondaryColor: '#1A1A1A', accentColor: '#FF0000',
    bgColor: '#FFFFFF', cardBg: '#FFFFFF', textColor: '#1A1A1A',
    headingColor: '#1A1A1A', borderColor: '#E0E0E0',
    borderRadius: '0px', cardShadow: 'none', imageRadius: '0px', spacing: '0px',
  },
}

const TEMPLATE_DOC = 'ui-template'

function UITemplatePage() {
  const [templateId, setTemplateId] = useState('default')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', TEMPLATE_DOC))
        if (snap.exists() && snap.data().templateId && TEMPLATES[snap.data().templateId]) {
          setTemplateId(snap.data().templateId)
        }
      } catch (e) { console.error('[UITemplate] Error:', e) }
      finally { setLoading(false) }
    }
    fetchTemplate()
  }, [])

  const handleSave = async () => {
    setSaving(true); setSaveStatus('idle')
    try {
      await setDoc(doc(db, 'settings', TEMPLATE_DOC), { templateId })
      setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (e) { console.error('[UITemplate] Save error:', e); setSaveStatus('error') }
    finally { setSaving(false) }
  }

  if (loading) {
    return (<div className="flex items-center gap-4 p-6"><Link href="/admin/tools"><ArrowLeft className="w-4 h-4" /></Link><p className="text-sm">লোড হচ্ছে...</p></div>)
  }

  const sel = TEMPLATES[templateId]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tools"><ArrowLeft className="w-4 h-4" /></Link>
          <div><h1 className="text-2xl font-bold">UI টেমপ্লেট</h1><p className="text-sm text-muted-foreground">ওয়েবসাইটের ডিজাইন পরিবর্তন করুন</p></div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> সংরক্ষণ...</> : saveStatus === 'success' ? <><Check className="w-4 h-4" /> সংরক্ষিত</> : <><Save className="w-4 h-4" /> সংরক্ষণ</>}
        </button>
      </div>

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200"><AlertCircle className="w-4 h-4 text-red-500" /><p className="text-xs text-red-600">সংরক্ষণে ত্রুটি!</p></div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(TEMPLATES).map((t) => (
          <div key={t.id} onClick={() => { setTemplateId(t.id); setSaveStatus('idle') }}
            className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${templateId === t.id ? 'border-blue-500 ring-2' : 'border-gray-200 hover:border-gray-300'} bg-white shadow-sm`}>
            <div className="h-2" style={{ background: `linear-gradient(90deg, ${t.primaryColor}, ${t.accentColor})` }} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{t.name}</h3>
                {templateId === t.id && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">সক্রিয়</span>}
              </div>
              <p className="text-sm text-gray-500 mb-3">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-muted-foreground"><strong>ব্যবহার:</strong> টেমপ্লেট সিলেক্ট করুন এবং "সংরক্ষণ" ক্লিক করুন।</p>
      </div>
    </div>
  )
}

export default UITemplatePage