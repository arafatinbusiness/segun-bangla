'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'author'
}

export function ProtectedRoute({ children, requiredRole = 'admin' }: ProtectedRouteProps) {
  const router = useRouter()
  const { loading, isAuthenticated, isAdmin, isAuthor } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  if (requiredRole === 'admin' && !isAdmin) {
    router.push('/')
    return null
  }

  if (requiredRole === 'author' && !isAuthor) {
    router.push('/')
    return null
  }

  return <>{children}</>
}
