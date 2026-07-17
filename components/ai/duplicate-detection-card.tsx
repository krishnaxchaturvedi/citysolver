"use client"

import * as React from "react"
import Link from "next/link"
import {
  Copy,
  MapPin,
  User,
  Activity,
  Eye,
  GitMerge,
  Send,
  TriangleAlert as AlertTriangle,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { AnimatedCard, AnimatedProgress, AnimatedCounter } from "@/components/ai/animated"
import { cn } from "@/lib/utils"
import type { DuplicateMatch } from "@/lib/ai-analysis"

export function DuplicateDetectionCard({
  duplicate,
  onReportAnyway,
}: {
  duplicate: DuplicateMatch
  onReportAnyway: () => void
}) {
  const [action, setAction] = React.useState<"view" | "merge" | "report" | null>(null)
  const isHigh = duplicate.duplicateProbability >= 70
  const isMedium = duplicate.duplicateProbability >= 40 && duplicate.duplicateProbability < 70

  return (
    <div className="space-y-4">
      <AnimatedCard>
        <div className={cn(
          "relative overflow-hidden rounded-xl border p-4",
          isHigh ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5",
        )}>
          <div className="absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-current opacity-5 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className={cn(
              "flex size-12 items-center justify-center rounded-xl",
              isHigh ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning-foreground",
            )}>
              <Copy className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">AI Duplicate Detection</h3>
                <Sparkles className="size-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {isHigh
                  ? "High probability match found — review before submitting"
                  : "A similar complaint was found in your area"}
              </p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Probability Gauge */}
      <AnimatedCard delay={100}>
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Duplicate Probability</span>
              <span className={cn(
                "text-2xl font-bold",
                isHigh ? "text-destructive" : isMedium ? "text-warning-foreground" : "text-primary",
              )}>
                <AnimatedCounter value={duplicate.duplicateProbability} suffix="%" />
              </span>
            </div>
            <AnimatedProgress
              value={duplicate.duplicateProbability}
              barClassName={isHigh ? "bg-destructive" : isMedium ? "bg-warning" : "bg-primary"}
              delay={150}
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="size-3" />
              {isHigh
                ? "AI strongly recommends reviewing the existing complaint before submitting a new one."
                : "AI found a similar complaint. You may still submit a new report if the details differ."}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Nearest Complaint Details */}
      <AnimatedCard delay={200}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Nearest Matching Complaint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{duplicate.nearestComplaint.id}</span>
              <PriorityBadge priority={duplicate.nearestComplaint.priority} />
            </div>
            <p className="text-sm font-medium">{duplicate.nearestComplaint.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {duplicate.nearestComplaint.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                <MapPin className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-sm font-semibold">{duplicate.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                <Activity className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Similarity</p>
                  <p className="text-sm font-semibold">
                    <AnimatedCounter value={duplicate.similarity} suffix="%" />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Officer</p>
                  <p className="text-sm font-semibold">{duplicate.assignedOfficer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                <Activity className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <StatusBadge status={duplicate.currentStatus} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Actions */}
      <AnimatedCard delay={300}>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            render={<Link href={`/tracking/${duplicate.nearestComplaint.id}`} />}
            className="w-full"
          >
            <Eye className="mr-2 size-4" />
            View Existing
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAction("merge")}
            className="w-full"
          >
            <GitMerge className="mr-2 size-4" />
            Merge Complaint
          </Button>
          <Button
            type="button"
            onClick={() => { setAction("report"); onReportAnyway() }}
            className="w-full"
          >
            <Send className="mr-2 size-4" />
            Report Anyway
          </Button>
        </div>
        {action === "merge" && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
            <GitMerge className="mr-1.5 inline size-4 text-primary" />
            Merge request initiated. Your complaint details will be attached to {duplicate.nearestComplaint.id} and forwarded to {duplicate.assignedOfficer}.
          </div>
        )}
      </AnimatedCard>
    </div>
  )
}
