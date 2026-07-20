"use client"

import * as React from "react"
import { Brain, TrendingUp, Building2, IndianRupee, Clock, Sparkles, Loader as Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { runAIInsights } from "@/lib/ai/ai-services"
import type { AIInsights } from "@/lib/ai/engine"
import { cn } from "@/lib/utils"

export function AIInsightsPanel() {
  const [insights, setInsights] = React.useState<AIInsights | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    runAIInsights()
      .then(data => { if (!cancelled) setInsights(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <AnimatedCard>
        <Card className="border-primary/20">
          <CardContent className="flex items-center gap-3 p-6">
            <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">AI analyzing city-wide data...</p>
              <p className="text-xs text-muted-foreground">Generating predictions from live records</p>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    )
  }

  if (error || !insights) {
    return (
      <AnimatedCard>
        <Card className="border-destructive/20">
          <CardContent className="p-4 text-sm text-muted-foreground">
            AI insights unavailable: {error || "No data"}
          </CardContent>
        </Card>
      </AnimatedCard>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatedCard>
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
          <div className="absolute right-0 top-0 size-32 translate-x-12 -translate-y-12 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15">
              <Brain className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">AI Insights</h3>
                <Sparkles className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">Predictive analytics from live complaint data</p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatedCard delay={100}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground">Predicted Monthly Complaints</span>
              </div>
              <p className="text-3xl font-bold">
                <AnimatedCounter value={insights.predictedMonthlyComplaints} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Based on historical trend</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="size-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground">Departments Tracked</span>
              </div>
              <p className="text-3xl font-bold">
                <AnimatedCounter value={insights.departmentEfficiencyPrediction.length} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">With efficiency predictions</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <IndianRupee className="size-4 text-warning-foreground" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground">Total Budget Forecast</span>
              </div>
              <p className="text-3xl font-bold text-warning-foreground">
                <AnimatedCounter value={insights.budgetForecast.reduce((s, b) => s + b.amount, 0)} prefix="₹" />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={400}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 text-primary" aria-hidden="true" />
              Rising Complaint Categories
            </CardTitle>
            <CardDescription className="text-xs">Growth rate vs previous 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.risingCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available</p>
            ) : (
              insights.risingCategories.map((cat, i) => (
                <div key={cat.category}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{cat.category}</span>
                    <Badge variant="outline" className={cn(cat.growthPct > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-success/10 text-success border-success/20")}>
                      {cat.growthPct > 0 ? "+" : ""}{cat.growthPct}%
                    </Badge>
                  </div>
                  <AnimatedProgress
                    value={Math.min(100, Math.abs(cat.growthPct))}
                    barClassName={cat.growthPct > 0 ? "bg-destructive" : "bg-success"}
                    delay={i * 100}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={500}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building2 className="size-4 text-primary" aria-hidden="true" />
              Department Efficiency Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.departmentEfficiencyPrediction.map((dept, i) => (
              <div key={dept.department}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{dept.department}</span>
                  <span className="font-semibold">{dept.predictedEfficiency}%</span>
                </div>
                <AnimatedProgress value={dept.predictedEfficiency} barClassName="bg-primary" delay={i * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </AnimatedCard>

      <AnimatedCard delay={600}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="size-4 text-primary" aria-hidden="true" />
              Resolution Forecast
            </CardTitle>
            <CardDescription className="text-xs">Predicted resolved complaints (6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
              {insights.resolutionForecast.map((r, i) => {
                const max = Math.max(...insights.resolutionForecast.map(x => x.predicted), 1)
                const h = (r.predicted / max) * 100
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-semibold">{r.predicted}</span>
                    <div
                      className="w-full rounded-t-md bg-primary transition-all duration-700"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{r.month}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </div>
  )
}
