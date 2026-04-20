import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function useIsAdmin() {
  const { profile } = useAuth()
  return profile?.role === 'admin'
}

export function useIsAuthor() {
  const { profile } = useAuth()
  return profile?.role === 'author' || profile?.role === 'admin'
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}
