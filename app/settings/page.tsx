"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { currentUser } from "@/lib/data"
import { toast } from "sonner"

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = React.useState(true)
  const [smsNotif, setSmsNotif] = React.useState(false)
  const [pushNotif, setPushNotif] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const handleSave = React.useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Settings saved", { description: "Your preferences have been updated." })
    }, 800)
  }, [])

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Settings"
      description="Manage your account preferences"
      user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}
    >
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={currentUser.name} aria-label="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={currentUser.email} aria-label="Email address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={currentUser.phone} aria-label="Phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue={currentUser.city} aria-label="City" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif" className="text-sm">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch id="email-notif" checked={emailNotif} onCheckedChange={setEmailNotif} aria-label="Toggle email notifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notif" className="text-sm">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
              </div>
              <Switch id="sms-notif" checked={smsNotif} onCheckedChange={setSmsNotif} aria-label="Toggle SMS notifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notif" className="text-sm">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive push notifications in browser</p>
              </div>
              <Switch id="push-notif" checked={pushNotif} onCheckedChange={setPushNotif} aria-label="Toggle push notifications" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} aria-label="Save settings">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
}
