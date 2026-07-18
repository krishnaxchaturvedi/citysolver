"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { ChartCardSkeleton, StatCardSkeleton } from "@/components/loading-skeletons"
import { ErrorState } from "@/components/ui/states"
import { adminUser, departmentPerformance, todayPerformance, pendingWorkData } from "@/lib/officer-data"
import { monthlyReports, categoryBreakdown, priorityDistribution, resolutionTrend, hotspots, impactStats } from "@/lib/data"
import { scoreBgColor } from "@/lib/score-utils"
import { TrendingUp, Activity, Clock, Gauge, Award, TriangleAlert as AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const LazyAreaChart = React.lazy(() => import("recharts").then(m => ({ default: m.AreaChart })))
const LazyLineChart = React.lazy(() => import("recharts").then(m => ({ default: m.LineChart })))
const LazyBarChart = React.lazy(() => import("recharts").then(m => ({ default: m.BarChart })))
const LazyPieChart = React.lazy(() => import("recharts").then(m => ({ default: m.PieChart })))
const LazyArea = React.lazy(() => import("recharts").then(m => ({ default: m.Area })))
const LazyLine = React.lazy(() => import("recharts").then(m => ({ default: m.Line })))
const LazyBar = React.lazy(() => import("recharts").then(m => ({ default: m.Bar })))
const LazyXAxis = React.lazy(() => import("recharts").then(m => ({ default: m.XAxis })))
const LazyYAxis = React.lazy(() => import("recharts").then(m => ({ default: m.YAxis })))
const LazyCartesianGrid = React.lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid })))
const LazyTooltip = React.lazy(() => import("recharts").then(m => ({ default: m.Tooltip })))
const LazyLegend = React.lazy(() => import("recharts").then(m => ({ default: m.Legend })))
const LazyPie = React.lazy(() => import("recharts").then(m => ({ default: m.Pie })))
const LazyCell = React.lazy(() => import("recharts").then(m => ({ default: m.Cell })))
const LazyResponsiveContainer = React.lazy(() => import("recharts").then(m => ({ default: m.ResponsiveContainer })))

function ChartLoader() {
  return <div className="flex h-64 items-center justify-center" aria-busy="true"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
}

