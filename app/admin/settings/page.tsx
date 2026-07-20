import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage site settings and configuration</p>
      </div>

      {/* Site Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Site Information</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName" className="text-foreground">Site Name</Label>
            <Input
              id="siteName"
              defaultValue="segun-bangla"
              className="w-full"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl" className="text-foreground">Site URL</Label>
            <Input
              id="siteUrl"
              type="url"
              defaultValue="https://example.com"
              className="w-full"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription" className="text-foreground">Site Description</Label>
            <Textarea
              id="siteDescription"
              defaultValue="Latest news from Bangladesh and around the world."
              rows={4}
              className="w-full"
              disabled
            />
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" disabled>
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Email Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Email Settings</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="emailFrom" className="text-foreground">Send From Email</Label>
            <Input
              id="emailFrom"
              type="email"
              placeholder="noreply@example.com"
              className="w-full"
              disabled
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Email settings coming soon
          </p>
        </div>
      </Card>

      {/* API Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">API Settings</h2>
        <p className="text-sm text-muted-foreground">
          API settings and keys coming soon
        </p>
      </Card>
    </div>
  )
}

export default SettingsPage