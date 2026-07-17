'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  ArrowLeft, Save,
  Loader2, Check, AlertCircle, GripVertical
} from 'lucide-react'
import Link from 'next/link'
import type { FirestoreArticle } from '@/lib/types'
// Homepage top section grid layout:
// Row 1 (Hero):  LEFT:[SP-1][SP-3]  CENTER:[লিড][EXTRA-1][EXTRA-2]  RIGHT:[SP-2][SP-4]
// Row 2 (before jatiyo): [SP-5][SP-6][SP-7][SP-8]
// Homepage layout:
// Row 1 (Hero): LEFT:[SP-1][SP-3]  CENTER:[লিড][EXTRA-1][EXTRA-2]  RIGHT:[SP-2][SP-4]
// Row 2 (before jatiyo): [SP-5][SP-6][SP-7][SP-8]
// EXTRA-1 = slot 5 (lead bottom left), EXTRA-2 = slot 6 (lead bottom right)
// SP-5 = slot 7, SP-6 = slot 8, SP-7 = slot 9 (source), SP-8 = slot (source)
// IMPORTANT: slotIdx matches isSpecialOrder value in Firestore
// articles[] index = slotIdx = isSpecialOrder
// Homepage specialArticlesList: [SP-1(1), SP-2(2), SP-3(3), SP-4(4)]
const GRID_POSITIONS = [
  { slotIdx: 1, label: 'SP-1', row: 1 },
  { slotIdx: 2, label: 'SP-2', row: 1 },
  { slotIdx: 0, label: 'লিড', row: 1 },
  { slotIdx: 3, label: 'SP-3', row: 1 },
  { slotIdx: 4, label: 'SP-4', row: 1 },
  { slotIdx: 5, label: 'EXTRA-1', row: 1 },
  { slotIdx: 6, label: 'EXTRA-2', row: 1 },
  { slotIdx: 7, label: 'SP-5', row: 2 },
  { slotIdx: 8, label: 'SP-6', row: 2 },
  { slotIdx: 9, label: 'SP-7', row: 2 },
  { slotIdx: 10, label: 'SP-8', row: 2 },
]



