import { Card } from '@/components/ui/card'

function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">ব্যবহারকারী পরিচালনা</h1>
        <p className="text-muted-foreground mt-2">সাইট ব্যবহারকারী এবং অনুমতি পরিচালনা করুন</p>
      </div>

      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">
          ব্যবহারকারী পরিচালনা শীঘ্রই আসছে
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          এই বৈশিষ্ট্য অনুমোদন সিস্টেম সহ শীঘ্রই উপলব্ধ থাকবে
        </p>
      </Card>
    </div>
  )
}

export default UsersPage
