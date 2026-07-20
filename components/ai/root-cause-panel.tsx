"use client"

import * as React from "react"
import { Stethoscope, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedProgress } from "@/components/ai/animated"
import { cn } from "@/lib/utils"
import type { RootCause } from "@/lib/ai/engine"

export function RootCausePanel({ causes }: { causes: RootCause[] }) {
  const [expanded, setExpanded] = React.useState(true)

  return (
    <AnimatedCard>
      <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
        <CardHeader className="pb-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between text-left"
            aria-expanded={expanded}
          >
            <CardTitle className="flex items-center gap-2 text-sm">
              <Stethoscope className="size-4 text-warning-foreground" aria-hidden="true" />
              Root Cause Analysis
            </CardTitle>
            <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} aria-hidden="true" />
          </button>
        </CardHeader>
        {expanded && (
          <CardContent className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-3">
              {causes.map((cause, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex-1 text-muted-foreground">{cause.cause}</span>
                    <Badge variant="outline" className={cn(
                      "ml-2",
                      cause.confidence >= 70 ? "bg-destructive/10 text-destructive border-destructive/20" :
                      cause.confidence >= 50 ? "bg-warning/10 text-warning-foreground border-warning/20" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {cause.confidence}%
                    </Badge>
                  </div>
                  <AnimatedProgress
                    value={cause.confidence}
                    barClassName={cause.confidence >= 70 ? "bg-destructive" : cause.confidence >= 50 ? "bg-warning" : "bg-muted-foreground"}
                    delay={i * 100}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </AnimatedCard>
  )
}
