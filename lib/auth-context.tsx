'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfile, updateUserLastLogin, type UserProfile } from '@/lib/services/auth/user-service'

interface AuthContextType {
  user: any | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isAuthor: boolean
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid)
        setProfile(userProfile)
        
        // Update last login
        if (userProfile) {
          await updateUserLastLogin(firebaseUser.uid)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isAuthor: profile?.role === 'author' || profile?.role === 'admin',
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
