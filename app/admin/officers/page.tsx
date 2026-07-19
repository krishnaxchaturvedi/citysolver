"use client"

import * as React from "react"
import {
  Building2,
  CircleCheck as CheckCircle2,
  Clock,
  Gauge,
  Star,
  TrendingUp,
  Users,
  Zap,
  Award,
  Briefcase,
  Activity,
  Search,
  ChevronRight,
  TriangleAlert as AlertTriangle,
  UserSearch,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { StatCardSkeleton, ChartCardSkeleton, ComplaintRowSkeleton } from "@/components/loading-skeletons"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { OfficerDetailPanel } from "@/components/officer-detail-panel"
import { officers, departmentPerformance, todayPerformance, pendingWorkData, adminUser, type Officer, type Availability } from "@/lib/officer-data"
import { scoreBgColor, scoreTextColor } from "@/lib/score-utils"
import { cn } from "@/lib/utils"

const availabilityMeta: Record<Availability, { color: string; dot: string; badge: string }> = {
  Available: { color: "text-success", dot: "bg-success", badge: "bg-success/10 text-success border-success/20" },
  "On Field": { color: "text-primary", dot: "bg-primary", badge: "bg-primary/10 text-primary border-primary/20" },
  "On Break": { color: "text-warning-foreground", dot: "bg-warning", badge: "bg-warning/15 text-warning-foreground border-warning/30" },
  "Off Duty": { color: "text-muted-foreground", dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground border-border" },
}

const OfficerCard = React.memo(function OfficerCard({ officer, rank, delay, onView }: { officer: Officer; rank: number; delay: number; onView: (officer: Officer) => void }) {
  const avail = availabilityMeta[officer.availability]
  const [expanded, setExpanded] = React.useState(false)

  return (
    <AnimatedCard delay={delay}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <Avatar src={officer.avatar} alt={`${officer.name} photo`} className="size-14" />
              <span className={cn("absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background", avail.dot)} aria-label={`Status: ${officer.availability}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{officer.name}</p>
                  <p className="text-xs text-muted-foreground">{officer.id}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
                  {rank <= 3 && <Award className={cn("size-4", rank === 1 ? "text-warning-foreground" : rank === 2 ? "text-muted-foreground" : "text-orange-500")} aria-label={`Rank ${rank}`} />}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", avail.badge)}>
                  <span className={cn("mr-1 size-1.5 rounded-full", avail.dot)} aria-hidden="true" />
                  {officer.availability}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Building2 className="mr-1 size-3" aria-hidden="true" />
                  {officer.department}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Assigned</p>
              <p className="text-sm font-bold"><AnimatedCounter value={officer.assignedComplaints} /></p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-sm font-bold text-success"><AnimatedCounter value={officer.resolvedToday} /></p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Avg Time</p>
              <p className="text-sm font-bold">{officer.avgResolutionTime}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="flex items-center justify-center gap-0.5 text-sm font-bold">
                <Star className="size-3 fill-warning text-warning-foreground" aria-hidden="true" />
                {officer.citizenRating}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Gauge className="size-3" aria-hidden="true" /> Workload</span>
                <span className={cn("font-semibold", scoreTextColor(officer.workloadPct))}>
                  <AnimatedCounter value={officer.workloadPct} suffix="%" />
                </span>
              </div>
              <AnimatedProgress value={officer.workloadPct} barClassName={scoreBgColor(officer.workloadPct)} delay={delay + 100} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Zap className="size-3" aria-hidden="true" /> Efficiency</span>
                <span className={cn("font-semibold", scoreTextColor(officer.efficiencyPct))}>
                  <AnimatedCounter value={officer.efficiencyPct} suffix="%" />
                </span>
              </div>
              <AnimatedProgress value={officer.efficiencyPct} barClassName={scoreBgColor(officer.efficiencyPct)} delay={delay + 200} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Activity className="size-3" aria-hidden="true" /> Capacity</span>
                <span className={cn("font-semibold", scoreTextColor(officer.capacityPct))}>
                  <AnimatedCounter value={officer.capacityPct} suffix="%" />
                </span>
              </div>
              <AnimatedProgress value={officer.capacityPct} barClassName={scoreBgColor(officer.capacityPct)} delay={delay + 300} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onView(officer)}
            aria-expanded={expanded}
            aria-controls={`officer-details-${officer.id}`}
            className="mt-3 flex w-full items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            <span>View Full Profile</span>
            <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} aria-hidden="true" />
          </button>

          {expanded && (
            <div id={`officer-details-${officer.id}`} className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300 space-y-2 rounded-lg border border-border p-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Skill Level</p>
                  <p className="font-semibold">{officer.skillLevel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-semibold">{officer.experienceYears} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-semibold">{officer.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Resolution</p>
                  <p className="font-semibold">{officer.avgResolutionTime}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">Trust</p>
                  <p className="font-bold text-success">{Math.round(officer.citizenRating * 20)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quality</p>
                  <p className="font-bold text-primary">{officer.efficiencyPct}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Speed</p>
                  <p className="font-bold text-warning-foreground">{Math.max(0, 100 - officer.avgResolutionHours)}%</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>
  )
})

const MiniBarChart = React.memo(function MiniBarChart({ data, label, color = "var(--chart-1)" }: { data: { name: string; value: number }[]; label: string; color?: string }) {
  const max = React.useMemo(() => Math.max(...data.map(d => d.value), 1), [data])
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end justify-between gap-2" role="img" aria-label={label}>
          {data.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="text-xs font-semibold">{d.value}</div>
              <div
                className="w-full rounded-t-md transition-all duration-700 ease-out hover:opacity-80"
                style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: "4px" }}
              />
              <div className="text-xs text-muted-foreground">{d.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

export default function OfficerIntelligencePage() {
  const [search, setSearch] = React.useState("")
  const [deptFilter, setDeptFilter] = React.useState<string>("all")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [selectedOfficer, setSelectedOfficer] = React.useState<Officer | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    setError(false)
    setTimeout(() => {
      try {
        setLoading(false)
      } catch {
        setError(true)
        setLoading(false)
      }
    }, 500)
  }, [])

  React.useEffect(() => { load() }, [load])

  const departments = React.useMemo(() => Array.from(new Set(officers.map(o => o.department))), [])

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    return officers.filter(o => {
      const matchesSearch = o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
      const matchesDept = deptFilter === "all" || o.department === deptFilter
      return matchesSearch && matchesDept
    })
  }, [search, deptFilter])

  const ranked = React.useMemo(() => [...filtered].sort((a, b) => b.efficiencyPct - a.efficiencyPct), [filtered])

  const totals = React.useMemo(() => {
    const totalAssigned = officers.reduce((s, o) => s + o.assignedComplaints, 0)
    const totalResolved = officers.reduce((s, o) => s + o.resolvedToday, 0)
    const avgEfficiency = Math.round(officers.reduce((s, o) => s + o.efficiencyPct, 0) / officers.length)
    return { totalAssigned, totalResolved, avgEfficiency }
  }, [])

  const overloadedOfficers = React.useMemo(() => officers.filter(o => o.workloadPct >= 90), [])

  const summaryStats = React.useMemo(() => [
    { label: "Active Officers", value: officers.length, icon: Users, color: "text-primary" },
    { label: "Total Assigned", value: totals.totalAssigned, icon: Briefcase, color: "text-warning-foreground" },
    { label: "Resolved Today", value: totals.totalResolved, icon: CheckCircle2, color: "text-success" },
    { label: "Avg Efficiency", value: totals.avgEfficiency, suffix: "%", icon: Zap, color: "text-primary" },
  ], [totals])

  if (loading) {
    return (
      <DashboardShell items={adminNav} label="Admin Portal" title="Officer Intelligence Dashboard" description="AI-powered officer performance analytics" user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <ChartCardSkeleton />
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
        <div className="mt-6 space-y-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }).map((_, i) => <ComplaintRowSkeleton key={i} />)}
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell items={adminNav} label="Admin Portal" title="Officer Intelligence Dashboard" description="AI-powered officer performance analytics" user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}>
        <ErrorState title="Failed to load officer data" description="There was an error fetching officer performance data." onRetry={load} />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      items={adminNav}
      label="Admin Portal"
      title="Officer Intelligence Dashboard"
      description="AI-powered officer performance analytics"
      user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((s, i) => {
          const Icon = s.icon
          return (
            <AnimatedCard key={s.label} delay={i * 80}>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={cn("flex size-10 items-center justify-center rounded-lg bg-muted/50", s.color)}>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold"><AnimatedCounter value={s.value} suffix={s.suffix || ""} /></p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <AnimatedCard delay={200}>
          <MiniBarChart label="Department Efficiency" data={departmentPerformance.map(d => ({ name: d.department, value: d.efficiency }))} color="var(--chart-1)" />
        </AnimatedCard>
        <AnimatedCard delay={300}>
          <MiniBarChart label="Today's Performance (Resolved)" data={todayPerformance.map(d => ({ name: d.hour, value: d.resolved }))} color="var(--chart-3)" />
        </AnimatedCard>
        <AnimatedCard delay={400}>
          <MiniBarChart label="Pending Workload by Officer" data={pendingWorkData.map(d => ({ name: d.officer.split(" ").pop()!, value: d.pending }))} color="var(--chart-4)" />
        </AnimatedCard>
      </div>

      <AnimatedCard delay={500}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Department Ranking</CardTitle>
            <CardDescription>Efficiency and workload by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...departmentPerformance].sort((a, b) => b.efficiency - a.efficiency).map((d, i) => (
                <div key={d.department} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-muted-foreground">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{d.department}</span>
                      <span className="text-sm font-semibold">{d.efficiency}%</span>
                    </div>
                    <AnimatedProgress value={d.efficiency} barClassName={scoreBgColor(d.efficiency)} delay={i * 100} />
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{d.resolved} resolved</span>
                    <span>{d.pending} pending</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search officers by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search officers"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by department">
          <button
            onClick={() => setDeptFilter("all")}
            aria-pressed={deptFilter === "all"}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              deptFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            All Departments
          </button>
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              aria-pressed={deptFilter === d}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                deptFilter === d ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Officer Ranking</h2>
          <Badge variant="secondary">{ranked.length} officers</Badge>
        </div>
        {ranked.length === 0 ? (
          <EmptyState icon={UserSearch} title="No officers found" description="Try adjusting your search or filter." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ranked.map((officer, i) => (
              <OfficerCard key={officer.id} officer={officer} rank={i + 1} delay={i * 80} onView={setSelectedOfficer} />
            ))}
          </div>
        )}
      </div>

      {overloadedOfficers.length > 0 && (
        <AnimatedCard delay={600}>
          <Card className="mt-6 border-destructive/30 bg-destructive/5" role="alert">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="size-5 text-destructive shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-sm text-destructive">Workload Alert</p>
                <p className="text-xs text-muted-foreground">
                  {overloadedOfficers.map(o => o.name).join(", ")} are operating above 90% workload. Consider reassigning complaints.
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      {selectedOfficer && (
        <OfficerDetailPanel officer={selectedOfficer} onClose={() => setSelectedOfficer(null)} />
      )}
    </DashboardShell>
  )
}
