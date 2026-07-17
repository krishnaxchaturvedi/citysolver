"use client"

import * as React from "react"
import {
  TriangleAlert as AlertTriangle,
  Brain,
  Gauge,
  Percent,
  Users,
  Clock,
  IndianRupee,
  Building2,
  Package,
  Siren,
  Car,
  CloudSun,
  GraduationCap,
  Hospital,
  Landmark,
  Lightbulb,
  Stethoscope,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PriorityBadge } from "@/components/status-badges"
import { AnimatedCounter, AnimatedProgress, AnimatedCard } from "@/components/ai/animated"
import { cn } from "@/lib/utils"
import type { AIAnalysis } from "@/lib/ai-analysis"

function MetricTile({
  icon: Icon,
  label,
  children,
  delay,
  accent,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  delay: number
  accent?: string
}) {
  return (
    <AnimatedCard delay={delay}>
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", accent || "bg-muted")}>
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-0.5 text-sm font-semibold">{children}</div>
        </div>
      </div>
    </AnimatedCard>
  )
}

function ProximityTile({
  icon: Icon,
  label,
  detected,
  distance,
  delay,
}: {
  icon: React.ElementType
  label: string
  detected: boolean
  distance: string
  delay: number
}) {
  return (
    <AnimatedCard delay={delay}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border p-3 transition-colors",
          detected
            ? "border-warning/30 bg-warning/5"
            : "border-border bg-background/40",
        )}
      >
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            detected ? "bg-warning/15 text-warning-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">
            {detected ? `Detected · ${distance}` : "Not detected nearby"}
          </p>
        </div>
        {detected && (
          <span className="size-2 rounded-full bg-warning animate-pulse" />
        )}
      </div>
    </AnimatedCard>
  )
}

function scoreColor(score: number): string {
  if (score >= 80) return "bg-destructive"
  if (score >= 60) return "bg-warning"
  if (score >= 40) return "bg-primary"
  return "bg-success"
}

export function AIAnalysisPanel({ analysis }: { analysis: AIAnalysis }) {
  const [showReasoning, setShowReasoning] = React.useState(false)

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <AnimatedCard>
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
          <div className="absolute right-0 top-0 size-32 translate-x-12 -translate-y-12 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15">
              <Brain className="size-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">AI Analysis Complete</h3>
                <Sparkles className="size-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time assessment powered by CitySolver AI Engine
              </p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Priority & Emergency */}
      <AnimatedCard delay={100}>
        <Card className={cn(
          "border-2",
          analysis.emergencyFlag ? "border-destructive/30" : "border-border",
        )}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Priority</span>
              <PriorityBadge priority={analysis.priority} />
            </div>
            {analysis.emergencyFlag && (
              <Badge variant="destructive" className="animate-pulse">
                <Siren className="mr-1 size-3" />
                Emergency
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Severity</span>
              <Badge variant="outline">{analysis.severity}</Badge>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Score Gauges */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AnimatedCard delay={150}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Gauge className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Risk Score</span>
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={analysis.riskScore} suffix="/100" />
              </div>
              <AnimatedProgress
                value={analysis.riskScore}
                barClassName={scoreColor(analysis.riskScore)}
                delay={200}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={250}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Percent className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Confidence</span>
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={analysis.confidence} suffix="%" />
              </div>
              <AnimatedProgress
                value={analysis.confidence}
                barClassName="bg-success"
                delay={300}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={350}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Citizen Impact</span>
              </div>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={analysis.citizenImpactScore} suffix="/100" />
              </div>
              <AnimatedProgress
                value={analysis.citizenImpactScore}
                barClassName={scoreColor(analysis.citizenImpactScore)}
                delay={400}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile icon={Clock} label="Estimated Resolution Time" delay={200} accent="bg-primary/10 text-primary">
          {analysis.estimatedResolutionTime}
        </MetricTile>
        <MetricTile icon={IndianRupee} label="Estimated Repair Cost" delay={300} accent="bg-primary/10 text-primary">
          {analysis.estimatedRepairCost}
        </MetricTile>
        <MetricTile icon={Building2} label="Recommended Department" delay={400} accent="bg-primary/10 text-primary">
          {analysis.recommendedDepartment}
        </MetricTile>
        <MetricTile icon={ShieldCheck} label="Recommended Officer Level" delay={500} accent="bg-primary/10 text-primary">
          {analysis.recommendedOfficerLevel}
        </MetricTile>
      </div>

      {/* Required Resources */}
      <AnimatedCard delay={300}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="size-4 text-primary" />
              Required Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.requiredResources.map((r, i) => (
                <Badge
                  key={r}
                  variant="outline"
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {r}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* Impact Factors */}
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile icon={Car} label="Traffic Impact" delay={350} accent="bg-warning/10 text-warning-foreground">
          {analysis.trafficImpact}
        </MetricTile>
        <MetricTile icon={CloudSun} label="Weather Impact" delay={450} accent="bg-primary/10 text-primary">
          {analysis.weatherImpact}
        </MetricTile>
      </div>

      {/* Proximity Detection */}
      <AnimatedCard delay={400}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Landmark className="size-4 text-primary" />
              Nearby Infrastructure Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <ProximityTile
              icon={GraduationCap}
              label="Nearby School"
              detected={analysis.nearbySchool}
              distance={analysis.nearbySchoolDistance}
              delay={450}
            />
            <ProximityTile
              icon={Hospital}
              label="Nearby Hospital"
              detected={analysis.nearbyHospital}
              distance={analysis.nearbyHospitalDistance}
              delay={550}
            />
            <ProximityTile
              icon={Building2}
              label="Govt. Building"
              detected={analysis.nearbyGovtBuilding}
              distance={analysis.nearbyGovtBuildingDistance}
              delay={650}
            />
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* AI Summary */}
      <AnimatedCard delay={500}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{analysis.aiSummary}</p>
          </CardContent>
        </Card>
      </AnimatedCard>

      {/* AI Reasoning */}
      <AnimatedCard delay={600}>
        <Card>
          <CardHeader className="pb-3">
            <button
              type="button"
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex w-full items-center justify-between text-left"
            >
              <CardTitle className="flex items-center gap-2 text-sm">
                <Lightbulb className="size-4 text-primary" />
                AI Reasoning
              </CardTitle>
              <ChevronRight className={cn("size-4 transition-transform", showReasoning && "rotate-90")} />
            </button>
          </CardHeader>
          {showReasoning && (
            <CardContent className="animate-in fade-in slide-in-from-top-2 duration-300">
              <ul className="space-y-2">
                {analysis.aiReasoning.map((reason, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {reason}
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      </AnimatedCard>

      {/* Root Cause Analysis */}
      <AnimatedCard delay={700}>
        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Stethoscope className="size-4 text-warning-foreground" />
              Root Cause Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{analysis.rootCauseAnalysis}</p>
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  )
}
