"use client"

import * as React from "react"
import { Moon, Sun, Globe, Bell, Lock, Eye, Palette, User, Shield, Monitor, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { currentUser } from "@/lib/data"
import { useTheme } from "next-themes"

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "mr", name: "Marathi (मराठी)" },
]

export default function SettingsPage() {
  const { setTheme, resolvedTheme } = useTheme()
  const [settings, setSettings] = React.useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    complaintSubmitted: true,
    complaintApproved: true,
    complaintResolved: true,
    coinsAwarded: true,
    weeklyDigest: true,
    marketingEmails: false,
    publicProfile: true,
    showOnLeaderboard: true,
    shareLocation: true,
    highContrastMode: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    largeText: false,
    language: "en",
    twoFactorEnabled: false,
    sessionTimeout: "30",
  })

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    toast.success("Setting updated")
  }

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Settings"
      description="Customize your CitySolver experience"
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Theme</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-1">
                <Button
                  variant={resolvedTheme === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="gap-2"
                >
                  <Sun className="size-4" />
                  Light
                </Button>
                <Button
                  variant={resolvedTheme === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="gap-2"
                >
                  <Moon className="size-4" />
                  Dark
                </Button>
                <Button
                  variant={resolvedTheme === "system" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="gap-2"
                >
                  <Monitor className="size-4" />
                  System
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
              </div>
              <Switch
                checked={settings.highContrastMode}
                onCheckedChange={(checked) => updateSetting("highContrastMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Language & Region
            </CardTitle>
            <CardDescription>Set your preferred language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Language</Label>
                <p className="text-sm text-muted-foreground">Choose your display language</p>
              </div>
              <Select value={settings.language} onValueChange={(v) => updateSetting("language", v ?? "en")}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Delivery Channels</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive real-time alerts in the app</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive critical updates via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Types</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Complaint Submitted</Label>
                    <p className="text-xs text-muted-foreground">When your complaint is received</p>
                  </div>
                  <Switch
                    checked={settings.complaintSubmitted}
                    onCheckedChange={(checked) => updateSetting("complaintSubmitted", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Complaint Approved</Label>
                    <p className="text-xs text-muted-foreground">When your complaint is approved</p>
                  </div>
                  <Switch
                    checked={settings.complaintApproved}
                    onCheckedChange={(checked) => updateSetting("complaintApproved", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Complaint Resolved</Label>
                    <p className="text-xs text-muted-foreground">When your complaint is resolved</p>
                  </div>
                  <Switch
                    checked={settings.complaintResolved}
                    onCheckedChange={(checked) => updateSetting("complaintResolved", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Coins Awarded</Label>
                    <p className="text-xs text-muted-foreground">When you earn reward coins</p>
                  </div>
                  <Switch
                    checked={settings.coinsAwarded}
                    onCheckedChange={(checked) => updateSetting("coinsAwarded", checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Email Preferences</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-xs text-muted-foreground">Summary of your weekly activity</p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => updateSetting("weeklyDigest", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-xs text-muted-foreground">Updates about new features</p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-5" />
              Privacy
            </CardTitle>
            <CardDescription>Manage your privacy preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Public Profile</Label>
                <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={(checked) => updateSetting("publicProfile", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show on Leaderboard</Label>
                <p className="text-sm text-muted-foreground">Display your name on public leaderboards</p>
              </div>
              <Switch
                checked={settings.showOnLeaderboard}
                onCheckedChange={(checked) => updateSetting("showOnLeaderboard", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Share Location</Label>
                <p className="text-sm text-muted-foreground">Include location with your reports</p>
              </div>
              <Switch
                checked={settings.shareLocation}
                onCheckedChange={(checked) => updateSetting("shareLocation", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-5" />
              Accessibility
            </CardTitle>
            <CardDescription>Accessibility and assistance options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Screen Reader Optimized</Label>
                <p className="text-sm text-muted-foreground">Enhanced support for screen readers</p>
              </div>
              <Switch
                checked={settings.screenReaderOptimized}
                onCheckedChange={(checked) => updateSetting("screenReaderOptimized", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Keyboard Navigation</Label>
                <p className="text-sm text-muted-foreground">Enhanced keyboard shortcuts</p>
              </div>
              <Switch
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Large Text</Label>
                <p className="text-sm text-muted-foreground">Increase default text size</p>
              </div>
              <Switch
                checked={settings.largeText}
                onCheckedChange={(checked) => updateSetting("largeText", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5" />
              Account Security
            </CardTitle>
            <CardDescription>Protect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => updateSetting("twoFactorEnabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Select value={settings.sessionTimeout} onValueChange={(v) => updateSetting("sessionTimeout", v ?? "30")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 mins</SelectItem>
                  <SelectItem value="30">30 mins</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
