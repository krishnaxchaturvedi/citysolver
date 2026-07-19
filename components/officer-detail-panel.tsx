"use client"

import * as React from "react"
import { Gauge, Clock, Briefcase, Route as RouteIcon, Zap, TrendingUp, TrendingDown, Minus, MapPin, Calendar, Activity, ChevronRight, TriangleAlert as AlertTriangle, Building2, CircleCheck as CheckCircle2, CircleDot, Navigation } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { getOfficerDetail, type Officer } from "@/lib/officer-data"
import { scoreBgColor, scoreTextColor } from "@/lib/score-utils"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const LazyAreaChart = React.lazy(async () => ({ default: (await import("recharts")).AreaChart }))
const LazyBarChart = React.lazy(async () => ({ default: (await import("recharts")).BarChart }))
const LazyLineChart = React.lazy(async () => ({ default: (await import("recharts")).LineChart }))
const LazyArea = React.lazy(async () => ({ default: (await import("recharts")).Area }))
const LazyBar = React.lazy(async () => ({ default: (await import("recharts")).Bar }))
const LazyLine = React.lazy(async () => ({ default: (await import("recharts")).Line }))
const LazyXAxis = React.lazy(async () => ({ default: (await import("recharts")).XAxis }))
const LazyYAxis = React.lazy(async () => ({ default: (await import("recharts")).YAxis }))
const LazyCartesianGrid = React.lazy(async () => ({ default: (await import("recharts")).CartesianGrid }))
const LazyTooltip = React.lazy(async () => ({ default: (await import("recharts")).Tooltip }))
const LazyLegend = React.lazy(async () => ({ default: (await import("recharts")).Legend }))
const LazyResponsiveContainer = React.lazy(async () => ({ default: (await import("recharts")).ResponsiveContainer }))

function ChartFallback({ height = 200 }: { height?: number }) {
  return <div className="flex items-center justify-center" style={{ height }} aria-busy="true"><div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
}

function WorkloadGauge({ value, delay }: { value: number; delay: number }) {
  const [animatedValue, setAnimatedValue] = React.useState(0)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1500, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimatedValue(eased * value)
        if (progress < 1) requestAnimationFrame(tick)
        else setAnimatedValue(value)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const angle = (animatedValue / 100) * 180
  const color = value >= 90 ? "#ef4444" : value >= 70 ? "#f59e0b" : value >= 50 ? "#3b82f6" : "#22c55e"

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]" role="img" aria-label={`Workload gauge: ${value}%`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--color-muted)" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="251"
          strokeDashoffset={251 - (251 * animatedValue) / 100}
          className="transition-all duration-1000 ease-out"
        />
        <line
          x1="100"
          y1="100"
          x2={100 + 70 * Math.cos((180 - angle) * Math.PI / 180)}
          y2={100 - 70 * Math.sin((180 - angle) * Math.PI / 180)}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <circle cx="100" cy="100" r="6" fill={color} />
      </svg>
      <div className="absolute bottom-0 text-center">
        <p className="text-2xl font-bold" style={{ color }}>
          <AnimatedCounter value={value} suffix="%" />
        </p>
        <p className="text-xs text-muted-foreground">Workload</p>
      </div>
    </div>
  )
}

