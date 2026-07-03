import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Slot key mapping: isSpecialOrder → slot key name
 */
export function getSlotKey(order: number): string | null {
  return order === 0 ? 'lead' :
    order === 1 ? 'sp1' :
    order === 2 ? 'sp2' :
    order === 3 ? 'sp3' :
    order === 4 ? 'sp4' :
    order === 5 ? 'extra1' :
    order === 6 ? 'extra2' :
    order === 7 ? 'sp5' :
    order === 8 ? 'sp6' :
    order === 9 ? 'sp7' :
    order === 10 ? 'sp8' : null
}

/**
 * Get slot order from slot key
 */
export function getSlotOrder(slotKey: string): number {
  const map: Record<string, number> = {
    lead: 0, sp1: 1, sp2: 2, sp3: 3, sp4: 4,
    extra1: 5, extra2: 6, sp5: 7, sp6: 8, sp7: 9, sp8: 10,
  }
  return map[slotKey] ?? -1
}

/**
 * Cascade articles down when a new article is placed in a slot.
 * 
 * Example: If targetSlot = 1 (SP-1):
 *   - New article → SP-1
 *   - Old SP-1 → SP-2
 *   - Old SP-2 → SP-3
 *   - ...
 *   - Old SP-8 → removed (cleared of special flags)
 * 
 * @param targetSlot - The isSpecialOrder the new article wants (0-10)
 * @param newArticleId - The docId of the article being placed
 * @param previousSlot - The previous slot of this article (if editing), to avoid cascading when slot hasn't changed
 * @returns true if cascade was applied
 */
export async function cascadeSlotAssignment(
  targetSlot: number,
  newArticleId: string,
  previousSlot?: number
): Promise<boolean> {
  // If the article already occupies this slot, no cascade needed
  if (previousSlot === targetSlot) {
    return false
  }

  // Read current slot assignments
  const slotDoc = await getDoc(doc(db, 'settings', 'slot-assignments'))
  const currentSlots: Record<string, string> = slotDoc.exists() ? slotDoc.data() as Record<string, string> : {}

  // Build the new slot assignments
  const newSlots: Record<string, string> = {}
  const batch = writeBatch(db)

  // The target slot key
  const targetSlotKey = getSlotKey(targetSlot)
  if (!targetSlotKey) return false

  // If the article was previously in a different slot, remove it from there
  if (previousSlot !== undefined && previousSlot >= 0) {
    const prevSlotKey = getSlotKey(previousSlot)
    if (prevSlotKey && currentSlots[prevSlotKey] === newArticleId) {
      delete currentSlots[prevSlotKey]
    }
  }

  // Cascade: shift articles from targetSlot down to slot 10
  // Collect the chain of article IDs that need to shift
  const cascadeChain: { fromSlot: number; toSlot: number; articleId: string | undefined }[] = []

  for (let shiftFrom = targetSlot; shiftFrom <= 10; shiftFrom++) {
    const fromKey = getSlotKey(shiftFrom)
    if (!fromKey) continue

    const articleId = currentSlots[fromKey]
    const toSlot = shiftFrom + 1

    cascadeChain.push({
      fromSlot: shiftFrom,
      toSlot: toSlot > 10 ? -1 : toSlot, // -1 means remove
      articleId,
    })
  }

  // Apply the cascade
  for (const item of cascadeChain) {
    if (item.toSlot === -1) {
      // This article gets pushed out of the grid entirely
      if (item.articleId && item.articleId !== newArticleId) {
        const articleRef = doc(db, 'articles', item.articleId)
        batch.update(articleRef, {
          isLead: false,
          isSpecial: false,
          isSpecialOrder: -1,
        })
      }
    } else {
      // Shift this article to the next slot
      const toKey = getSlotKey(item.toSlot)
      if (toKey && item.articleId && item.articleId !== newArticleId) {
        newSlots[toKey] = item.articleId
        const articleRef = doc(db, 'articles', item.articleId)
        batch.update(articleRef, {
          isLead: item.toSlot === 0,
          isSpecial: item.toSlot !== 0,
          isSpecialOrder: item.toSlot,
        })
      }
    }
  }

  // Place the new article in the target slot
  newSlots[targetSlotKey] = newArticleId
  const newArticleRef = doc(db, 'articles', newArticleId)
  batch.update(newArticleRef, {
    isLead: targetSlot === 0,
    isSpecial: targetSlot !== 0,
    isSpecialOrder: targetSlot,
  })

  // Preserve slots that are before the target (not affected by cascade)
  for (let slot = 0; slot < targetSlot; slot++) {
    const key = getSlotKey(slot)
    if (key && currentSlots[key]) {
      newSlots[key] = currentSlots[key]
    }
  }

  // Save the updated slot-assignments document
  batch.set(doc(db, 'settings', 'slot-assignments'), newSlots)

  await batch.commit()
  return true
}
