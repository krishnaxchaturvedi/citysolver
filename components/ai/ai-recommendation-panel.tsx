"use client"

import * as React from "react"
import {
  Brain, Building2, UserCog, IndianRupee, Users, Calendar, Lightbulb,
  ShieldCheck, MapPin, ChevronRight, Sparkles, Wrench, Package, ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { runRecommendationEngine, runRootCauseAnalysis } from "@/lib/ai/ai-services"
import type { AIRecommendation, RootCause } from "@/lib/ai/engine"
import { RootCausePanel } from "@/components/ai/root-cause-panel"
import { cn } from "@/lib/utils"

function RecoRow({
  icon: Icon, iconBg, iconColor, label, delay, children,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string; label: string; delay: number; children: React.ReactNode
}) {
  return (
    <AnimatedCard delay={delay}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-3.5">
          <div className="flex items-start gap-3">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
              <Icon className={cn("size-4.5", iconColor)} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className="mt-0.5">{children}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}

export function AIRecommendationPanel({
  category,
  lat,
  lng,
}: {
  category: string
  lat: number
  lng: number
}) {
  const [recommendation, setRecommendation] = React.useState<AIRecommendation | null>(null)
  const [rootCauses, setRootCauses] = React.useState<RootCause[]>([])

  React.useEffect(() => {
    if (!category) {
      setRecommendation(null)
      setRootCauses([])
      return
    }
    setRecommendation(runRecommendationEngine(category as any))
    setRootCauses(runRootCauseAnalysis(category as any))
  }, [category, lat, lng])

  if (!recommendation) {
    return (
      <AnimatedCard>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Brain className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Select a category</p>
              <p className="text-xs text-muted-foreground">AI recommendations will appear after you choose an issue type</p>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatedCard>
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
          <div className="absolute right-0 top-0 size-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Recommendation Engine</h3>
              <p className="text-xs text-muted-foreground">AI-powered resolution plan for {category}</p>
            </div>
          </div>
        </div>
      </AnimatedCard>

      <RecoRow icon={Building2} iconBg="bg-primary/10" iconColor="text-primary" label="Best Department" delay={80}>
        <p className="text-sm font-semibold">{recommendation.bestDepartment}</p>
      </RecoRow>

      <RecoRow icon={UserCog} iconBg="bg-primary/10" iconColor="text-primary" label="Suggested Officer Level" delay={160}>
        <p className="text-sm font-semibold">{recommendation.suggestedOfficerLevel}</p>
      </RecoRow>

      <RecoRow icon={IndianRupee} iconBg="bg-warning/10" iconColor="text-warning-foreground" label="Estimated Budget" delay={240}>
        <p className="text-lg font-bold text-warning-foreground">
          <AnimatedCounter value={recommendation.estimatedBudget.amount} prefix="₹" duration={1800} />
        </p>
        <p className="text-xs text-muted-foreground">{recommendation.estimatedBudget.currency}</p>
      </RecoRow>

      <RecoRow icon={Users} iconBg="bg-primary/10" iconColor="text-primary" label="Estimated Workforce" delay={320}>
        <p className="text-lg font-bold">
          <AnimatedCounter value={recommendation.estimatedWorkforce.count} />
          <span className="ml-1 text-sm font-normal text-muted-foreground">{recommendation.estimatedWorkforce.unit}</span>
        </p>
      </RecoRow>

      <AnimatedCard delay={380}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench className="size-4 text-primary" aria-hidden="true" />
              Equipment Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendation.equipmentRequired.map((item, i) => (
                <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <RecoRow icon={Calendar} iconBg="bg-success/10" iconColor="text-success" label="Expected Completion" delay={400}>
        <p className="text-sm font-semibold">5-7 days from assignment</p>
      </RecoRow>

      <RecoRow icon={Lightbulb} iconBg="bg-yellow-500/10" iconColor="text-yellow-600" label="Temporary Solution" delay={440}>
        <p className="text-xs text-muted-foreground">{recommendation.temporarySolution}</p>
      </RecoRow>

      <RecoRow icon={ShieldCheck} iconBg="bg-success/10" iconColor="text-success" label="Permanent Solution" delay={480}>
        <p className="text-xs text-muted-foreground">{recommendation.permanentSolution}</p>
      </RecoRow>

      <AnimatedCard delay={560}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 text-success" aria-hidden="true" />
              Preventive Measures
            </CardTitle>
            <CardDescription className="text-xs">Long-term strategies to prevent recurrence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendation.preventiveMeasures.map((measure, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-2.5 text-xs text-muted-foreground">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success text-[10px] font-bold" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{measure}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      {rootCauses.length > 0 && <RootCausePanel causes={rootCauses} />}
    </div>
  )
}
