"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard, AnimatedCounter } from "@/components/ai/animated"
import { AdminDashboardSkeleton } from "@/components/loading-skeletons"
import { officers, adminUser } from "@/lib/officer-data"
import { complaints } from "@/lib/data"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { Users, Briefcase, CircleCheck as CheckCircle2, Zap, ArrowRight, Brain } from "lucide-react"

export default function AdminDashboardPage() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const totals = React.useMemo(() => {
    const totalResolved = officers.reduce((s, o) => s + o.resolvedToday, 0)
    const avgEfficiency = Math.round(officers.reduce((s, o) => s + o.efficiencyPct, 0) / officers.length)
    return { totalResolved, avgEfficiency }
  }, [])

  const summaryStats = React.useMemo(() => [
    { label: "Total Complaints", value: 25000, icon: Briefcase, color: "text-primary" },
    { label: "Active Officers", value: officers.length, icon: Users, color: "text-primary" },
    { label: "Resolved Today", value: totals.totalResolved, icon: CheckCircle2, color: "text-success" },
    { label: "Avg Efficiency", value: totals.avgEfficiency, suffix: "%", icon: Zap, color: "text-warning-foreground" },
  ], [totals])

  if (loading) {
    return (
      <DashboardShell items={adminNav} label="Admin Portal" title="Admin Dashboard" description="City-wide civic issue management" user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}>
        <AdminDashboardSkeleton />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      items={adminNav}
      label="Admin Portal"
      title="Admin Dashboard"
      description="City-wide civic issue management"
      user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((s, i) => {
          const Icon = s.icon
          return (
            <AnimatedCard key={s.label} delay={i * 80}>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`flex size-10 items-center justify-center rounded-lg bg-muted/50 ${s.color}`}>
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

      <AnimatedCard delay={400}>
        <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15">
              <Brain className="size-6 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Officer Intelligence Dashboard</h3>
              <p className="text-sm text-muted-foreground">AI-powered officer performance analytics with workload, efficiency, and capacity tracking</p>
            </div>
            <Link href="/admin/officers" aria-label="Open Officer Intelligence Dashboard">
              <Badge variant="outline" className="gap-1 transition-colors hover:bg-accent">Open <ArrowRight className="size-3" aria-hidden="true" /></Badge>
            </Link>
          </CardContent>
        </Card>
      </AnimatedCard>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recent Complaints</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {complaints.slice(0, 6).map(c => (
              <Link
                key={c.id}
                href={`/tracking/${c.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                aria-label={`View complaint ${c.id}: ${c.title}`}
              >
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.id} · {c.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
