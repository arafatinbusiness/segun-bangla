'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { logoutUser } from '@/lib/services/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/header'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push('/')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
          </div>
        </main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">লগইন প্রয়োজন</h1>
            <Button onClick={() => router.push('/login')}>
              লগইন করুন
            </Button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header categories={[]} />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">আমার প্রোফাইল</h1>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  নাম
                </label>
                <p className="text-lg text-foreground">
                  {profile?.displayName || 'নির্ধারিত নয়'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  ইমেইল
                </label>
                <p className="text-lg text-foreground">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  ভূমিকা
                </label>
                <p className="text-lg text-foreground capitalize">
                  {profile?.role === 'admin' && 'প্রশাসক'}
                  {profile?.role === 'author' && 'লেখক'}
                  {profile?.role === 'user' && 'ব্যবহারকারী'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  অ্যাকাউন্ট তৈরি
                </label>
                <p className="text-lg text-foreground">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('bn-BD') : 'অজানা'}
                </p>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  আপনার অ্যাকাউন্ট পরিচালনা করুন
                </p>
                {profile?.role === 'admin' && (
                  <Button
                    onClick={() => router.push('/admin')}
                    className="mr-4"
                  >
                    প্রশাসক প্যানেল
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                >
                  লগ আউট করুন
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
