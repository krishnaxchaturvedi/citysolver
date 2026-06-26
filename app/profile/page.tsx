"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { User, Mail, Phone, MapPin, Camera, Save, CreditCard as Edit, Trophy, Coins, FileText, CircleCheck as CheckCircle2, Clock, Shield, Award } from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { currentUser, complaints, rewardBadges, achievements } from "@/lib/data"

const tierColors = {
  bronze: "bg-amber-700/10 text-amber-700 border-amber-700/30",
  silver: "bg-gray-400/10 text-gray-600 border-gray-400/30",
  gold: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  platinum: "bg-purple-500/10 text-purple-700 border-purple-500/30",
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    city: currentUser.city,
    state: currentUser.state,
  })
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
    toast.success("Profile updated successfully")
  }

  const resolvedCount = complaints.filter(c => c.citizen === currentUser.name && c.status === "Resolved").length
  const pendingCount = complaints.filter(c => c.citizen === currentUser.name && c.status !== "Resolved" && c.status !== "Rejected").length
  const totalComplaints = complaints.filter(c => c.citizen === currentUser.name).length
  const resolutionRate = Math.round((resolvedCount / totalComplaints) * 100) || 0

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Profile"
      description="Manage your account and view your impact"
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <div className="relative size-28 overflow-hidden rounded-full border-4 border-background shadow-lg">
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="size-4" />
                </Button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                  <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                  <Badge variant="secondary">{currentUser.rank}</Badge>
                </div>
                <p className="text-muted-foreground">{currentUser.email}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {currentUser.city}, {currentUser.state}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-4" />
                    {currentUser.phone}
                  </span>
                </div>
              </div>

              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Save className="mr-2 size-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 size-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentUser.totalReports}</p>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-success/10">
                    <CheckCircle2 className="size-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentUser.resolved}</p>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-warning/10">
                    <Clock className="size-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentUser.pending}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-4 py-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-warning/10">
                    <Coins className="size-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentUser.coinBalance.toLocaleString("en-IN")}</p>
                    <p className="text-sm text-muted-foreground">Coins</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="size-5" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Resolution Rate</span>
                      <span className="font-medium">{resolutionRate}%</span>
                    </div>
                    <Progress value={resolutionRate} className="h-2" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold">{currentUser.coinsEarned.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">Coins Earned</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{currentUser.coinsRedeemed.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">Coins Redeemed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="size-5" />
                    Badges Unlocked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {rewardBadges.filter(b => b.unlocked).map(badge => (
                      <div key={badge.name} className="flex items-center gap-3">
                        <div className={cn(
                          "flex size-10 items-center justify-center rounded-full border-2",
                          tierColors[badge.tier]
                        )}>
                          <Shield className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{badge.tier} Tier</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaints
                    .filter(c => c.citizen === currentUser.name)
                    .slice(0, 5)
                    .map(complaint => (
                      <div key={complaint.id} className="flex items-center gap-4">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={complaint.image}
                            alt={complaint.category}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{complaint.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {complaint.date} · {complaint.category}
                          </p>
                        </div>
                        <Badge variant={complaint.status === "Resolved" ? "default" : "secondary"}>
                          {complaint.status}
                        </Badge>
                        <Button variant="outline" size="sm" render={<Link href={`/tracking/${complaint.id}`} />}>
                          View
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="email">Email Address</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="city">City</FieldLabel>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="state">State</FieldLabel>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </Field>
                    </div>
                  </FieldGroup>

                  {isEditing && (
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
                <CardDescription>Track your journey as a civic contributor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {achievements.map((achievement) => {
                  const isComplete = achievement.progress >= achievement.total
                  const percentage = Math.min((achievement.progress / achievement.total) * 100, 100)

                  return (
                    <div key={achievement.name} className="flex gap-4">
                      <div className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl",
                        isComplete ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {isComplete ? <CheckCircle2 className="size-6" /> : <Award className="size-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <Badge variant={isComplete ? "default" : "secondary"}>
                            {achievement.progress}/{achievement.total}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <Progress value={percentage} className="mt-2 h-2" />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
