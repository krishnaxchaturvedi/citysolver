"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Scan, AlertTriangle, Lightbulb } from "lucide-react"
import type { PerImageAnalysis } from "@/lib/image-analysis"

interface ImageClassificationCardProps {
  analysis: PerImageAnalysis
}

export function ImageClassificationCard({ analysis }: ImageClassificationCardProps) {
  if (analysis.status === "pending") {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scan className="size-4 animate-pulse" aria-hidden="true" />
            Waiting for image analysis...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (analysis.status === "analyzing") {
    return (
      <Card>
        <CardContent className="py-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Scan className="size-4 animate-spin" aria-hidden="true" />
            AI analyzing image...
          </div>
          <Progress value={50} className="h-1" />
        </CardContent>
      </Card>
    )
  }

  if (analysis.status === "error" || !analysis.vision) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Analysis failed: {analysis.error || "Unknown error"}
          </div>
        </CardContent>
      </Card>
    )
  }

  const { classification } = analysis.vision

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scan className="size-4 text-primary" aria-hidden="true" />
          Image Classification
        </CardTitle>
        <CardDescription>AI-detected issue category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={classification.confidence > 70 ? "default" : "secondary"}>
            {classification.detectedCategory}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {classification.confidence}% confidence
          </span>
        </div>
        <Progress value={classification.confidence} className="h-1.5" aria-label="Classification confidence" />
        {classification.alternativeCategories.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Alternative categories:</p>
            <div className="flex flex-wrap gap-1.5">
              {classification.alternativeCategories.slice(0, 4).map((alt, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {alt.category} ({alt.confidence}%)
                </Badge>
              ))}
            </div>
          </div>
        )}
        {classification.evidence && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Lightbulb className="size-3" aria-hidden="true" /> Visual Evidence
            </p>
            <p className="text-sm">{classification.evidence}</p>
          </div>
        )}
        {classification.warnings.length > 0 && (
          <div className="space-y-1">
            {classification.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-warning-foreground">
                <AlertTriangle className="size-3 mt-0.5 shrink-0" aria-hidden="true" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
        {!classification.isRelevant && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="size-4" aria-hidden="true" />
            This image may not be relevant to a civic complaint.
          </div>
        )}
      </CardContent>
    </Card>
  )
}