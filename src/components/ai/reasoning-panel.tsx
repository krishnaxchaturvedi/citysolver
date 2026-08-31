"use client"

import * as React from "react"
import { Brain, Loader as Loader2, Gauge, ShieldAlert, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { generateReasoningExplanation, type AIReasoningExplanation } from "@/lib/llm/reasoning"
import type { CategoryKey, Priority } from "@/lib/data"

interface ReasoningPanelProps {
  complaint: {
    category: CategoryKey
    description: string
    priority: Priority
  }
  similarCount?: number
  wardRiskScore?: number
  citizenTrust?: number
}

const weightColors: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
}

const weightText: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning-foreground",
  low: "text-success",
}

export function AIReasoningPanel({ complaint, similarCount = 0, wardRiskScore = 0, citizenTrust = 50 }: ReasoningPanelProps) {
  const [reasoning, setReasoning] = React.useState<AIReasoningExplanation | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    generateReasoningExplanation({
      ...complaint,
      similarCount,
      wardRiskScore,
      citizenTrust,
    }).then((result) => {
      if (!cancelled) {
        setReasoning(result)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [complaint.category, complaint.description, complaint.priority, similarCount, wardRiskScore, citizenTrust])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-6">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Analyzing reasoning...</span>
        </CardContent>
      </Card>
    )
  }

  if (!reasoning) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="size-4 text-primary" />
          Why This Priority?
          <Badge variant="outline" className="ml-auto text-xs">{reasoning.provider}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Factors */}
        <div className="space-y-3">
          {reasoning.factors.map((factor, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={cn("mt-1.5 size-2 shrink-0 rounded-full", weightColors[factor.weight])} />
              <div className="flex-1">
                <p className="text-sm font-medium">{factor.label}</p>
                <p className="text-xs text-muted-foreground">{factor.detail}</p>
              </div>
              <span className={cn("text-xs font-medium", weightText[factor.weight])}>
                {factor.weight.charAt(0).toUpperCase() + factor.weight.slice(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-muted/30 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">{reasoning.summary}</p>
        </div>

        {/* Decision metrics */}
        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <MetricItem icon={Gauge} label="Priority" value={reasoning.priority} />
          <MetricItem icon={ShieldAlert} label="Risk Level" value={reasoning.riskLevel} />
          <MetricItem icon={TrendingUp} label="Confidence" value={`${reasoning.confidence}%`} />
          <MetricItem icon={Clock} label="Response Time" value={reasoning.recommendedResponseTime} />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}
