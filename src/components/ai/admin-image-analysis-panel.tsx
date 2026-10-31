"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Scan, FileText, ShieldCheck, AlertTriangle } from "lucide-react"
import { getImageAnalysis } from "@/lib/image-analysis"
import type { ImageAnalysis } from "@/lib/supabase/types"

interface AdminImageAnalysisPanelProps {
  complaintId: string
}

export function AdminImageAnalysisPanel({ complaintId }: AdminImageAnalysisPanelProps) {
  const [analyses, setAnalyses] = React.useState<ImageAnalysis[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true
    getImageAnalysis(complaintId)
      .then(data => { if (active) setAnalyses(data) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [complaintId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Loading AI analysis...</p>
        </CardContent>
      </Card>
    )
  }

  if (analyses.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scan className="size-4 text-primary" aria-hidden="true" />
          AI Image Analysis ({analyses.length})
        </CardTitle>
        <CardDescription>AI classification and evidence analysis for this complaint</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyses.map((analysis, idx) => {
          const result = analysis.analysis_result as Record<string, any>
          const warnings = (result?.warnings as string[]) || []
          return (
            <div key={analysis.id} className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-start gap-3">
                <img
                  src={analysis.image_url}
                  alt={`Analysis ${idx + 1}`}
                  className="size-16 rounded-lg object-cover"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={analysis.confidence_score && analysis.confidence_score > 70 ? "default" : "secondary"}>
                      {analysis.detected_category || "Unknown"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {analysis.confidence_score || 0}% confidence · {analysis.model_provider}
                    </span>
                  </div>
                  {analysis.evidence_score !== null && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-3 text-muted-foreground" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Evidence:</span>
                      <Progress value={analysis.evidence_score} className="h-1 w-24" />
                      <span className="text-xs font-medium">{analysis.evidence_score}/100</span>
                    </div>
                  )}
                </div>
              </div>

              {analysis.extracted_text && (
                <div className="flex items-start gap-2 rounded bg-muted/50 p-2">
                  <FileText className="size-3 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">OCR Extracted Text:</p>
                    <p className="text-sm">{analysis.extracted_text}</p>
                    {analysis.ocr_confidence !== null && (
                      <p className="text-xs text-muted-foreground">Confidence: {analysis.ocr_confidence}%</p>
                    )}
                  </div>
                </div>
              )}

              {result?.evidence && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Evidence: </span>{result.evidence}
                </div>
              )}

              {warnings.length > 0 && (
                <div className="space-y-1">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-warning-foreground">
                      <AlertTriangle className="size-3 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}