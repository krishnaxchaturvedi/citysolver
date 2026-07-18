"use client"

import * as React from "react"
import {
  TriangleAlert as AlertTriangle,
  TrendingUp,
  Droplets,
  Route,
  ShieldAlert,
  Gauge,
  Flame,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { cn } from "@/lib/utils"
import type { HotspotAnalysis } from "@/lib/map-data"

function scoreColor(score: number): string {
  if (score >= 70) return "bg-destructive"
  if (score >= 40) return "bg-warning"
  return "bg-success"
}

function levelBadge(level: string): string {
  if (level === "High" || level === "Severe") return "bg-destructive/10 text-destructive border-destructive/20"
  if (level === "Moderate") return "bg-warning/15 text-warning-foreground border-warning/30"
  return "bg-success/10 text-success border-success/20"
}

export function HotspotPanel({ analysis }: { analysis: HotspotAnalysis }) {
  return (
    <div className="space-y-3">
      <AnimatedCard>
        <div className="relative overflow-hidden rounded-xl border border-destructive/20 bg-gradient-to-br from-destructive/10 to-transparent p-4">
          <div className="absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-destructive/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/15">
              <Flame className="size-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Hotspot Analysis</h3>
              <p className="text-xs text-muted-foreground">AI-powered risk assessment</p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={80}>
        <Card className="border-destructive/20">
          <CardContent className="p-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="size-4.5 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Most Dangerous Ward</p>
                <p className="text-sm font-semibold">{analysis.mostDangerousWard.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{analysis.mostDangerousWard.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={160}>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="size-4.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Most Complaints Today</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{analysis.mostComplaintsToday.name}</p>
                  <Badge variant="outline" className="text-xs">{analysis.mostComplaintsToday.count} reports</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{analysis.mostComplaintsToday.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={240}>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Droplets className="size-4.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Most Flooded Area</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{analysis.mostFloodedArea.name}</p>
                  <Badge variant="outline" className="text-xs">{analysis.mostFloodedArea.count} water issues</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{analysis.mostFloodedArea.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={320}>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                <Route className="size-4.5 text-warning-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Most Reported Road</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{analysis.mostReportedRoad.name}</p>
                  <Badge variant="outline" className="text-xs shrink-0">{analysis.mostReportedRoad.count}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{analysis.mostReportedRoad.reason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={400}>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <ShieldAlert className="size-4.5 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Crime Risk Indicator</p>
                  <Badge variant="outline" className={cn("text-xs", levelBadge(analysis.crimeRiskIndicator.level))}>
                    {analysis.crimeRiskIndicator.level}
                  </Badge>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    <AnimatedCounter value={analysis.crimeRiskIndicator.score} suffix="/100" />
                  </span>
                </div>
                <AnimatedProgress
                  value={analysis.crimeRiskIndicator.score}
                  barClassName={scoreColor(analysis.crimeRiskIndicator.score)}
                  delay={450}
                  className="mt-1.5"
                />
                <p className="mt-2 text-xs text-muted-foreground">{analysis.crimeRiskIndicator.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={480}>
        <Card>
          <CardContent className="p-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                <Gauge className="size-4.5 text-warning-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Road Damage Index</p>
                  <Badge variant="outline" className={cn("text-xs", levelBadge(analysis.roadDamageIndex.level))}>
                    {analysis.roadDamageIndex.level}
                  </Badge>
                </div>
                <div className="mt-1.5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    <AnimatedCounter value={analysis.roadDamageIndex.score} suffix="/100" />
                  </span>
                </div>
                <AnimatedProgress
                  value={analysis.roadDamageIndex.score}
                  barClassName={scoreColor(analysis.roadDamageIndex.score)}
                  delay={530}
                  className="mt-1.5"
                />
                <p className="mt-2 text-xs text-muted-foreground">{analysis.roadDamageIndex.trend}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  )
}
