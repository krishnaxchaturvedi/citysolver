"use client"

import * as React from "react"
import {
  TriangleAlert as AlertTriangle,
  TrendingUp,
  Droplets,
  Route,
  ShieldAlert,
  Flame,
  Users,
  IndianRupee,
  Brain,
  ChevronRight,
  Activity,
  Gauge,
  Crown,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { computeAdvancedHotspotAnalysis, type AdvancedHotspotAnalysis } from "@/lib/map-data"
import { scoreBgColor, scoreTextColor } from "@/lib/score-utils"
import { cn } from "@/lib/utils"

function levelBadge(level: string): string {
  if (level === "High" || level === "Severe") return "bg-destructive/10 text-destructive border-destructive/20"
  if (level === "Moderate") return "bg-warning/15 text-warning-foreground border-warning/30"
  return "bg-success/10 text-success border-success/20"
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-destructive"
  if (score >= 40) return "bg-warning"
  return "bg-success"
}

function InsightCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  title,
  badge,
  badgeClass,
  description,
  delay,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  title: string
  badge?: string
  badgeClass?: string
  description: string
  delay: number
}) {
  const [expanded, setExpanded] = React.useState(false)
  return (
    <AnimatedCard delay={delay}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-3.5">
          <div className="flex items-start gap-3">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
              <Icon className={cn("size-4.5", iconColor)} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{title}</p>
                {badge && (
                  <Badge variant="outline" className={cn("text-xs shrink-0", badgeClass)}>
                    {badge}
                  </Badge>
                )}
              </div>
              <p className={cn("mt-1 text-xs text-muted-foreground transition-all", expanded ? "" : "line-clamp-1")}>
                {description}
              </p>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                className="mt-1 flex items-center gap-0.5 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              >
                {expanded ? "Show less" : "Show more"}
                <ChevronRight className={cn("size-3 transition-transform", expanded && "rotate-90")} aria-hidden="true" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}

function ScoreCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  score,
  level,
  trend,
  delay,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  score: number
  level: string
  trend: string
  delay: number
}) {
  return (
    <AnimatedCard delay={delay}>
      <Card>
        <CardContent className="p-3.5">
          <div className="flex items-start gap-3">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
              <Icon className={cn("size-4.5", iconColor)} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <Badge variant="outline" className={cn("text-xs", levelBadge(level))}>
                  {level}
                </Badge>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  <AnimatedCounter value={score} suffix="/100" />
                </span>
              </div>
              <AnimatedProgress
                value={score}
                barClassName={scoreColor(score)}
                delay={delay + 50}
                className="mt-1.5"
              />
              <p className="mt-2 text-xs text-muted-foreground">{trend}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}

export function HotspotIntelligencePanel() {
  const analysis = React.useMemo<AdvancedHotspotAnalysis>(() => computeAdvancedHotspotAnalysis(), [])

  return (
    <div className="space-y-3">
      <AnimatedCard>
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
          <div className="absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15">
              <Brain className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Hotspot Intelligence</h3>
              <p className="text-xs text-muted-foreground">Advanced AI-powered risk analysis</p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      <InsightCard
        icon={AlertTriangle}
        iconBg="bg-destructive/10"
        iconColor="text-destructive"
        label="Most Critical Ward"
        title={analysis.mostCriticalWard.name}
        badge={`Score: ${analysis.mostCriticalWard.score}`}
        badgeClass="bg-destructive/10 text-destructive border-destructive/20"
        description={analysis.mostCriticalWard.reason}
        delay={80}
      />

      <InsightCard
        icon={TrendingUp}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        label="Fastest Growing Complaint Area"
        title={analysis.fastestGrowingArea.name}
        badge={`+${analysis.fastestGrowingArea.growthPct}%`}
        badgeClass="bg-warning/15 text-warning-foreground border-warning/30"
        description={analysis.fastestGrowingArea.reason}
        delay={160}
      />

      <InsightCard
        icon={Droplets}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        label="Highest Flood Risk Area"
        title={analysis.highestFloodRiskArea.name}
        badge={analysis.highestFloodRiskArea.riskLevel}
        badgeClass={levelBadge(analysis.highestFloodRiskArea.riskLevel)}
        description={analysis.highestFloodRiskArea.reason}
        delay={240}
      />

      <InsightCard
        icon={Route}
        iconBg="bg-warning/10"
        iconColor="text-warning-foreground"
        label="Highest Road Damage Area"
        title={analysis.highestRoadDamageArea.name}
        badge={`Damage: ${analysis.highestRoadDamageArea.damageScore}/100`}
        badgeClass="bg-warning/15 text-warning-foreground border-warning/30"
        description={analysis.highestRoadDamageArea.reason}
        delay={320}
      />

      <InsightCard
        icon={ShieldAlert}
        iconBg="bg-destructive/10"
        iconColor="text-destructive"
        label="Most Dangerous Junction"
        title={analysis.mostDangerousJunction.name}
        badge={`${analysis.mostDangerousJunction.incidentCount} incidents`}
        badgeClass="bg-destructive/10 text-destructive border-destructive/20"
        description={analysis.mostDangerousJunction.reason}
        delay={400}
      />

      <InsightCard
        icon={Flame}
        iconBg="bg-orange-500/10"
        iconColor="text-orange-600"
        label="Most Repeated Complaint Category"
        title={analysis.mostRepeatedCategory.name}
        badge={`${analysis.mostRepeatedCategory.count} reports`}
        badgeClass="bg-orange-500/10 text-orange-600 border-orange-500/20"
        description={analysis.mostRepeatedCategory.reason}
        delay={480}
      />

      <AnimatedCard delay={560}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-primary" aria-hidden="true" />
              Most Affected Citizens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.mostAffectedCitizens.map((citizen, i) => (
                <div key={citizen.name} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  <Avatar src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100" alt={citizen.name} className="size-8" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{citizen.name}</p>
                    <p className="text-xs text-muted-foreground">{citizen.ward}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{citizen.reports} reports</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={640}>
        <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <IndianRupee className="size-4 text-destructive" aria-hidden="true" />
              Estimated Economic Loss
            </CardTitle>
            <CardDescription className="text-xs">Annual impact from unresolved civic issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-center">
              <p className="text-3xl font-bold text-destructive">
                <AnimatedCounter
                  value={analysis.estimatedEconomicLoss.totalLoss}
                  prefix="₹"
                  duration={2000}
                />
              </p>
              <p className="text-xs text-muted-foreground">{analysis.estimatedEconomicLoss.currency}</p>
            </div>
            <div className="space-y-2">
              {analysis.estimatedEconomicLoss.breakdown.map((item, i) => {
                const pct = (item.loss / analysis.estimatedEconomicLoss.totalLoss) * 100
                return (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="font-semibold">₹{(item.loss / 100000).toFixed(1)}L</span>
                    </div>
                    <AnimatedProgress
                      value={pct}
                      barClassName={scoreBgColor(100 - pct)}
                      delay={i * 80}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={720}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="size-4 text-primary" aria-hidden="true" />
              Predicted Next Hotspot
            </CardTitle>
            <CardDescription className="text-xs">AI forecast based on trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
                <Crown className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{analysis.predictedNextHotspot.ward}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {analysis.predictedNextHotspot.probability}% probability
                  </Badge>
                  <span className="text-xs text-muted-foreground">in {analysis.predictedNextHotspot.timeframe}</span>
                </div>
              </div>
            </div>
            <AnimatedProgress
              value={analysis.predictedNextHotspot.probability}
              barClassName="bg-primary"
              delay={800}
              className="mt-3"
            />
            <p className="mt-2 text-xs text-muted-foreground">{analysis.predictedNextHotspot.reason}</p>
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  )
}
