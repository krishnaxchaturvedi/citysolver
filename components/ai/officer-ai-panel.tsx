"use client"

import * as React from "react"
import { Gauge, TriangleAlert as AlertTriangle, Route as RouteIcon, Calendar, TrendingUp, Sparkles, Loader as Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { runOfficerAI } from "@/lib/ai/ai-services"
import type { OfficerAIResult } from "@/lib/ai/engine"
import { cn } from "@/lib/utils"

export function OfficerAIPanel({ officerId }: { officerId: string }) {
  const [ai, setAi] = React.useState<OfficerAIResult | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    runOfficerAI(officerId)
      .then(data => { if (!cancelled) setAi(data?.ai ?? null) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [officerId])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">AI analyzing officer...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !ai) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Officer AI unavailable: {error || "No data"}
        </CardContent>
      </Card>
    )
  }

  const burnoutColor = ai.burnoutRisk === "Critical" ? "bg-destructive" : ai.burnoutRisk === "High" ? "bg-warning" : "bg-success"
  const burnoutBadge = ai.burnoutRisk === "Critical" ? "bg-destructive/10 text-destructive border-destructive/20" : ai.burnoutRisk === "High" ? "bg-warning/10 text-warning-foreground border-warning/20" : "bg-success/10 text-success border-success/20"

  return (
    <AnimatedCard>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Officer AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Gauge className="size-3" aria-hidden="true" />
                Workload Score
              </span>
              <span className="font-bold">
                <AnimatedCounter value={ai.workloadScore} suffix="/100" />
              </span>
            </div>
            <AnimatedProgress value={ai.workloadScore} barClassName={burnoutColor} delay={200} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Burnout Risk</p>
              <Badge variant="outline" className={cn("mt-1 text-xs", burnoutBadge)}>
                <AlertTriangle className="mr-1 size-3" aria-hidden="true" />
                {ai.burnoutRisk}
              </Badge>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Available for Assignment</p>
              <Badge variant="outline" className={cn("mt-1 text-xs", ai.bestForComplaint ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
                {ai.bestForComplaint ? "Yes" : "No"}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-2">
              <RouteIcon className="size-4 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold">Recommended Reassignment</span>
            </div>
            <p className="text-xs text-muted-foreground">{ai.recommendedReassignment}</p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-2">
              <Calendar className="size-4 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold">Predicted Completion Date</span>
            </div>
            <p className="text-sm font-medium">{ai.predictedCompletionDate}</p>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}
