'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/lib/services/auth'
import { createUserProfile } from '@/lib/services/auth/user-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

export default function RegisterPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না')
      return
    }

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
      return
    }

    setLoading(true)

    try {
      const result = await registerUser({ email, password, displayName })
      
      if (result) {
        // Create user profile
        await createUserProfile(result.uid, email, displayName)
      }
      
      router.push('/login')
    } catch (err: any) {
      console.error('[v0] Registration error:', err)
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হচ্ছে'
        : err.message || 'নিবন্ধন ব্যর্থ হয়েছে'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-muted-foreground">সেগুন বাংলা পোর্টালে যোগ দিন</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel>নাম</FieldLabel>
              <Input
                type="text"
                placeholder="আপনার সম্পূর্ণ নাম"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            </Field>
          </FieldGroup>

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
                placeholder="কমপক্ষে ৬ অক্ষর"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>পাসওয়ার্ড নিশ্চিত করুন</FieldLabel>
              <Input
                type="password"
                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'নিবন্ধন করছি...' : 'অ্যাকাউন্ট তৈরি করুন'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            লগইন করুন
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
