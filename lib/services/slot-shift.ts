import { doc, getDoc, setDoc, updateDoc, writeBatch, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * GRID_POSITIONS mapping:
 * slot 0  = lead
 * slot 1  = sp1
 * slot 2  = sp2
 * slot 3  = sp3
 * slot 4  = sp4
 * slot 5  = extra1
 * slot 6  = extra2
 * slot 7  = sp5
 * slot 8  = sp6
 * slot 9  = sp7
 * slot 10 = sp8
 * slot 11 = (unused)
 */
const SLOT_KEYS = ['lead', 'sp1', 'sp2', 'sp3', 'sp4', 'extra1', 'extra2', 'sp5', 'sp6', 'sp7', 'sp8']

/**
 * Auto-shift slots when a new article is assigned to a special position.
 * 
 * Example: If new article is assigned to SP-1 (slot 1):
 *   - Old SP-1 → moves to SP-2 (slot 2)
 *   - Old SP-2 → moves to SP-3 (slot 3)
 *   - ...
 *   - Old SP-7 → moves to SP-8 (slot 10)
 *   - Old SP-8 → removed from grid (isSpecial=false, isSpecialOrder=-1)
 * 
 * @param targetSlot - The slot index (0-10) the new article is being assigned to
 * @param newArticleId - The docId of the article being assigned
 * @param oldArticleId - The previous article ID that was in this slot (if any), to avoid double-processing
 */
export async function autoShiftSlots(
  targetSlot: number,
  newArticleId: string,
  oldArticleId?: string | null
): Promise<void> {
  // Validate slot range
  if (targetSlot < 0 || targetSlot > 10) return

  // Get current slot assignments from Firestore
  const slotDoc = await getDoc(doc(db, 'settings', 'slot-assignments'))
  const currentSlots: Record<string, string> = slotDoc.exists() ? slotDoc.data() as Record<string, string> : {}

  // Build the new slot assignments
  const newSlots: Record<string, string> = {}

  // Step 1: Assign the new article to the target slot
  newSlots[SLOT_KEYS[targetSlot]] = newArticleId

  // Step 2: Shift existing articles down from targetSlot+1 onwards
  // For each slot from targetSlot+1 to the last slot (10/sp8):
  //   Take the article that was in the previous slot (targetSlot, targetSlot+1, ...)
  //   and move it to the current slot
  for (let shiftSlot = targetSlot + 1; shiftSlot <= 10; shiftSlot++) {
    const sourceSlotKey = SLOT_KEYS[shiftSlot - 1]  // the slot we're shifting FROM
    const targetSlotKey = SLOT_KEYS[shiftSlot]       // the slot we're shifting TO
    
    // The article to shift is whatever was in the source slot BEFORE this iteration
    // For the first iteration, source is the old article from targetSlot
    // For subsequent iterations, source is what we just moved
    const articleToShift = shiftSlot === targetSlot + 1
      ? currentSlots[sourceSlotKey]  // old article that was in targetSlot
      : currentSlots[sourceSlotKey]  // article that was in the previous slot
    
    if (articleToShift && articleToShift !== newArticleId) {
      newSlots[targetSlotKey] = articleToShift
    }
  }

  // Step 3: Collect all article IDs that need their flags updated
  // We need to:
  //   a) Clear flags for the article that gets pushed out (old SP-8 if exists)
  //   b) Update flags for all shifted articles
  //   c) Set flags for the new article

  const batch = writeBatch(db)

  // The article that gets pushed out (was in the last slot, now removed)
  const pushedOutArticleId = currentSlots[SLOT_KEYS[10]] // old sp8
  if (pushedOutArticleId && pushedOutArticleId !== newArticleId && !Object.values(newSlots).includes(pushedOutArticleId)) {
    const pushedOutRef = doc(db, 'articles', pushedOutArticleId)
    batch.update(pushedOutRef, {
      isLead: false,
      isSpecial: false,
      isSpecialOrder: -1,
    })
  }

  // Update flags for all articles that are now in slots
  for (let slotIdx = 0; slotIdx <= 10; slotIdx++) {
    const slotKey = SLOT_KEYS[slotIdx]
    const articleId = newSlots[slotKey]
    if (!articleId) continue

    const articleRef = doc(db, 'articles', articleId)
    batch.update(articleRef, {
      isLead: slotIdx === 0,
      isSpecial: slotIdx !== 0,
      isSpecialOrder: slotIdx,
    })
  }

  // Also handle the old article that was in the target slot (if different from new article)
  // This covers the case where the old article is NOT being shifted (e.g., if it was already
  // overwritten by a previous assignment)
  const oldTargetArticleId = currentSlots[SLOT_KEYS[targetSlot]]
  if (oldTargetArticleId && oldTargetArticleId !== newArticleId && !Object.values(newSlots).includes(oldTargetArticleId)) {
    const oldTargetRef = doc(db, 'articles', oldTargetArticleId)
    batch.update(oldTargetRef, {
      isLead: false,
      isSpecial: false,
      isSpecialOrder: -1,
    })
  }

  // Save the new slot assignments document
  batch.set(doc(db, 'settings', 'slot-assignments'), newSlots)

  // Commit all changes atomically
  await batch.commit()

  console.log(`[SlotShift] Auto-shift complete for slot ${targetSlot} (${SLOT_KEYS[targetSlot]})`)
  console.log('[SlotShift] New assignments:', newSlots)
}
