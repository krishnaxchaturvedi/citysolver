"use client"

import * as React from "react"
import { Shield, Star, Activity, Heart, TrendingUp, TrendingDown, Minus, Sparkles, Loader as Loader2, TriangleAlert as AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { runCitizenAI } from "@/lib/ai/ai-services"
import type { CitizenAIResult } from "@/lib/ai/engine"
import { cn } from "@/lib/utils"

export function CitizenAIPanel({ userId }: { userId: string }) {
  const [ai, setAi] = React.useState<CitizenAIResult | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    runCitizenAI(userId)
      .then(data => { if (!cancelled) setAi(data?.ai ?? null) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">AI analyzing citizen profile...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !ai) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Citizen AI unavailable: {error || "No data"}
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = ai.contributionTrend === "Rising" ? TrendingUp : ai.contributionTrend === "Declining" ? TrendingDown : Minus
  const trendColor = ai.contributionTrend === "Rising" ? "text-success" : ai.contributionTrend === "Declining" ? "text-destructive" : "text-muted-foreground"
  const falseReportColor = ai.falseReportProbability >= 50 ? "bg-destructive" : ai.falseReportProbability >= 25 ? "bg-warning" : "bg-success"

  return (
    <AnimatedCard>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Citizen AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="size-3" aria-hidden="true" />
                Trust Score
              </div>
              <p className="text-xl font-bold text-success">
                <AnimatedCounter value={ai.trustScore} suffix="/100" />
              </p>
              <AnimatedProgress value={ai.trustScore} barClassName="bg-success" delay={200} />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="size-3" aria-hidden="true" />
                Reputation Score
              </div>
              <p className="text-xl font-bold text-primary">
                <AnimatedCounter value={ai.reputationScore} suffix="/100" />
              </p>
              <AnimatedProgress value={ai.reputationScore} barClassName="bg-primary" delay={300} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <AlertTriangle className="size-3" aria-hidden="true" />
                False Report Probability
              </span>
              <span className="font-bold">
                <AnimatedCounter value={ai.falseReportProbability} suffix="%" />
              </span>
            </div>
            <AnimatedProgress value={ai.falseReportProbability} barClassName={falseReportColor} delay={400} />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="size-3" aria-hidden="true" />
              Community Impact Score
            </div>
            <p className="text-xl font-bold">
              <AnimatedCounter value={ai.communityImpactScore} suffix="/100" />
            </p>
            <AnimatedProgress value={ai.communityImpactScore} barClassName="bg-primary" delay={500} />
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <Activity className="size-3 text-primary" aria-hidden="true" />
                Contribution Trend
              </span>
              <Badge variant="outline" className={cn("text-xs", trendColor)}>
                <TrendIcon className="mr-1 size-3" aria-hidden="true" />
                {ai.contributionTrend}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}
