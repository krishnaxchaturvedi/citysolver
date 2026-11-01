"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, AlertTriangle, Lightbulb } from "lucide-react"
import type { PerImageAnalysis } from "@/lib/image-analysis"
import { cn } from "@/lib/utils"

interface EvidenceQualityCardProps {
  analysis: PerImageAnalysis
}

export function EvidenceQualityCard({ analysis }: EvidenceQualityCardProps) {
  if (!analysis.vision) return null

  const { evidence } = analysis.vision
  const score = evidence.evidenceScore

  const scoreColor =
    score >= 70 ? "text-success" :
    score >= 40 ? "text-warning-foreground" :
    "text-destructive"

  const scoreLabel =
    score >= 70 ? "Good Evidence" :
    score >= 40 ? "Fair Evidence" :
    "Poor Evidence"

  const metrics = [
    { label: "Clarity", value: evidence.clarity },
    { label: "Brightness", value: evidence.brightness },
    { label: "Sharpness", value: 100 - evidence.blur },
    { label: "Visibility", value: evidence.visibility },
    { label: "Relevance", value: evidence.relevantContent },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          Evidence Quality
        </CardTitle>
        <CardDescription>Technical image quality assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-2xl font-bold", scoreColor)}>{score}/100</p>
            <p className="text-xs text-muted-foreground">{scoreLabel}</p>
          </div>
          <Badge variant={score >= 70 ? "default" : "secondary"}>
            {score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak"}
          </Badge>
        </div>
        <div className="space-y-2">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted-foreground">{m.label}</span>
              <Progress value={m.value} className="h-1.5 flex-1" aria-label={`${m.label} score`} />
              <span className="w-8 text-right text-xs font-medium">{m.value}</span>
            </div>
          ))}
        </div>
        {evidence.explanation && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Lightbulb className="size-3" aria-hidden="true" /> Assessment
            </p>
            <p className="text-sm">{evidence.explanation}</p>
          </div>
        )}
        {evidence.warnings.length > 0 && (
          <div className="space-y-1">
            {evidence.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-warning-foreground">
                <AlertTriangle className="size-3 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground italic">
          Note: Evidence quality measures technical image clarity, not whether a civic issue exists.
        </p>
      </CardContent>
    </Card>
  )
}