function ChartFallback({ height = 260 }: { height?: number }) {
  return <div className="flex items-center justify-center" style={{ height }} aria-busy="true"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(false)
    setTimeout(() => {
      try { setLoading(false) } catch { setError(true); setLoading(false) }
    }, 500)
  }, [])

  React.useEffect(() => { load() }, [load])

  const sortedDepartments = React.useMemo(
    () => [...departmentPerformance].sort((a, b) => b.efficiency - a.efficiency),
    []
  )

  if (loading) {
    return (
      <DashboardShell items={adminNav} label="Admin Portal" title="Analytics" description="City-wide civic intelligence and trends" user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ChartCardSkeleton /><ChartCardSkeleton />
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell items={adminNav} label="Admin Portal" title="Analytics" description="City-wide civic intelligence and trends" user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}>
        <ErrorState title="Failed to load analytics" description="There was an error fetching analytics data." onRetry={load} />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell items={adminNav} label="Admin Portal" title="Analytics" description="City-wide civic intelligence and trends" user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {impactStats.map((s, i) => (
          <AnimatedCard key={s.label} delay={i * 80}>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold"><AnimatedCounter value={s.value} suffix={s.suffix} /></p>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimatedCard delay={200}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-primary" aria-hidden="true" />Monthly Reports vs Resolved</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={<ChartFallback />}>
                <LazyResponsiveContainer width="100%" height={260}>
                  <LazyAreaChart data={monthlyReports}>
                    <defs>
                      <linearGradient id="gradReports" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <LazyXAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                    <LazyYAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                    <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                    <LazyArea type="monotone" dataKey="reports" stroke="var(--chart-1)" fill="url(#gradReports)" strokeWidth={2} />
                    <LazyArea type="monotone" dataKey="resolved" stroke="var(--chart-3)" fill="url(#gradResolved)" strokeWidth={2} />
                  </LazyAreaChart>
                </LazyResponsiveContainer>
              </React.Suspense>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4 text-primary" aria-hidden="true" />Resolution Rate Trend</CardTitle>
              <CardDescription>Percentage of issues resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={<ChartFallback />}>
                <LazyResponsiveContainer width="100%" height={260}>
                  <LazyLineChart data={resolutionTrend}>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <LazyXAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                    <LazyYAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" domain={[60, 100]} />
                    <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                    <LazyLine type="monotone" dataKey="rate" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 5, fill: "var(--chart-1)" }} />
                  </LazyLineChart>
                </LazyResponsiveContainer>
              </React.Suspense>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimatedCard delay={400}>
          <Card>
            <CardHeader><CardTitle className="text-base">Complaints by Category</CardTitle><CardDescription>Distribution across issue types</CardDescription></CardHeader>
            <CardContent>
              <React.Suspense fallback={<ChartFallback />}>
                <LazyResponsiveContainer width="100%" height={260}>
                  <LazyBarChart data={categoryBreakdown} layout="vertical">
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <LazyXAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                    <LazyYAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" width={70} />
                    <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                    <LazyBar dataKey="count" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
                  </LazyBarChart>
                </LazyResponsiveContainer>
              </React.Suspense>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <Card>
            <CardHeader><CardTitle className="text-base">Priority Distribution</CardTitle><CardDescription>Breakdown by urgency level</CardDescription></CardHeader>
            <CardContent>
              <React.Suspense fallback={<ChartFallback />}>
                <LazyResponsiveContainer width="100%" height={260}>
                  <LazyPieChart>
                    <LazyPie data={priorityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4}>
                      {priorityDistribution.map((entry, i) => <LazyCell key={i} fill={entry.fill} />)}
                    </LazyPie>
                    <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                    <LazyLegend wrapperStyle={{ fontSize: 12 }} />
                  </LazyPieChart>
                </LazyResponsiveContainer>
              </React.Suspense>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={600}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Clock className="size-4 text-primary" aria-hidden="true" />Today's Performance</CardTitle>
            <CardDescription>Resolved vs Assigned by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <React.Suspense fallback={<ChartFallback height={240} />}>
              <LazyResponsiveContainer width="100%" height={240}>
                <LazyBarChart data={todayPerformance}>
                  <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <LazyXAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <LazyYAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                  <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                  <LazyLegend wrapperStyle={{ fontSize: 12 }} />
                  <LazyBar dataKey="assigned" fill="var(--chart-4)" radius={[4, 4, 0, 0]} name="Assigned" />
                  <LazyBar dataKey="resolved" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Resolved" />
                </LazyBarChart>
              </LazyResponsiveContainer>
            </React.Suspense>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimatedCard delay={700}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Award className="size-4 text-primary" aria-hidden="true" />Department Ranking</CardTitle>
              <CardDescription>Efficiency by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedDepartments.map((d, i) => (
                  <div key={d.department} className="flex items-center gap-3">
                    <span className="w-6 text-sm font-bold text-muted-foreground">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{d.department}</span>
                        <span className="text-sm font-semibold">{d.efficiency}%</span>
                      </div>
                      <AnimatedProgress value={d.efficiency} barClassName={scoreBgColor(d.efficiency)} delay={i * 100} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={800}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Gauge className="size-4 text-primary" aria-hidden="true" />Pending Workload</CardTitle>
              <CardDescription>Officers with most pending complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={<ChartFallback height={240} />}>
                <LazyResponsiveContainer width="100%" height={240}>
                  <LazyBarChart data={pendingWorkData} layout="vertical">
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <LazyXAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                    <LazyYAxis dataKey="officer" type="category" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" width={100} />
                    <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                    <LazyBar dataKey="pending" fill="var(--chart-4)" radius={[0, 6, 6, 0]} />
                  </LazyBarChart>
                </LazyResponsiveContainer>
              </React.Suspense>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={900}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="size-4 text-warning-foreground" aria-hidden="true" />Top Hotspot Zones</CardTitle>
            <CardDescription>Areas with most reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotspots.map((h, i) => {
                const rate = Math.round((h.resolved / h.reports) * 100)
                return (
                  <div key={h.zone} className="flex items-center gap-3">
                    <span className="w-6 text-sm font-bold text-muted-foreground">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{h.zone}</span>
                        <span className="text-xs text-muted-foreground">{h.reports} reports · {rate}% resolved</span>
                      </div>
                      <AnimatedProgress value={rate} barClassName={scoreBgColor(rate)} delay={i * 100} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </DashboardShell>
  )
}