function ReorderSpecialPage() {
  const [articles, setArticles] = useState<FirestoreArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  // Click-to-swap state: first click selects, second click swaps
  const [selectedSlot, setSelectedSlot] = useState<{ type: 'grid'|'source'; slotIdx?: number } | null>(null)
  const [sourceArticles, setSourceArticles] = useState<FirestoreArticle[]>([])
  const [showSourceList, setShowSourceList] = useState(false)
  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      // 1. First get the slot-assignments document (single source of truth)
      const slotDoc = await getDoc(doc(db, 'settings', 'slot-assignments'))
      const slotAssignments: Record<string, string> = slotDoc.exists() ? slotDoc.data() as Record<string, string> : {}
      
      // 2. Get all articles that are in slot-assignments
      const slotArticleIds = Object.values(slotAssignments).filter(Boolean)
      const slots: FirestoreArticle[] = new Array(12).fill(null)
      
      if (slotArticleIds.length > 0) {
        // Fetch each article individually (Firestore doesn't support "IN" with more than 10)
        // But we can batch them
        const slotArticles: FirestoreArticle[] = []
        for (const id of slotArticleIds) {
          const docSnap = await getDoc(doc(db, 'articles', id))
          if (docSnap.exists()) {
            slotArticles.push({ ...docSnap.data(), docId: docSnap.id } as FirestoreArticle)
          }
        }
        
        // Map slot keys to slot indices
        const SLOT_KEY_TO_IDX: Record<string, number> = {
          'lead': 0, 'sp1': 1, 'sp2': 2, 'sp3': 3, 'sp4': 4,
          'extra1': 5, 'extra2': 6, 'sp5': 7, 'sp6': 8, 'sp7': 9, 'sp8': 10
        }
        
        for (const [slotKey, articleId] of Object.entries(slotAssignments)) {
          const slotIdx = SLOT_KEY_TO_IDX[slotKey]
          if (typeof slotIdx === 'number' && slotIdx >= 0 && slotIdx < 12) {
            const article = slotArticles.find(a => a.docId === articleId)
            if (article) {
              slots[slotIdx] = article
            }
          }
        }
      }

      // 3. Get source articles: published articles that are NOT in any slot
      // Only fetch articles that have isSpecial=true OR isLead=true to keep list clean
      const sourceQ = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        where('isSpecial', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(50),
      )
      const sourceSnap = await getDocs(sourceQ)
      const allSpecialArts = sourceSnap.docs.map((d) => ({
        ...d.data(),
        docId: d.id,
      })) as FirestoreArticle[]

      // Also get lead articles that might not be in slot-assignments
      const leadQ = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        where('isLead', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(20),
      )
      const leadSnap = await getDocs(leadQ)
      const leadArts = leadSnap.docs.map((d) => ({
        ...d.data(),
        docId: d.id,
      })) as FirestoreArticle[]

      // Source list: articles that are NOT already in slots
      const inSlots = new Set(slotArticleIds)
      const sourceArticles = [...allSpecialArts, ...leadArts]
        .filter(a => !inSlots.has(a.docId))
        // Remove duplicates (same article might be in both queries)
        .filter((a, idx, self) => self.findIndex(s => s.docId === a.docId) === idx)
        // Only show articles that have valid special flags
        .filter(a => a.isLead || (a.isSpecial && typeof a.isSpecialOrder === 'number' && a.isSpecialOrder >= 0))

      console.log('[Reorder] slots:', slots.map((s, i) => s ? `${i}: ${s?.title?.slice(0,25)}` : `${i}: empty`))
      console.log('[Reorder] source:', sourceArticles.map(s => s?.title?.slice(0,30)))
      setArticles(slots)
      setSourceArticles(sourceArticles)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleSlotClick = (slotIdx: number) => {
    if (!selectedSlot) {
      setSelectedSlot({ type: 'grid', slotIdx })
      return
    }

    // Click same slot: deselect
    if (selectedSlot.type === 'grid' && selectedSlot.slotIdx === slotIdx) {
      setSelectedSlot(null)
      return
    }

    const newList = [...articles]

    if (selectedSlot.type === 'grid' && typeof selectedSlot.slotIdx === 'number') {
      // Grid-to-grid swap
      const temp = newList[selectedSlot.slotIdx]
      newList[selectedSlot.slotIdx] = newList[slotIdx]
      newList[slotIdx] = temp
      setArticles(newList)
    } else if (selectedSlot.type === 'source' && typeof selectedSlot.slotIdx === 'number') {
      // Source-to-grid: move article from source to this grid slot
      const newSource = [...sourceArticles]
      const srcIdx = selectedSlot.slotIdx
      if (srcIdx >= 0 && srcIdx < newSource.length) {
        const [moved] = newSource.splice(srcIdx, 1)
        if (newList[slotIdx]) {
          newSource.push(newList[slotIdx])
        }
        newList[slotIdx] = moved
        setArticles(newList)
        setSourceArticles(newSource)
      }
    }

    setSelectedSlot(null)
    setSaveStatus('idle')
  }

  const handleSourceClick = (srcIdx: number) => {
    if (!selectedSlot) {
      setSelectedSlot({ type: 'source', slotIdx: srcIdx })
      return
    }

    // If grid was selected first, move this source article into that grid slot
    if (selectedSlot.type === 'grid' && typeof selectedSlot.slotIdx === 'number') {
      const newList = [...articles]
      const newSource = [...sourceArticles]
      const gridSlotIdx = selectedSlot.slotIdx
      
      if (srcIdx >= 0 && srcIdx < newSource.length) {
        const [moved] = newSource.splice(srcIdx, 1)
        if (newList[gridSlotIdx]) {
          newSource.push(newList[gridSlotIdx])
        }
        newList[gridSlotIdx] = moved
        setArticles(newList)
        setSourceArticles(newSource)
        setSaveStatus('idle')
      }
    }

    setSelectedSlot(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      // Build slot assignments map: slot name → docId
      // This is the SINGLE SOURCE OF TRUTH for the entire portal
      const slotAssignments: Record<string, string> = {}
      const batch = writeBatch(db)
      
      for (let order = 0; order < 12; order++) {
        const article = articles[order]
        if (!article || !article.docId) continue
        
        const slotKey = 
          order === 0 ? 'lead' :
          order === 1 ? 'sp1' :
          order === 2 ? 'sp2' :
          order === 3 ? 'sp3' :
          order === 4 ? 'sp4' :
          order === 5 ? 'extra1' :
          order === 6 ? 'extra2' :
          order === 7 ? 'sp5' :
          order === 8 ? 'sp6' :
          order === 9 ? 'sp7' :
          order === 10 ? 'sp8' : 'sp9'
        
        slotAssignments[slotKey] = article.docId
      }
      
      // Clear ALL existing isSpecialOrder and isSpecial/isLead to prevent conflicts
      // Each slot in slot-assignments is the single source of truth
      const allArts = await getDocs(query(collection(db, 'articles'), where('isSpecialOrder', '>=', 0)))
      allArts.docs.forEach(docSnap => {
        batch.update(docSnap.ref, {
          isLead: false,
          isSpecial: false,
          isSpecialOrder: -1,
        })
      })
      
      // Now set only the articles that are in slots
      for (let order = 0; order < 12; order++) {
        const article = articles[order]
        if (!article || !article.docId) continue
        const articleRef = doc(db, 'articles', article.docId)
        batch.update(articleRef, {
          isLead: order === 0,
          isSpecial: order !== 0,
          isSpecialOrder: order,
        })
      }
      
      // Save the slot mapping document (THE single source of truth)
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
  const isEmptySlot = (slotIdx: number) => !articles[slotIdx] || !articles[slotIdx].docId

  const slotColors = [
    'from-red-500 to-rose-600', 'from-violet-500 to-purple-600', 'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-pink-500 to-fuchsia-600',
    'from-indigo-500 to-blue-600', 'from-teal-500 to-emerald-600', 'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-600',
  ]

  const GridCell = ({ slotIdx, label }: { slotIdx: number; label: string }) => {
    const art = getArticle(slotIdx)
    // Dynamic slots (slotIdx = -1: EXTRA-1, EXTRA-2, SP-7, SP-8) - show as preview
    if (slotIdx === -1) {
      return (
        <div className="relative rounded-lg overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/30 dark:bg-gray-800/30 flex items-center justify-center h-full min-h-[80px]">
          <span className="text-[10px] text-gray-400 italic">{label} (হোমপেজ ডায়নামিক)</span>
        </div>
      )
    }
    const isEmpty = isEmptySlot(slotIdx)
    const isSelected = selectedSlot?.type === 'grid' && selectedSlot.slotIdx === slotIdx

    return (
      <div
        className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
          isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-400' : 'border-gray-200 dark:border-gray-700'
        } ${isEmpty ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900 shadow-sm'}`}
        onClick={() => handleSlotClick(slotIdx)}
        style={{cursor: 'pointer'}}
      >
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-md shadow-sm">
          {label}
        </div>
        {isEmpty ? (
          <div className="flex items-center justify-center h-full min-h-[120px] text-xs text-gray-400 italic">খালি</div>
        ) : (
          <div
            className="group h-full flex flex-col"
          >
            {/* Lead: title ABOVE image */}
            {label === 'লিড' && (
              <div className="p-2 text-center">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">{art!.title}</p>
              </div>
            )}
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
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
            {/* Non-lead: title + excerpt BELOW image */}
            {label !== 'লিড' && (
              <div className="p-2 flex-1">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">{art!.title}</p>
                {art!.excerpt && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">{art!.excerpt}</p>
                )}
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
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> সংরক্ষণ...</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> সংরক্ষণ</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">সংরক্ষণে ত্রুটি!</p>
        </div>
      )}

      {/* === Homepage SP Section === */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-3 space-y-4">
        
        {/* Row 1: Hero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Left col: SP-1 + SP-3 */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider py-1 border-b border-dashed border-gray-200 dark:border-gray-700">সাইডবার স্পেশাল</div>
            <GridCell slotIdx={GRID_POSITIONS[0].slotIdx} label={GRID_POSITIONS[0].label} />
            <GridCell slotIdx={GRID_POSITIONS[3].slotIdx} label={GRID_POSITIONS[3].label} />
          </div>
          {/* Center col: Lead + EXTRA-1 + EXTRA-2 */}
          <div className="md:col-span-2 space-y-3">
            <GridCell slotIdx={GRID_POSITIONS[2].slotIdx} label={GRID_POSITIONS[2].label} />
            <div className="grid grid-cols-2 gap-3">
              <GridCell slotIdx={GRID_POSITIONS[5].slotIdx} label={GRID_POSITIONS[5].label} />
              <GridCell slotIdx={GRID_POSITIONS[6].slotIdx} label={GRID_POSITIONS[6].label} />
            </div>
          </div>
          {/* Right col: SP-2 + SP-4 */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider py-1 border-b border-dashed border-gray-200 dark:border-gray-700">সাইডবার স্পেশাল</div>
            <GridCell slotIdx={GRID_POSITIONS[1].slotIdx} label={GRID_POSITIONS[1].label} />
            <GridCell slotIdx={GRID_POSITIONS[4].slotIdx} label={GRID_POSITIONS[4].label} />
          </div>
        </div>

        {/* Row 2: Dedicated Special Row (before jatiyo category) */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {GRID_POSITIONS.filter(p => p.row === 2).map((pos) => (
              <GridCell key={pos.label} slotIdx={pos.slotIdx} label={pos.label} />
            ))}
          </div>
      {/* Source List Toggle Button */}
      {sourceArticles.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <button
            onClick={() => setShowSourceList(!showSourceList)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
          >
            <span className={`text-xs transition-transform ${showSourceList ? 'rotate-90' : ''}`}>▶</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              📋 সোর্স লিস্ট {showSourceList ? 'লুকান' : 'দেখান'} ({sourceArticles.length})
            </span>
          </button>
          
          {showSourceList && (
            <div className="mt-2 p-3 space-y-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
              {sourceArticles.map((article, idx) => {
                if (!article || !article.docId) return null
                return (
                  <div
                    key={article.docId}
                    className="flex items-center gap-2.5 px-3 py-2 transition-all duration-150 select-none rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow"
                    onClick={() => handleSourceClick(idx)}
                    style={{cursor: 'pointer'}}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{article.title}</p>
                      <p className="text-[9px] text-muted-foreground truncate">/{article.slug}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {article.imageUrl && (
                        <div className="w-5 h-5 rounded overflow-hidden bg-muted shrink-0">
                          <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600">
                        {article.isLead ? 'লিড' : 'SP'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
        </div>

      </div>
    </div>
  )
}

export default ReorderSpecialPage


