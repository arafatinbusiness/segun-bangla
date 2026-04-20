'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Header } from '@/components/header'

interface EmailPreferences {
  newArticles: boolean
  weeklyDigest: boolean
  adminNotifications: boolean
  categoryUpdates: { [key: string]: boolean }
}

export default function EmailPreferencesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [preferences, setPreferences] = useState<EmailPreferences>({
    newArticles: true,
    weeklyDigest: true,
    adminNotifications: false,
    categoryUpdates: {},
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage for demo
      // In production, save to Firestore
      localStorage.setItem(
        `emailPreferences_${user?.uid}`,
        JSON.stringify(preferences)
      )
      setMessage('পছন্দগুলি সংরক্ষণ করা হয়েছে')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('সংরক্ষণ ব্যর্থ হয়েছে')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header categories={[]} />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </main>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Header categories={[]} />
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ইমেইল পছন্দগুলি
              </h1>
              <p className="text-muted-foreground">
                আপনি কী ধরনের বিজ্ঞপ্তি পেতে চান তা নির্বাচন করুন
              </p>
            </div>

            {message && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-sm">
                {message}
              </div>
            )}

            <div className="space-y-6">
              {/* General Notifications */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  সাধারণ বিজ্ঞপ্তি
                </h2>

                <FieldGroup>
                  <Field className="flex items-center justify-between">
                    <FieldLabel className="mb-0">
                      নতুন নিবন্ধের জন্য বিজ্ঞপ্তি
                    </FieldLabel>
                    <Switch
                      checked={preferences.newArticles}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          newArticles: checked,
                        })
                      }
                    />
                  </Field>
                </FieldGroup>

                <p className="text-sm text-muted-foreground mt-2">
                  প্রধান নতুন নিবন্ধ প্রকাশিত হলে বিজ্ঞপ্তি পান
                </p>
              </div>

              {/* Weekly Digest */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  সাপ্তাহিক ডাইজেস্ট
                </h2>

                <FieldGroup>
                  <Field className="flex items-center justify-between">
                    <FieldLabel className="mb-0">
                      সাপ্তাহিক সারসংক্ষেপ ইমেইল
                    </FieldLabel>
                    <Switch
                      checked={preferences.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          weeklyDigest: checked,
                        })
                      }
                    />
                  </Field>
                </FieldGroup>

                <p className="text-sm text-muted-foreground mt-2">
                  প্রতি সোমবার সপ্তাহের শীর্ষ গল্প পান
                </p>
              </div>

              {/* Admin Notifications */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  নিরাপত্তা এবং অ্যাকাউন্ট
                </h2>

                <FieldGroup>
                  <Field className="flex items-center justify-between">
                    <FieldLabel className="mb-0">
                      গুরুত্বপূর্ণ নিরাপত্তা সতর্কতা
                    </FieldLabel>
                    <Switch
                      checked={true}
                      disabled
                    />
                  </Field>
                </FieldGroup>

                <p className="text-sm text-muted-foreground mt-2">
                  সর্বদা সক্রিয় - আপনার অ্যাকাউন্টের সুরক্ষার জন্য প্রয়োজনীয়
                </p>
              </div>

              {/* Marketing */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  বিপণন এবং প্রচার
                </h2>

                <FieldGroup>
                  <Field className="flex items-center justify-between">
                    <FieldLabel className="mb-0">
                      বিশেষ অফার এবং সংবাদ
                    </FieldLabel>
                    <Switch
                      checked={preferences.adminNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          adminNotifications: checked,
                        })
                      }
                    />
                  </Field>
                </FieldGroup>

                <p className="text-sm text-muted-foreground mt-2">
                  নতুন বৈশিষ্ট্য এবং বিশেষ অফার সম্পর্কে জানুন
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'সংরক্ষণ করছি...' : 'পছন্দ সংরক্ষণ করুন'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                বাতিল করুন
              </Button>
            </div>
          </Card>

          {/* Help Section */}
          <Card className="mt-8 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              আপনার ইমেইলের গোপনীয়তা
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                • আমরা কখনও আপনার ইমেইল তৃতীয় পক্ষের সাথে শেয়ার করি না
              </li>
              <li>
                • যেকোনো সময় আপনার পছন্দগুলি আপডেট করুন
              </li>
              <li>
                • প্রতিটি ইমেইলের নীচে একটি আনসাবস্ক্রাইব লিঙ্ক রয়েছে
              </li>
              <li>
                • আপনি সর্বদা আপনার অ্যাকাউন্ট মুছে ফেলতে পারেন
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </>
  )
}
