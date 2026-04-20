import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">৪০৪</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          পৃষ্ঠা পাওয়া যায়নি
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা স্থানান্তরিত হয়েছে।
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild>
            <Link href="/">হোমে ফিরে যান</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">অনুসন্ধান করুন</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
