'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { collection, query, where, orderBy, limit, getDocs, writeBatch, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, Save, Loader2, Check, AlertCircle, GripVertical } from 'lucide-react'
import Link from 'next/link'
import type { FirestoreArticle } from '@/lib/types'
import { getSlotAssignments } from '@/lib/services/slot-shift'

// 11 slots: 0=lead, 1=sp1 ... 10=sp10
const SLOT_KEYS = ['lead', 'sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8', 'sp9', 'sp10']
const TOTAL_SLOTS = 11

function ReorderSpecialPage() {
  const [articles, setArticles] = useState<(FirestoreArticle | null)[]>(new Array(TOTAL_SLOTS).fill(null))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [sourceArticles, setSourceArticles] = useState<FirestoreArticle[]>([])
  const [showSourceList, setShowSourceList] = useState(false)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const slotAssignments = await getSlotAssignments()
      const slotArticleIds = Object.values(slotAssignments).filter(Boolean)
      const slots: (FirestoreArticle | null)[] = new Array(TOTAL_SLOTS).fill(null)

      if (slotArticleIds.length > 0) {
        const slotArticles: FirestoreArticle[] = []
        for (const id of slotArticleIds) {
          const docSnap = await getDoc(doc(db, 'articles', id))
          if (docSnap.exists()) {
            slotArticles.push({ ...docSnap.data(), docId: docSnap.id } as FirestoreArticle)
          }
        }

        // Map slot keys to indices
        const SLOT_KEY_TO_IDX: Record<string, number> = {
          'lead': 0, 'sp1': 1, 'sp2': 2, 'sp3': 3, 'sp4': 4,
          'sp5': 5, 'sp6': 6, 'sp7': 7, 'sp8': 8, 'sp9': 9, 'sp10': 10
        }

        for (const [slotKey, articleId] of Object.entries(slotAssignments)) {
          const slotIdx = SLOT_KEY_TO_IDX[slotKey]
          if (typeof slotIdx === 'number' && slotIdx >= 0 && slotIdx < TOTAL_SLOTS) {
            const article = slotArticles.find(a => a.docId === articleId)
            if (article) slots[slotIdx] = article
          }
        }
      }

      // Get source articles: published articles NOT in any slot
      const sourceQ = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        where('isSpecial', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(50),
      )
      const sourceSnap = await getDocs(sourceQ)
      const allSpecialArts = sourceSnap.docs.map((d) => ({ ...d.data(), docId: d.id })) as FirestoreArticle[]

      const leadQ = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        where('isLead', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(20),
      )
      const leadSnap = await getDocs(leadQ)
      const leadArts = leadSnap.docs.map((d) => ({ ...d.data(), docId: d.id })) as FirestoreArticle[]

      const inSlots = new Set(slotArticleIds)
      const sourceList = [...allSpecialArts, ...leadArts]
        .filter(a => !inSlots.has(a.docId))
        .filter((a, idx, self) => self.findIndex(s => s.docId === a.docId) === idx)
        .filter(a => a.isLead || (a.isSpecial && typeof a.isSpecialOrder === 'number' && a.isSpecialOrder >= 0))

      console.log('[Reorder] slots:', slots.map((s, i) => s ? `${i}: ${s.title?.slice(0,25)}` : `${i}: empty`))
      setArticles(slots)
      setSourceArticles(sourceList)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const handleSlotClick = (slotIdx: number) => {
    if (selectedSlot === null) {
      setSelectedSlot(slotIdx)
      return
    }
    if (selectedSlot === slotIdx) {
      setSelectedSlot(null)
      return
    }
    // Swap
    const newList = [...articles]
    const temp = newList[selectedSlot]
    newList[selectedSlot] = newList[slotIdx]
    newList[slotIdx] = temp
    setArticles(newList)
    setSelectedSlot(null)
    setSaveStatus('idle')
  }

  const handleSourceClick = (srcIdx: number) => {
    if (selectedSlot === null) return
    const newList = [...articles]
    const newSource = [...sourceArticles]
    const [moved] = newSource.splice(srcIdx, 1)
    if (newList[selectedSlot]) newSource.push(newList[selectedSlot])
    newList[selectedSlot] = moved
    setArticles(newList)
    setSourceArticles(newSource)
    setSelectedSlot(null)
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const slotAssignments: Record<string, string> = {}
      // Build new slot assignments
      for (let order = 0; order < TOTAL_SLOTS; order++) {
        const article = articles[order]
        if (article?.docId) slotAssignments[SLOT_KEYS[order]] = article.docId
      }

      // First clear old assignments — but only for articles that still exist
      const prevSlotDoc = await getDoc(doc(db, 'settings', 'slot-assignments'))
      const batch = writeBatch(db)
      if (prevSlotDoc.exists()) {
        const prevData = prevSlotDoc.data() as Record<string, string>
        const prevIds = [...new Set(Object.values(prevData).filter(Boolean))]
        for (const id of prevIds) {
          const artSnap = await getDoc(doc(db, 'articles', id))
          if (artSnap.exists()) {
            batch.update(doc(db, 'articles', id), { isLead: false, isSpecial: false, isSpecialOrder: -1 })
          } else {
            console.warn(`[Reorder] Article ${id} no longer exists, skipping clear`)
          }
        }
      }

      // Set new assignments
      for (let order = 0; order < TOTAL_SLOTS; order++) {
        const article = articles[order]
        if (article?.docId) {
          // Verify the article still exists before batch update
          const artSnap = await getDoc(doc(db, 'articles', article.docId))
          if (artSnap.exists()) {
            batch.update(doc(db, 'articles', article.docId), {
              isLead: order === 0,
              isSpecial: order !== 0,
              isSpecialOrder: order,
            })
          } else {
            console.warn(`[Reorder] Article ${article.docId} no longer exists, removing from slot ${order}`)
            delete slotAssignments[SLOT_KEYS[order]]
          }
        }
      }

      batch.set(doc(db, 'settings', 'slot-assignments'), slotAssignments)
      await batch.commit()
      console.log('[Save] Slot assignments saved:', slotAssignments)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving order:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center gap-4 p-6"><p className="text-sm text-muted-foreground">Loading...</p></div>
  }

  const getArticle = (slotIdx: number) => articles[slotIdx]
  const isEmptySlot = (slotIdx: number) => !articles[slotIdx]

  const GridCell = ({ slotIdx, label }: { slotIdx: number; label: string }) => {
    const art = getArticle(slotIdx)
    const isEmpty = isEmptySlot(slotIdx)
    const isSelected = selectedSlot === slotIdx

    return (
      <div
        className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
          isSelected ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400' : 'border-gray-200'
        } ${isEmpty ? 'bg-gray-50' : 'bg-white shadow-sm'}`}
        onClick={() => handleSlotClick(slotIdx)}
      >
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-md shadow-sm">
          {label}
        </div>
        {isEmpty ? (
          <div className="flex items-center justify-center h-full min-h-[100px] text-xs text-gray-400 italic">খালি</div>
        ) : (
          <div className="group h-full flex flex-col">
            {label === 'লিড' && (
              <div className="p-2 text-center">
                <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">{art!.title}</p>
              </div>
            )}
            <div className="aspect-video bg-gray-100 overflow-hidden relative">
              {art!.imageUrl ? (
                <img src={art!.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <GripVertical className="w-5 h-5 text-white/0 group-hover:text-white/70 transition-all" />
              </div>
            </div>
            {label !== 'লিড' && (
              <div className="p-2 flex-1">
                <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{art!.title}</p>
                {art!.excerpt && <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">{art!.excerpt}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tools" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">সিরিয়াল রিঅ্যারেঞ্জ</h1>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'success' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold shadow-sm">
              <Check className="w-3.5 h-3.5" /> সংরক্ষিত
            </div>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50">
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> সংরক্ষণ...</> : <><Save className="w-3.5 h-3.5" /> সংরক্ষণ</>}
            </button>
          )}
        </div>
      </div>

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">সংরক্ষণে ত্রুটি!</p>
        </div>
      )}

      {/* === Homepage Layout Visualization === */}
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50 p-3 space-y-4">
        
        {/* Row 1: 3-Column Hero - Ad+SP-1 | Lead | Ad+SP-2 */}
        <div className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider py-1 border-b border-dashed border-gray-200 mb-2">সারি ১: হিরো গ্রিড</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Left col: Ad + SP-1 */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-[9px] text-center text-gray-400 italic border border-dashed border-gray-300 rounded p-2">বিজ্ঞাপন</div>
            <GridCell slotIdx={1} label="SP-1" />
          </div>
          {/* Center col: Lead */}
          <div className="md:col-span-2">
            <GridCell slotIdx={0} label="লিড" />
          </div>
          {/* Right col: Ad + SP-2 */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-[9px] text-center text-gray-400 italic border border-dashed border-gray-300 rounded p-2">বিজ্ঞাপন</div>
            <GridCell slotIdx={2} label="SP-2" />
          </div>
        </div>

        {/* Row 2: SP-3 to SP-6 (4 columns) */}
        <div className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider py-1 border-t border-dashed border-gray-200 pt-4 mt-2">সারি ২: SP-3 to SP-6</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <GridCell slotIdx={3} label="SP-3" />
          <GridCell slotIdx={4} label="SP-4" />
          <GridCell slotIdx={5} label="SP-5" />
          <GridCell slotIdx={6} label="SP-6" />
        </div>

        {/* Row 3: SP-7 to SP-10 (4 columns) */}
        <div className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider py-1 border-t border-dashed border-gray-200 pt-4 mt-2">সারি ৩: SP-7 to SP-10</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <GridCell slotIdx={7} label="SP-7" />
          <GridCell slotIdx={8} label="SP-8" />
          <GridCell slotIdx={9} label="SP-9" />
          <GridCell slotIdx={10} label="SP-10" />
        </div>

        {/* Source List */}
        {sourceArticles.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <button onClick={() => setShowSourceList(!showSourceList)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left">
              <span className={`text-xs transition-transform ${showSourceList ? 'rotate-90' : ''}`}>▶</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                📋 সোর্স লিস্ট {showSourceList ? 'লুকান' : 'দেখান'} ({sourceArticles.length})
              </span>
            </button>
            {showSourceList && (
              <div className="mt-2 p-3 space-y-1.5 rounded-xl border border-gray-200 bg-white shadow-sm">
                {sourceArticles.map((article, idx) => (
                  <div key={article.docId}
                    className="flex items-center gap-2.5 px-3 py-2 transition-all duration-150 select-none rounded-lg border border-transparent hover:border-gray-200 bg-white shadow-sm hover:shadow cursor-pointer"
                    onClick={() => handleSourceClick(idx)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{article.title}</p>
                      <p className="text-[9px] text-muted-foreground truncate">/{article.slug}</p>
                    </div>
                    <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600">
                      {article.isLead ? 'লিড' : 'SP'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReorderSpecialPage