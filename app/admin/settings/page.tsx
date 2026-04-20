import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">সেটিংস</h1>
        <p className="text-muted-foreground mt-2">সাইটের সেটিংস এবং কনফিগারেশন পরিচালনা করুন</p>
      </div>

      {/* Site Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">সাইটের তথ্য</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName" className="text-foreground">সাইটের নাম</Label>
            <Input
              id="siteName"
              defaultValue="সেগুন বাংলা"
              className="w-full"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl" className="text-foreground">সাইটের URL</Label>
            <Input
              id="siteUrl"
              type="url"
              defaultValue="https://example.com"
              className="w-full"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription" className="text-foreground">সাইটের বর্ণনা</Label>
            <Textarea
              id="siteDescription"
              defaultValue="সেগুন বাংলায় পান সর্বশেষ বাংলাদেশ এবং আন্তর্জাতিক সংবাদ।"
              rows={4}
              className="w-full"
              disabled
            />
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled>
            পরিবর্তন সংরক্ষণ করুন
          </Button>
        </div>
      </Card>

      {/* Email Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">ইমেল সেটিংস</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emailFrom" className="text-foreground">ইমেল পাঠান যোগাযোগ</Label>
            <Input
              id="emailFrom"
              type="email"
              placeholder="noreply@example.com"
              className="w-full"
              disabled
            />
          </div>

          <p className="text-sm text-muted-foreground">
            ইমেল সেটিংস শীঘ্রই উপলব্ধ হবে
          </p>
        </div>
      </Card>

      {/* API Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">API সেটিংস</h2>
        <p className="text-sm text-muted-foreground">
          API সেটিংস এবং কী শীঘ্রই উপলব্ধ হবে
        </p>
      </Card>
    </div>
  )
}

export default SettingsPage
