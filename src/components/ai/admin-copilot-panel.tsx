"use client"

import * as React from "react"
import { Sparkles, Loader as Loader2, TriangleAlert as AlertTriangle, TrendingUp, Users, Building2, ShieldAlert, MapPin, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { generateAdminBriefing, type AdminBriefing } from "@/lib/llm/admin-copilot"
import type { ChatContext } from "@/lib/llm/context"

interface AdminCopilotPanelProps {
  context: ChatContext | null
}

export function AdminCopilotPanel({ context }: AdminCopilotPanelProps) {
  const [briefing, setBriefing] = React.useState<AdminBriefing | null>(null)
  const [loading, setLoading] = React.useState(false)

  const generate = React.useCallback(async () => {
    if (!context) return
    setLoading(true)
    try {
      const result = await generateAdminBriefing(context)
      setBriefing(result)
    } finally {
      setLoading(false)
    }
  }, [context])

  React.useEffect(() => {
    if (context) generate()
  }, [context, generate])

  if (!context) return null

  if (loading && !briefing) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center gap-3 p-6">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Generating daily briefing...</span>
        </CardContent>
      </Card>
    )
  }

  if (!briefing) return null

  return (
    <div className="space-y-4">
      {/* Operational Briefing */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" />
            AI Admin Copilot
            <Badge variant="outline" className="ml-auto text-xs">{briefing.provider}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Daily summary */}
          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-sm font-medium">{briefing.dailySummary}</p>
          </div>

          {/* Operational briefing */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Operational Briefing</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{briefing.operationalBriefing}</p>
          </div>

          {/* Critical complaints */}
          {briefing.criticalComplaints.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertTriangle className="size-3.5" /> Critical Complaints
              </p>
              {briefing.criticalComplaints.map((c) => (
                <div key={c.id} className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.id} — {c.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unusual spikes */}
          {briefing.unusualSpikes.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-warning-foreground">
                <TrendingUp className="size-3.5" /> Unusual Spikes
              </p>
              {briefing.unusualSpikes.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-warning/5 p-2.5 text-sm">
                  <span>{s.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{s.count} complaints</Badge>
                    <span className="text-xs text-warning-foreground">{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Department recommendations */}
          {briefing.departmentRecommendations.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3.5" /> Department Recommendations
              </p>
              {briefing.departmentRecommendations.map((d, i) => (
                <div key={i} className="rounded-lg bg-muted/30 p-2.5">
                  <p className="text-sm font-medium">{d.department}</p>
                  <p className="text-xs text-muted-foreground">{d.action}</p>
                </div>
              ))}
            </div>
          )}

          {/* Officer allocation */}
          {briefing.officerAllocation.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3.5" /> Officer Allocation
              </p>
              {briefing.officerAllocation.map((o, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{o.officerId}</p>
                    <p className="text-xs text-muted-foreground">{o.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SLA risks */}
          {briefing.slaRisks.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldAlert className="size-3.5" /> SLA Risks
              </p>
              {briefing.slaRisks.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-sm">
                  <span className="font-medium">{s.complaintId}</span>
                  <span className={cn("text-xs", s.risk.includes("Overdue") ? "text-destructive" : "text-success")}>
                    {s.risk}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Ward problems */}
          {briefing.wardProblems.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" /> Ward Problems
              </p>
              {briefing.wardProblems.map((w, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-sm">
                  <div>
                    <span className="font-medium">{w.ward}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{w.issue}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{w.count}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Refresh button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={generate}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            {loading ? "Generating..." : "Refresh Briefing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
