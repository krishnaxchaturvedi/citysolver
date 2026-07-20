"use client"

import * as React from "react"
import { Flame, TrendingUp, MapPin, TriangleAlert as AlertTriangle, Loader as Loader2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { runHotspotPrediction } from "@/lib/ai/ai-services"
import type { HotspotPrediction } from "@/lib/ai/engine"
import { cn } from "@/lib/utils"

export function HotspotPredictionPanel() {
  const [prediction, setPrediction] = React.useState<HotspotPrediction | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    runHotspotPrediction()
      .then(data => { if (!cancelled) setPrediction(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">AI predicting hotspots...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !prediction) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Hotspot prediction unavailable: {error || "No data"}
        </CardContent>
      </Card>
    )
  }

  const riskColor = prediction.riskPercentage >= 75 ? "bg-destructive" : prediction.riskPercentage >= 50 ? "bg-warning" : "bg-primary"

  return (
    <AnimatedCard>
      <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flame className="size-4 text-destructive" aria-hidden="true" />
            AI Hotspot Prediction
            <Sparkles className="size-3 text-primary" aria-hidden="true" />
          </CardTitle>
          <CardDescription className="text-xs">Predicted from complaint history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3" aria-hidden="true" />
                Top Risk Ward: {prediction.ward}
              </span>
              <span className="font-bold text-destructive">
                <AnimatedCounter value={prediction.riskPercentage} suffix="%" />
              </span>
            </div>
            <AnimatedProgress value={prediction.riskPercentage} barClassName={riskColor} delay={200} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Expected Growth</p>
              <p className="text-lg font-bold">
                <AnimatedCounter value={prediction.expectedGrowth} suffix="%" />
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Affected Wards</p>
              <p className="text-lg font-bold">
                <AnimatedCounter value={prediction.affectedWards.length} />
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{prediction.estimatedImpact}</p>

          <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
            <div className="mb-1 flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning-foreground" aria-hidden="true" />
              <span className="text-xs font-semibold">Predicted Next Hotspot</span>
            </div>
            <p className="text-sm font-medium">{prediction.predictedNextHotspot.ward}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="mr-1 size-3" aria-hidden="true" />
                {prediction.predictedNextHotspot.probability}% probability
              </Badge>
              <Badge variant="outline" className="text-xs">{prediction.predictedNextHotspot.timeframe}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{prediction.predictedNextHotspot.reason}</p>
          </div>

          {prediction.affectedWards.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Affected Wards</p>
              <div className="flex flex-wrap gap-1.5">
                {prediction.affectedWards.map(w => (
                  <Badge key={w} variant="outline" className="text-xs">{w}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}
