"use client"

import {
  Sparkles, FileText, Tag, AlertCircle, Check, Wand2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { priorityMeta } from "@/lib/data"
import type { SpeechAnalysisResult } from "@/lib/speech-analysis"

export function SpeechAnalysisCard({
  result,
  applied,
  onApply,
}: {
  result: SpeechAnalysisResult
  applied: boolean
  onApply: () => void
}) {
  const priority = priorityMeta[result.priority]

  return (
    <Card className={cn("transition-all", applied && "border-success/30 bg-success/5")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" />
            AI Speech Analysis
          </CardTitle>
          {applied && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Check className="size-3" /> Applied
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Detected: {result.language} · {result.confidence}% confidence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 rounded-lg bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Tag className="size-3.5" /> Category
            </span>
            <span className="text-sm font-semibold">{result.category}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FileText className="size-3.5" /> Title
            </span>
            <span className="text-right text-sm font-medium">{result.title}</span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <FileText className="size-3.5" /> Description
            </span>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.description}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <AlertCircle className="size-3.5" /> Priority
            </span>
            <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", priority.badge)}>
              {result.priority}
            </span>
          </div>
        </div>

        {result.detectedKeywords.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Detected Keywords</span>
            <div className="flex flex-wrap gap-1.5">
              {result.detectedKeywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal text-muted-foreground">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!applied && (
          <Button type="button" variant="outline" className="w-full" onClick={onApply}>
            <Wand2 className="mr-2 size-4" />
            Apply to form
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
