"use client"

import * as React from "react"
import { Brain, ChevronRight, Sparkles, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedProgress } from "@/components/ai/animated"
import { cn } from "@/lib/utils"
import type { PriorityResult } from "@/lib/ai/engine"

export function AIReasoningPanel({ result }: { result: PriorityResult }) {
  const [expanded, setExpanded] = React.useState(true)

  return (
    <AnimatedCard>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={expanded}
          >
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="size-4 text-primary" aria-hidden="true" />
              AI Reasoning
            </CardTitle>
            <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} aria-hidden="true" />
          </button>
        </CardHeader>
        {expanded && (
          <CardContent className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Confidence</span>
              <span className="text-lg font-bold text-success">{result.confidence}%</span>
            </div>
            <AnimatedProgress value={result.confidence} barClassName="bg-success" delay={200} className="mb-4" />
            <div className="space-y-2">
              {result.reasoning.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-col items-center">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary" aria-hidden="true">
                      {i + 1}
                    </span>
                    {i < result.reasoning.length - 1 && (
                      <ArrowDown className="size-3 text-muted-foreground/50" aria-hidden="true" />
                    )}
                  </div>
                  <p className="flex-1 pt-0.5 text-sm text-muted-foreground">{reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="size-3 text-primary" aria-hidden="true" />
                Priority: {result.priority}
              </Badge>
              <Badge variant="outline">Risk: {result.riskLevel}</Badge>
              <Badge variant="outline">Urgency: {result.urgency}</Badge>
              <Badge variant="outline">ETA: {result.estimatedResolutionTime}</Badge>
            </div>
          </CardContent>
        )}
      </Card>
    </AnimatedCard>
  )
}
