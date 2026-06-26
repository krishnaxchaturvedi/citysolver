"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  Building2,
  Coins,
  Share2,
  MessageCircle,
  Printer,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badges"
import { PriorityBadge } from "@/components/status-badges"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { currentUser, complaints, timelineSteps, type Complaint, type Status } from "@/lib/data"

interface TimelineEvent {
  status: Status
  date: string
  time: string
  officer?: string
  comments?: string
  completed: boolean
}

function generateTimeline(complaint: Complaint): TimelineEvent[] {
  const statusIndex = timelineSteps.indexOf(complaint.status)
  const completedStatuses = statusIndex >= 0 ? timelineSteps.slice(0, statusIndex + 1) : []

  const timeStamps: Record<Status, { date: string; time: string; officer?: string; comments?: string }> = {
    "Submitted": {
      date: complaint.date,
      time: "10:30 AM",
      comments: "Issue reported successfully"
    },
    "Under Review": {
      date: complaint.status !== "Submitted" ? `${complaint.date} +1` : "",
      time: "02:15 PM",
      officer: "Ward Officer S. Kumar",
      comments: "Complaint is being verified by the ward office"
    },
    "Approved": {
      date: ["Under Review", "Submitted"].includes(complaint.status) ? "" : `${complaint.date} +2`,
      time: "09:00 AM",
      officer: "Ward Officer S. Kumar",
      comments: "Complaint verified and approved for resolution"
    },
    "Assigned": {
      date: ["Under Review", "Submitted", "Approved"].includes(complaint.status) ? "" : `${complaint.date} +3`,
      time: "11:30 AM",
      officer: complaint.officer || "Field Officer",
      comments: "Assigned to department for action"
    },
    "In Progress": {
      date: ["Under Review", "Submitted", "Approved", "Assigned"].includes(complaint.status) ? "" : `${complaint.date} +4`,
      time: "08:00 AM",
      officer: complaint.officer || "Field Officer",
      comments: "Work has commenced on site"
    },
    "Resolved": {
      date: complaint.status === "Resolved" ? `${complaint.date} +6` : "",
      time: "03:45 PM",
      officer: complaint.officer || "Field Officer",
      comments: "Issue successfully resolved. Photos uploaded for verification."
    },
    "Rejected": {
      date: "",
      time: "",
      officer: "Ward Officer",
      comments: "Complaint rejected due to insufficient information"
    }
  }

  return timelineSteps.map(status => ({
    status,
    ...timeStamps[status],
    completed: completedStatuses.includes(status)
  }))
}

function getProgressPercentage(status: Status): number {
  const index = timelineSteps.indexOf(status)
  if (index === -1) return 0
  return Math.round(((index + 1) / timelineSteps.length) * 100)
}

export default function TrackComplaintPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const complaint = complaints.find(c => c.id === ticketId)

  if (!complaint) {
    return (
      <DashboardShell
        items={citizenNav}
        label="Citizen Portal"
        title="Track Complaint"
        user={{
          name: currentUser.name,
          detail: currentUser.rank,
          avatar: currentUser.avatar,
        }}
      >
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Complaint Not Found</h2>
              <p className="text-sm text-muted-foreground">
                Ticket ID <span className="font-mono font-medium">{ticketId}</span> does not exist or may have been removed.
              </p>
            </div>
            <Button asChild>
              <Link href="/complaints">View All Complaints</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  const timeline = generateTimeline(complaint)
  const progress = getProgressPercentage(complaint.status)

  const handleShare = async () => {
    const shareUrl = window.location.href
    try {
      await navigator.share({
        title: `CitySolver - ${complaint.id}`,
        text: `Track my civic issue: ${complaint.title}`,
        url: shareUrl
      })
    } catch {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied", { description: "Share URL copied to clipboard" })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Track Complaint"
      description={`Ticket ${ticketId}`}
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/complaints">
            <ArrowLeft className="mr-2 size-4" />
            Back to Complaints
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          {/* Complaint Header */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video overflow-hidden bg-muted sm:h-72">
              <Image
                src={complaint.image}
                alt={complaint.category}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-white/90 text-foreground hover:bg-white/90">
                    {complaint.id}
                  </Badge>
                  <PriorityBadge priority={complaint.priority} className="backdrop-blur-sm" />
                  <StatusBadge status={complaint.status} />
                </div>
                <h1 className="mt-2 text-xl font-semibold text-white drop-shadow-lg sm:text-2xl">
                  {complaint.title}
                </h1>
              </div>
            </div>
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Resolution Progress</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="mt-2 h-2" />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>Reported: {complaint.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>{complaint.location}</span>
                </div>
                {complaint.officer && (
                  <div className="flex items-center gap-1.5">
                    <User className="size-4 text-muted-foreground" />
                    <span>{complaint.officer}</span>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Resolution Timeline
              </CardTitle>
              <CardDescription>
                Track the progress of your complaint from submission to resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative ml-4 space-y-6 border-l-2 border-border pb-2">
                {timeline.map((event, index) => {
                  const isCurrent = event.status === complaint.status
                  const isNext = !event.completed && timeline[index - 1]?.completed

                  return (
                    <div
                      key={event.status}
                      className={cn(
                        "relative -ml-4 grid gap-4 pl-8",
                        !event.completed && "opacity-50"
                      )}
                    >
                      <div className="absolute left-0 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background">
                        {event.completed ? (
                          <CheckCircle2 className="size-4 text-success" />
                        ) : isCurrent ? (
                          <Loader2 className="size-4 animate-spin text-primary" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={cn(
                            "font-medium",
                            event.completed ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {event.status}
                          </h4>
                          {event.date && (
                            <span className="text-xs text-muted-foreground">
                              {event.date} at {event.time}
                            </span>
                          )}
                        </div>
                        {event.comments && (
                          <p className="text-sm text-muted-foreground">
                            {event.comments}
                          </p>
                        )}
                        {event.officer && event.completed && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="size-3" />
                            {event.officer}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="grid gap-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-mono font-medium">{complaint.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{complaint.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Priority</span>
                <PriorityBadge priority={complaint.priority} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={complaint.status} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Severity Score</span>
                <span className="font-medium">{complaint.severity}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated Coins</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Coins className="size-4 text-warning" />
                  {complaint.coins}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <MapPin className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="font-medium">{complaint.location}</p>
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {complaint.lat}, {complaint.lng}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/map">
                  <MapPin className="mr-2 size-4" />
                  View on City Map
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                <Share2 className="mr-2 size-4" />
                Share Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
                <Printer className="mr-2 size-4" />
                Print Details
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/report">
                  <AlertTriangle className="mr-2 size-4" />
                  Report Similar Issue
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Citizen Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reported By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="relative size-10 overflow-hidden rounded-full">
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{complaint.citizen}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
