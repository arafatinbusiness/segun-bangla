'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser, isAdmin } from '@/lib/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await loginUser(email, password)
      
      if (!result) {
        throw new Error('লগইন ব্যর্থ হয়েছে')
      }

      // Check if user has admin role
      const userIsAdmin = await isAdmin(result.uid)
      
      if (userIsAdmin) {
        router.push('/admin')
      } else {
        setError('আপনার অ্যাডমিন অ্যাক্সেস নেই')
        return
      }
    } catch (err: any) {
      console.error('[v0] Login error:', err)
      setError(err.message || 'লগইন ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">সেগুন বাংলা</h1>
          <p className="text-muted-foreground">প্রশাসক পোর্টালে স্বাগতম</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>ইমেইল ঠিকানা</FieldLabel>
              <Input
                type="email"
                placeholder="আপনার ইমেইল"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>পাসওয়ার্ড</FieldLabel>
              <Input
                type="password"
                placeholder="আপনার পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'প্রবেশ করছি...' : 'প্রবেশ করুন'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          অ্যাকাউন্ট নেই?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            এখানে নিবন্ধন করুন
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            হোম পেজে ফিরুন
          </Link>
        </div>
      </Card>
    </div>
  )
}
