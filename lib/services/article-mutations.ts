import { collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import type { Article, EditHistoryEntry } from '../types'

const ARTICLES_COLLECTION = 'articles'

function createEditEntry(
  editorUid: string,
  editorName: string,
  editorEmail: string,
  action: EditHistoryEntry['action']
): EditHistoryEntry {
  return {
    editedBy: editorUid,
    editorName,
    editorEmail,
    timestamp: Date.now(),
    action,
  }
}

export async function deleteArticles(articleIds: string[]): Promise<boolean> {
  try {
    const { deleteDoc, doc } = await import('firebase/firestore')
    const promises = articleIds.map((id) => deleteDoc(doc(db, ARTICLES_COLLECTION, id)))
    await Promise.all(promises)
    return true
  } catch (error) {
    console.error('[v0] Error deleting articles:', error)
    return false
  }
}

export async function createArticle(
  articleData: Partial<Article>,
  editor?: { uid: string; name: string; email: string }
): Promise<string | null> {
  try {
    const now = Date.now()
    const editEntry = editor
      ? [createEditEntry(editor.uid, editor.name, editor.email, 'created')]
      : []

    const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
      ...articleData,
      status: 'published',
      publishedAt: now,
      updatedAt: now,
      viewCount: 0,
      isFeatured: false,
      editHistory: editEntry,
    })

    console.log('[v0] Article created successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('[v0] Error creating article:', error)
    throw error
  }
}

export async function updateArticle(
  articleId: string,
  articleData: Partial<Article>,
  editor?: { uid: string; name: string; email: string }
): Promise<boolean> {
  try {
    const now = Date.now()
    const updatePayload: Record<string, any> = {
      ...articleData,
      updatedAt: now,
    }

    // Add edit history entry if editor info is provided
    if (editor) {
      const action = articleData.status === 'published' ? 'published' : 'updated'
      updatePayload.editHistory = arrayUnion(
        createEditEntry(editor.uid, editor.name, editor.email, action)
      )
    }

    const docRef = doc(db, ARTICLES_COLLECTION, articleId)
    await updateDoc(docRef, updatePayload)
    console.log('[v0] Article updated successfully:', articleId)
    return true
  } catch (error) {
    console.error('[v0] Error updating article:', error)
    throw error
  }
}

export async function deleteArticle(articleId: string): Promise<boolean> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId)
    await deleteDoc(docRef)
    console.log('[v0] Article deleted successfully:', articleId)
    return true
  } catch (error) {
    console.error('[v0] Error deleting article:', error)
    throw error
  }
}
