"use client"

import * as React from "react"
import { Sparkles, FileText, MapPin, TriangleAlert as AlertTriangle, Shield, Clock, CircleCheck as CheckCircle2, Loader as Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateComplaintSummary, type ComplaintAISummary } from "@/lib/llm/complaint-summary"
import type { CategoryKey, Priority } from "@/lib/data"

interface ComplaintSummaryPanelProps {
  complaint: {
    id: string
    title: string
    category: CategoryKey
    description: string
    priority: Priority
    location: string
    image_url?: string | null
    status?: string
  }
}

export function ComplaintSummaryPanel({ complaint }: ComplaintSummaryPanelProps) {
  const [summary, setSummary] = React.useState<ComplaintAISummary | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    generateComplaintSummary(complaint).then((result) => {
      if (!cancelled) {
        setSummary(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [complaint.id])

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center gap-3 p-6">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Generating AI summary...</span>
        </CardContent>
      </Card>
    )
  }

  if (!summary) return null

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 text-primary" />
          AI Complaint Summary
          <Badge variant="outline" className="ml-auto text-xs">{summary.provider}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* One-line summary */}
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-sm font-medium">{summary.oneLineSummary}</p>
        </div>

        {/* Detailed summary */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Detailed Summary</p>
          <p className="text-sm leading-relaxed text-foreground">{summary.detailedSummary}</p>
        </div>

        {/* Grid of key info */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem icon={FileText} label="Detected Issue" value={summary.detectedIssue} />
          <InfoItem icon={MapPin} label="Location" value={summary.location} />
          <InfoItem icon={AlertTriangle} label="Severity" value={summary.severity} />
          <InfoItem icon={Clock} label="Expected Resolution" value={summary.expectedResolution} />
        </div>

        {/* Key evidence */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Key Evidence</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.keyEvidence.map((e, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal">
                <CheckCircle2 className="mr-1 size-3 text-success" />
                {e}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommended action */}
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Recommended Action</p>
            <p className="text-sm">{summary.recommendedAction}</p>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">AI Confidence</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${summary.confidenceScore}%` }} />
            </div>
            <span className="text-sm font-semibold">{summary.confidenceScore}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
