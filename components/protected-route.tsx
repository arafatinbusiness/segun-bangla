'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'author'
}

export function ProtectedRoute({ children, requiredRole = 'admin' }: ProtectedRouteProps) {
  const router = useRouter()
  const { loading, isAuthenticated, isAdmin, isAuthor } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (requiredRole === 'admin' && !isAdmin) {
        router.push('/')
      } else if (requiredRole === 'author' && !isAuthor) {
        router.push('/')
      }
    }
  }, [loading, isAuthenticated, isAdmin, isAuthor, requiredRole, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole === 'admin' && !isAdmin) || (requiredRole === 'author' && !isAuthor)) {
    return null
  }

  return <>{children}</>
}
