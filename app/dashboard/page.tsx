"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCounter, AnimatedCard } from "@/components/ai/animated"
import { DashboardSkeleton } from "@/components/loading-skeletons"
import { EmptyState } from "@/components/ui/states"
import { PriorityBadge, StatusBadge } from "@/components/status-badges"
import { useAuth } from "@/lib/supabase/auth-context"
import { useComplaints } from "@/lib/supabase/use-complaints"
import { ListChecks } from "lucide-react"

const StatCard = React.memo(function StatCard({ label, value, suffix, delay }: { label: string; value: number; suffix: string; delay: number }) {
  return (
    <AnimatedCard delay={delay}>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold"><AnimatedCounter value={value} suffix={suffix} /></p>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
})

const ComplaintRow = React.memo(function ComplaintRow({ id, title, location, status, priority }: { id: string; title: string; location: string; status: any; priority: any }) {
  return (
    <Link
      href={`/tracking/${id}`}
      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      aria-label={`View complaint ${id}: ${title}`}
    >
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{id} · {location}</p>
      </div>
      <div className="flex items-center gap-2">
        <PriorityBadge priority={priority} />
        <StatusBadge status={status} />
      </div>
    </Link>
  )
})

export default function DashboardPage() {
  const { profile } = useAuth()
  const { complaints, loading } = useComplaints()

  const stats = React.useMemo(() => {
    const resolved = complaints.filter(c => c.status === "Resolved").length
    const pending = complaints.length - resolved
    return [
      { label: "Total Reports", value: complaints.length, suffix: "" },
      { label: "Resolved", value: resolved, suffix: "" },
      { label: "Pending", value: pending, suffix: "" },
      { label: "Coins", value: profile?.coins ?? 0, suffix: "" },
    ]
  }, [complaints, profile])

  const recentComplaints = React.useMemo(() => complaints.slice(0, 5), [complaints])

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardShell
          items={citizenNav}
          label="Citizen Portal"
          title="Dashboard"
          description="Welcome back to CitySolver"
          user={{ name: profile?.full_name || "Citizen", detail: profile?.role || "citizen", avatar: profile?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" }}
        >
          <DashboardSkeleton />
        </DashboardShell>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardShell
        items={citizenNav}
        label="Citizen Portal"
        title="Dashboard"
        description="Welcome back to CitySolver"
        user={{ name: profile?.full_name || "Citizen", detail: profile?.role || "citizen", avatar: profile?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} delay={i * 100} />
          ))}
        </div>
        <Card className="mt-6">
          <CardHeader><CardTitle>Recent Complaints</CardTitle></CardHeader>
          <CardContent>
            {recentComplaints.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No complaints yet"
                description="Your submitted complaints will appear here."
                action={() => (window.location.href = "/report")}
                actionLabel="Report an Issue"
              />
            ) : (
              <div className="space-y-2">
                {recentComplaints.map(c => (
                  <ComplaintRow
                    key={c.id}
                    id={c.id}
                    title={c.title}
                    location={c.location}
                    status={c.status}
                    priority={c.priority}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  )
}