function StatTile({ icon: Icon, label, value, suffix, color, delay }: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  color: string
  delay: number
}) {
  return (
    <AnimatedCard delay={delay}>
      <Card>
        <CardContent className="flex items-center gap-3 p-3.5">
          <div className={cn("flex size-9 items-center justify-center rounded-lg", color)}>
            <Icon className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">
              <AnimatedCounter value={value} suffix={suffix || ""} />
            </p>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
}

export function OfficerDetailPanel({ officer, onClose }: { officer: Officer; onClose: () => void }) {
  const detail = React.useMemo(() => getOfficerDetail(officer.id), [officer.id])
  const [activeTab, setActiveTab] = React.useState<"performance" | "route" | "prediction">("performance")

  const trendIcon = detail.workloadPrediction.trend === "rising" ? TrendingUp
    : detail.workloadPrediction.trend === "declining" ? TrendingDown : Minus
  const TrendIcon = trendIcon

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Officer detail: ${officer.name}`}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{officer.name}</h2>
              <p className="text-xs text-muted-foreground">{officer.id} · {officer.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            aria-label="Close officer detail"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile icon={Gauge} label="Workload" value={officer.workloadPct} suffix="%" color="bg-warning/10 text-warning-foreground" delay={0} />
            <StatTile icon={Zap} label="Efficiency" value={officer.efficiencyPct} suffix="%" color="bg-primary/10 text-primary" delay={80} />
            <StatTile icon={Building2} label="Dept Efficiency" value={detail.departmentEfficiency} suffix="%" color="bg-success/10 text-success" delay={160} />
            <StatTile icon={Briefcase} label="Pending Backlog" value={detail.pendingBacklog} color="bg-destructive/10 text-destructive" delay={240} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AnimatedCard delay={320}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Gauge className="size-4 text-primary" aria-hidden="true" />
                    Workload Gauge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkloadGauge value={officer.workloadPct} delay={400} />
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard delay={400}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="size-4 text-primary" aria-hidden="true" />
                    Average Resolution Time
                  </CardTitle>
                  <CardDescription className="text-xs">{officer.avgResolutionTime} average across all cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-primary">
                      <AnimatedCounter value={officer.avgResolutionHours} suffix="h" />
                    </p>
                    <p className="text-sm text-muted-foreground">avg per complaint</p>
                  </div>
                  <AnimatedProgress
                    value={Math.min(100, (officer.avgResolutionHours / 96) * 100)}
                    barClassName={scoreBgColor(100 - (officer.avgResolutionHours / 96) * 100)}
                    delay={500}
                    className="mt-3"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {officer.avgResolutionHours <= 48 ? "Excellent — faster than department average" : officer.avgResolutionHours <= 72 ? "Good — within expected range" : "Needs improvement — above department average"}
                  </p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          <div className="flex gap-1.5 rounded-lg bg-muted/50 p-1" role="tablist" aria-label="Officer detail tabs">
            {([
              { key: "performance", label: "Performance" },
              { key: "route", label: "Current Route" },
              { key: "prediction", label: "Workload Prediction" },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                  activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "performance" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AnimatedCard delay={480}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Activity className="size-4 text-primary" aria-hidden="true" />
                      Weekly Performance
                    </CardTitle>
                    <CardDescription className="text-xs">Resolved vs Assigned over 4 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <React.Suspense fallback={<ChartFallback />}>
                      <LazyResponsiveContainer width="100%" height={200}>
                        <LazyBarChart data={detail.weeklyPerformance}>
                          <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <LazyXAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                          <LazyYAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                          <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                          <LazyLegend wrapperStyle={{ fontSize: 11 }} />
                          <LazyBar dataKey="assigned" fill="var(--chart-4)" radius={[4, 4, 0, 0]} name="Assigned" />
                          <LazyBar dataKey="resolved" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Resolved" />
                        </LazyBarChart>
                      </LazyResponsiveContainer>
                    </React.Suspense>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={560}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                      Monthly Performance
                    </CardTitle>
                    <CardDescription className="text-xs">6-month resolution trend with avg time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <React.Suspense fallback={<ChartFallback />}>
                      <LazyResponsiveContainer width="100%" height={200}>
                        <LazyAreaChart data={detail.monthlyPerformance}>
                          <defs>
                            <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <LazyXAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                          <LazyYAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                          <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                          <LazyLegend wrapperStyle={{ fontSize: 11 }} />
                          <LazyArea type="monotone" dataKey="resolved" stroke="var(--chart-3)" fill="url(#resolvedGrad)" strokeWidth={2} name="Resolved" />
                          <LazyLine type="monotone" dataKey="avgResolutionHours" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 3 }} name="Avg Hours" />
                        </LazyAreaChart>
                      </LazyResponsiveContainer>
                    </React.Suspense>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={640}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                      Complaint Completion Trend
                    </CardTitle>
                    <CardDescription className="text-xs">Daily completed vs pending this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <React.Suspense fallback={<ChartFallback />}>
                      <LazyResponsiveContainer width="100%" height={180}>
                        <LazyLineChart data={detail.completionTrend}>
                          <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <LazyXAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                          <LazyYAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                          <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                          <LazyLegend wrapperStyle={{ fontSize: 11 }} />
                          <LazyLine type="monotone" dataKey="completed" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
                          <LazyLine type="monotone" dataKey="pending" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 3 }} name="Pending" />
                        </LazyLineChart>
                      </LazyResponsiveContainer>
                    </React.Suspense>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
          )}

          {activeTab === "route" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {detail.currentAssignment && (
                <AnimatedCard delay={480}>
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Navigation className="size-4 text-primary" aria-hidden="true" />
                        Current Assignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 animate-pulse">
                          <MapPin className="size-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs font-mono mb-1">{detail.currentAssignment.complaintId}</Badge>
                          <p className="text-sm font-semibold">{detail.currentAssignment.title}</p>
                          <p className="text-xs text-muted-foreground">{detail.currentAssignment.location}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" aria-hidden="true" /> Started: {detail.currentAssignment.startedAt}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" aria-hidden="true" /> ETA: {detail.currentAssignment.eta}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              )}

              <AnimatedCard delay={560}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <RouteIcon className="size-4 text-primary" aria-hidden="true" />
                      Current Route
                    </CardTitle>
                    <CardDescription className="text-xs">Today's scheduled patrol route</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-3 pl-6">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" aria-hidden="true" />
                      {detail.currentRoute.map((point, i) => (
                        <div key={i} className="relative flex items-center gap-3">
                          <div
                            className={cn(
                              "absolute -left-6 flex size-6 items-center justify-center rounded-full border-2 border-background",
                              point.status === "completed" && "bg-success",
                              point.status === "current" && "bg-primary animate-pulse",
                              point.status === "upcoming" && "bg-muted-foreground/30"
                            )}
                            aria-label={`Route point ${i + 1}: ${point.status}`}
                          >
                            {point.status === "completed" && <CheckCircle2 className="size-3 text-white" aria-hidden="true" />}
                            {point.status === "current" && <CircleDot className="size-3 text-white" aria-hidden="true" />}
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-sm font-medium", point.status === "upcoming" && "text-muted-foreground")}>
                              {point.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{point.time}</span>
                              {point.complaintId && <Badge variant="outline" className="text-xs font-mono">{point.complaintId}</Badge>}
                              <Badge variant="outline" className={cn("text-xs capitalize", point.status === "completed" && "bg-success/10 text-success border-success/20", point.status === "current" && "bg-primary/10 text-primary border-primary/20")}>
                                {point.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
          )}

          {activeTab === "prediction" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AnimatedCard delay={480}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                      Workload Prediction
                    </CardTitle>
                    <CardDescription className="text-xs">AI-forecasted workload for next week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                        <TrendIcon className={cn("size-7", detail.workloadPrediction.trend === "rising" ? "text-destructive" : detail.workloadPrediction.trend === "declining" ? "text-success" : "text-primary")} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <p className="text-3xl font-bold">
                          <AnimatedCounter value={detail.workloadPrediction.nextWeekPct} suffix="%" />
                        </p>
                        <p className="text-xs text-muted-foreground">predicted workload next week</p>
                        <Badge variant="outline" className={cn("mt-1 text-xs capitalize", detail.workloadPrediction.trend === "rising" && "bg-destructive/10 text-destructive border-destructive/20", detail.workloadPrediction.trend === "stable" && "bg-primary/10 text-primary border-primary/20", detail.workloadPrediction.trend === "declining" && "bg-success/10 text-success border-success/20")}>
                          {detail.workloadPrediction.trend}
                        </Badge>
                      </div>
                    </div>
                    <AnimatedProgress
                      value={detail.workloadPrediction.nextWeekPct}
                      barClassName={scoreBgColor(detail.workloadPrediction.nextWeekPct)}
                      delay={560}
                      className="mt-4"
                    />
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={640}>
                <Card className={cn(
                  "border-2",
                  detail.workloadPrediction.nextWeekPct >= 90 ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-primary/5"
                )} role="alert">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={cn("size-5 shrink-0", detail.workloadPrediction.nextWeekPct >= 90 ? "text-destructive" : "text-primary")} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium">AI Recommendation</p>
                        <p className="text-xs text-muted-foreground mt-1">{detail.workloadPrediction.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={720}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Zap className="size-4 text-primary" aria-hidden="true" />
                      Efficiency Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Officer Efficiency</span>
                        <span className={cn("font-semibold", scoreTextColor(officer.efficiencyPct))}>{officer.efficiencyPct}%</span>
                      </div>
                      <AnimatedProgress value={officer.efficiencyPct} barClassName={scoreBgColor(officer.efficiencyPct)} delay={800} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Department Efficiency</span>
                        <span className={cn("font-semibold", scoreTextColor(detail.departmentEfficiency))}>{detail.departmentEfficiency}%</span>
                      </div>
                      <AnimatedProgress value={detail.departmentEfficiency} barClassName={scoreBgColor(detail.departmentEfficiency)} delay={880} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Capacity Utilization</span>
                        <span className={cn("font-semibold", scoreTextColor(officer.capacityPct))}>{officer.capacityPct}%</span>
                      </div>
                      <AnimatedProgress value={officer.capacityPct} barClassName={scoreBgColor(officer.capacityPct)} delay={960} />
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
