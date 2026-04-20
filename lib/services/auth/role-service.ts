import { getUserProfile } from './user-service'
import type { UserProfile } from './user-service'

export type UserRole = 'user' | 'author' | 'admin'

export async function checkUserRole(uid: string): Promise<UserRole | null> {
  try {
    const profile = await getUserProfile(uid)
    return profile?.role || null
  } catch (error) {
    console.error('[v0] Error checking user role:', error)
    return null
  }
}

export async function isAdmin(uid: string): Promise<boolean> {
  const role = await checkUserRole(uid)
  return role === 'admin'
}

export async function isAuthor(uid: string): Promise<boolean> {
  const role = await checkUserRole(uid)
  return role === 'author' || role === 'admin'
}

export function canAccessAdminPanel(profile: UserProfile | null): boolean {
  return profile?.role === 'admin'
}

export function canEditArticle(profile: UserProfile | null): boolean {
  return profile?.role === 'author' || profile?.role === 'admin'
}

export function canManageUsers(profile: UserProfile | null): boolean {
  return profile?.role === 'admin'
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    user: 'ব্যবহারকারী',
    author: 'লেখক',
    admin: 'প্রশাসক',
  }
  return labels[role]
}
