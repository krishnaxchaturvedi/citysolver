"use client"

import * as React from "react"
import { Sparkles, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Info, Copy, MapPin, ShieldAlert, Tag, Circle as HelpCircle, Loader as Loader2, Gauge, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"
import type { TranslationKey } from "@/lib/i18n"
import type { IntakeAnalysisResult } from "@/lib/ai-intake"

const riskColors: Record<string, string> = {
  low: "text-success bg-success/10 border-success/20",
  moderate: "text-primary bg-primary/10 border-primary/20",
  high: "text-warning-foreground bg-warning/15 border-warning/30",
  severe: "text-destructive bg-destructive/10 border-destructive/20",
}

const riskLabels: Record<string, TranslationKey> = {
  low: "ai.risk_low",
  moderate: "ai.risk_moderate",
  high: "ai.risk_high",
  severe: "ai.risk_severe",
}

function ScoreGauge({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const [display, setDisplay] = React.useState(0)
  React.useEffect(() => {
    const start = performance.now()
    const dur = 800
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(eased * value)
      if (p < 1) requestAnimationFrame(tick)
      else setDisplay(value)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex size-16 items-center justify-center">
        <svg className="size-16 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
          <circle
            cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="6"
            strokeDasharray={`${(display / 100) * 188.5} 188.5`}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute text-lg font-bold">{Math.round(display)}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
    </div>
  )
}

export function AIAssistantSidebar({ result, loading }: { result: IntakeAnalysisResult | null; loading: boolean }) {
  const { t } = useLanguage()

  if (loading && !result) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("ai.analyzing")}</p>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{t("ai.assistant_title")}</p>
            <p className="text-xs text-muted-foreground">{t("ai.assistant_desc")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" />
            {t("ai.assistant_title")}
          </CardTitle>
          <CardDescription className="text-xs">{t("ai.assistant_desc")}</CardDescription>
        </CardHeader>
      </Card>

      {/* Score Gauges */}
      <Card>
        <CardContent className="flex items-center justify-around p-4">
          <ScoreGauge label={t("ai.completeness_score")} value={result.completenessScore} icon={Gauge} color="text-primary" />
          <div className="h-12 w-px bg-border" />
          <ScoreGauge label={t("ai.confidence_score")} value={result.confidenceScore} icon={TrendingUp} color="text-success" />
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ShieldAlert className="size-3.5" />
              {t("ai.risk_assessment")}
            </span>
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", riskColors[result.riskAssessment])}>
              {t(riskLabels[result.riskAssessment])}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-700", riskColors[result.riskAssessment].split(" ")[0])}
              style={{ width: `${result.riskScore}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Missing Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="size-4 text-warning-foreground" />
            {t("ai.missing_info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.missingInfo.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-2.5 text-sm text-success">
              <CheckCircle2 className="size-4" />
              {t("ai.no_missing_info")}
            </div>
          ) : (
            result.missingInfo.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-lg p-2.5 text-xs",
                  item.severity === "critical" ? "bg-destructive/5 text-destructive" : item.severity === "important" ? "bg-warning/5 text-warning-foreground" : "bg-muted/30 text-muted-foreground",
                )}
              >
                <span className={cn("mt-0.5 size-1.5 shrink-0 rounded-full", item.severity === "critical" ? "bg-destructive" : item.severity === "important" ? "bg-warning" : "bg-muted-foreground")} />
                <span>{item.message}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Follow-up Questions */}
      {result.followUpQuestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HelpCircle className="size-4 text-primary" />
              {t("ai.follow_up_questions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.followUpQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-2 rounded-lg bg-primary/5 p-2.5 text-xs text-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{q.question}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Duplicate Warning */}
      {result.duplicateWarning.probability > 30 && (
        <Card className={cn(result.duplicateWarning.isDuplicate && "border-destructive/30")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Copy className={cn("size-4", result.duplicateWarning.isDuplicate ? "text-destructive" : "text-warning-foreground")} />
              {t("ai.duplicate_warning")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Probability</span>
              <span className={cn("text-lg font-bold", result.duplicateWarning.isDuplicate ? "text-destructive" : "text-warning-foreground")}>
                {result.duplicateWarning.probability}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", result.duplicateWarning.isDuplicate ? "bg-destructive" : "bg-warning")}
                style={{ width: `${result.duplicateWarning.probability}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{result.duplicateWarning.reason}</p>
            {result.duplicateWarning.existingTitle && (
              <div className="rounded-lg bg-muted/30 p-2 text-xs">
                <span className="font-medium">{result.duplicateWarning.existingId}</span>
                <p className="mt-0.5 text-muted-foreground">{result.duplicateWarning.existingTitle}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verification Checks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Verification Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {/* Location */}
          <div className="flex items-start gap-2 text-xs">
            <MapPin className={cn("mt-0.5 size-3.5 shrink-0", result.locationVerification.verified ? "text-success" : "text-warning-foreground")} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t("ai.location_verification")}</span>
                {result.locationVerification.verified ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <AlertCircle className="size-3.5 text-warning-foreground" />
                )}
              </div>
              <p className="text-muted-foreground">{result.locationVerification.message}</p>
              {result.locationVerification.suggestion && (
                <p className="mt-0.5 text-primary">{result.locationVerification.suggestion}</p>
              )}
            </div>
          </div>

          {/* Severity */}
          <div className="flex items-start gap-2 text-xs">
            <Gauge className={cn("mt-0.5 size-3.5 shrink-0", result.severityVerification.confirmed ? "text-success" : "text-warning-foreground")} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t("ai.severity_verification")}</span>
                {result.severityVerification.confirmed ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <AlertCircle className="size-3.5 text-warning-foreground" />
                )}
              </div>
              <p className="text-muted-foreground">{result.severityVerification.reason}</p>
              {!result.severityVerification.confirmed && result.severityVerification.currentPriority !== "" && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Suggested: {result.severityVerification.suggestedPriority}
                </Badge>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-2 text-xs">
            <Tag className={cn("mt-0.5 size-3.5 shrink-0", result.categoryVerification.confirmed ? "text-success" : "text-warning-foreground")} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t("ai.category_verification")}</span>
                {result.categoryVerification.confirmed ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <AlertCircle className="size-3.5 text-warning-foreground" />
                )}
              </div>
              <p className="text-muted-foreground">{result.categoryVerification.reason}</p>
              {!result.categoryVerification.confirmed && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Suggested: {result.categoryVerification.suggestedCategory}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ready indicator */}
      {result.ready && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" />
          Complaint is ready to submit
        </div>
      )}
    </div>
  )
}
