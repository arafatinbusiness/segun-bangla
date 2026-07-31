import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// 11 slots: 0=lead, 1=sp1, 2=sp2 ... 10=sp10
const SLOT_KEYS = ['lead', 'sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8', 'sp9', 'sp10']
const TOTAL_SLOTS = 11

function migrateKeys(data: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, val] of Object.entries(data)) {
    if (!val) continue
    if (key === 'extra1') result['sp4'] = val
    else if (key === 'extra2') result['sp5'] = val
    else if (SLOT_KEYS.includes(key)) result[key] = val
  }
  return result
}

export async function getSlotAssignments(): Promise<Record<string, string>> {
  try {
    const slotDoc = await getDoc(doc(db, 'settings', 'slot-assignments'))
    if (slotDoc.exists()) {
      return migrateKeys(slotDoc.data() as Record<string, string>)
    }
  } catch { return {} }
  return {}
}

export async function autoShiftSlots(targetSlot: number, newArticleId: string): Promise<void> {
  if (targetSlot < 0 || targetSlot >= TOTAL_SLOTS) return
  const currentSlots = await getSlotAssignments()
  const oldOrder: (string | null)[] = SLOT_KEYS.map(key => currentSlots[key] || null)
  const newOrder: (string | null)[] = new Array(TOTAL_SLOTS).fill(null)

  const validArticles = new Set<string>()
  for (const articleId of oldOrder) {
    if (!articleId) continue
    try { const snap = await getDoc(doc(db, 'articles', articleId)); if (snap.exists()) validArticles.add(articleId) } catch {}
  }
  validArticles.add(newArticleId)

  let oldIdx = 0
  for (let newIdx = 0; newIdx < TOTAL_SLOTS; newIdx++) {
    if (newIdx === targetSlot) {
      newOrder[newIdx] = newArticleId
    } else {
      while (oldIdx < TOTAL_SLOTS) {
        const candidate = oldOrder[oldIdx]
        oldIdx++
        if (candidate && validArticles.has(candidate) && candidate !== newArticleId) {
          newOrder[newIdx] = candidate
          break
        }
      }
    }
  }

  const newSlots: Record<string, string> = {}
  for (let i = 0; i < TOTAL_SLOTS; i++) { if (newOrder[i]) newSlots[SLOT_KEYS[i]] = newOrder[i] }

  const oldIds: string[] = oldOrder.filter((id): id is string => !!id)
  const newIds: string[] = newOrder.filter((id): id is string => !!id)
  const newSet = new Set(newIds)
  const pushedOut = oldIds.filter(id => !newSet.has(id))

  await setDoc(doc(db, 'settings', 'slot-assignments'), newSlots)
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const id = newOrder[i]
    if (id) {
      try { await updateDoc(doc(db, 'articles', id), { isLead: i === 0, isSpecial: i !== 0, isSpecialOrder: i }) } catch {}
    }
  }
  for (const id of pushedOut) {
    try { await updateDoc(doc(db, 'articles', id), { isLead: false, isSpecial: false, isSpecialOrder: -1 }) } catch {}
  }
  console.log(`[SlotShift] Insert at slot ${targetSlot}, new:`, newSlots)
}

export async function reverseShiftSlots(removedSlot: number): Promise<void> {
  if (removedSlot < 0 || removedSlot >= TOTAL_SLOTS) return
  const currentSlots = await getSlotAssignments()
  const oldOrder: (string | null)[] = SLOT_KEYS.map(key => currentSlots[key] || null)
  const removedId = currentSlots[SLOT_KEYS[removedSlot]]
  const newOrder: (string | null)[] = new Array(TOTAL_SLOTS).fill(null)
  let newIdx = 0
  for (let oldIdx = 0; oldIdx < TOTAL_SLOTS; oldIdx++) {
    if (oldIdx === removedSlot) continue
    if (oldOrder[oldIdx] && oldOrder[oldIdx] !== removedId) { newOrder[newIdx] = oldOrder[oldIdx]; newIdx++ }
  }
  const newSlots: Record<string, string> = {}
  for (let i = 0; i < TOTAL_SLOTS; i++) { if (newOrder[i]) newSlots[SLOT_KEYS[i]] = newOrder[i] }
  await setDoc(doc(db, 'settings', 'slot-assignments'), newSlots)
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const id = newOrder[i]
    if (id) { try { await updateDoc(doc(db, 'articles', id), { isLead: i === 0, isSpecial: i !== 0, isSpecialOrder: i }) } catch {} }
  }
  if (removedId) { try { await updateDoc(doc(db, 'articles', removedId as string), { isLead: false, isSpecial: false, isSpecialOrder: -1 }) } catch {} }
  console.log(`[SlotShift] Remove at slot ${removedSlot}, new:`, newSlots)
}