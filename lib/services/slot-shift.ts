import { doc, getDoc, writeBatch, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore'
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
 */
export async function autoShiftSlots(
  targetSlot: number,
  newArticleId: string,
): Promise<void> {
  // Validate slot range
  if (targetSlot < 0 || targetSlot > 10) return

  // -------------------------------------------------------
  // Build current slot map — try slot-assignments doc first,
  // then fall back to querying articles with isSpecialOrder.
  // -------------------------------------------------------
  const currentSlots: Record<string, string> = {}

  // Try 1: slot-assignments document (simple getDoc, no index needed)
  try {
    const slotDoc = await getDoc(doc(db, 'settings', 'slot-assignments'))
    if (slotDoc.exists()) {
      const data = slotDoc.data() as Record<string, string>
      Object.assign(currentSlots, data)
    }
  } catch (e) {
    console.warn('[SlotShift] Failed to read slot-assignments doc:', e)
  }

  // Try 2: If slot-assignments is empty, query articles directly
  // (requires composite index on isSpecialOrder + status)
  if (Object.keys(currentSlots).length === 0) {
    try {
      const q = query(
        collection(db, 'articles'),
        where('isSpecialOrder', '>=', 0),
        where('isSpecialOrder', '<=', 10),
        where('status', '==', 'published')
      )
      const snapshot = await getDocs(q)
      snapshot.docs.forEach((docSnap) => {
        if (docSnap.id === newArticleId) return
        const data = docSnap.data()
        const order = data.isSpecialOrder
        if (typeof order === 'number' && order >= 0 && order <= 10) {
          currentSlots[SLOT_KEYS[order]] = docSnap.id
        }
      })
    } catch (e) {
      console.warn('[SlotShift] Query fallback also failed:', e)
    }
  }

  // If we still have no slots, nothing to shift
  if (Object.keys(currentSlots).length === 0) {
    console.log('[SlotShift] No existing slots found, nothing to shift')
    return
  }

  // Build the new slot assignments
  const newSlots: Record<string, string> = {}

  // Step 1: Assign the new article to the target slot
  newSlots[SLOT_KEYS[targetSlot]] = newArticleId

  // Step 2: Shift existing articles down from targetSlot+1 onwards
  for (let shiftSlot = targetSlot + 1; shiftSlot <= 10; shiftSlot++) {
    const sourceSlotKey = SLOT_KEYS[shiftSlot - 1]
    const targetSlotKey = SLOT_KEYS[shiftSlot]
    const articleToShift = currentSlots[sourceSlotKey]
    if (articleToShift && articleToShift !== newArticleId) {
      newSlots[targetSlotKey] = articleToShift
    }
  }

  // Step 3: Verify all referenced articles exist before updating
  // Collect all article IDs that need their flags updated
  const articlesToUpdate = new Set<string>()
  
  for (const articleId of Object.values(newSlots)) {
    if (articleId) articlesToUpdate.add(articleId)
  }
  
  const pushedOutArticleId = currentSlots[SLOT_KEYS[10]]
  if (pushedOutArticleId && pushedOutArticleId !== newArticleId) {
    articlesToUpdate.add(pushedOutArticleId)
  }
  
  const oldTargetArticleId = currentSlots[SLOT_KEYS[targetSlot]]
  if (oldTargetArticleId && oldTargetArticleId !== newArticleId) {
    articlesToUpdate.add(oldTargetArticleId)
  }

  // Verify each article exists — skip deleted ones
  const validArticleIds = new Set<string>()
  for (const articleId of articlesToUpdate) {
    try {
      const articleDoc = await getDoc(doc(db, 'articles', articleId))
      if (articleDoc.exists()) {
        validArticleIds.add(articleId)
      } else {
        console.warn(`[SlotShift] Article ${articleId} no longer exists, skipping`)
      }
    } catch (e) {
      console.warn(`[SlotShift] Failed to verify article ${articleId}, skipping:`, e)
    }
  }

  // Step 4: Update Firestore using individual updates (not batch)
  // so that if one fails, others still succeed
  for (const articleId of validArticleIds) {
    try {
      const articleRef = doc(db, 'articles', articleId)
      let foundSlot = -1
      for (let slotIdx = 0; slotIdx <= 10; slotIdx++) {
        if (newSlots[SLOT_KEYS[slotIdx]] === articleId) {
          foundSlot = slotIdx
          break
        }
      }
      if (foundSlot >= 0) {
        await updateDoc(articleRef, {
          isLead: foundSlot === 0,
          isSpecial: foundSlot !== 0,
          isSpecialOrder: foundSlot,
        })
      } else {
        await updateDoc(articleRef, {
          isLead: false,
          isSpecial: false,
          isSpecialOrder: -1,
        })
      }
    } catch (e) {
      console.warn(`[SlotShift] Failed to update article ${articleId}:`, e)
    }
  }

  // Save the new slot assignments document
  try {
    await setDoc(doc(db, 'settings', 'slot-assignments'), newSlots)
  } catch (e) {
    console.warn('[SlotShift] Failed to save slot-assignments:', e)
  }

  console.log(`[SlotShift] Auto-shift complete for slot ${targetSlot} (${SLOT_KEYS[targetSlot]})`)
  console.log('[SlotShift] New assignments:', newSlots)
}
