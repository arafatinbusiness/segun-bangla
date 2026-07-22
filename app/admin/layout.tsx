'use client'

import { AdminSidebar } from '@/components/admin/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import { Toaster } from '@/components/ui/sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </ProtectedRoute>
  )
}
