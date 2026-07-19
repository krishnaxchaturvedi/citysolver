"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { ComplaintRowSkeleton } from "@/components/loading-skeletons"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useAuth } from "@/lib/supabase/auth-context"
import { useComplaints } from "@/lib/supabase/use-complaints"
import { Search, ListChecks } from "lucide-react"

export default function ComplaintsPage() {
  const { profile } = useAuth()
  const { complaints, loading, error, reload } = useComplaints()
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!search) return complaints
    const q = search.toLowerCase()
    return complaints.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    )
  }, [search, complaints])

  return (
    <ProtectedRoute>
      <DashboardShell
        items={citizenNav}
        label="Citizen Portal"
        title="My Complaints"
        description="Track all your submitted complaints"
        user={{ name: profile?.full_name || "Citizen", detail: profile?.role || "citizen", avatar: profile?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" }}
      >
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search complaints..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search complaints"
          />
        </div>

        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            {Array.from({ length: 6 }).map((_, i) => <ComplaintRowSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load complaints"
            description={error}
            onRetry={reload}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title={search ? "No matching complaints" : "No complaints yet"}
            description={search ? "Try adjusting your search terms." : "Your submitted complaints will appear here."}
            action={() => (window.location.href = "/report")}
            actionLabel="Report an Issue"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <Link key={c.id} href={`/tracking/${c.id}`} aria-label={`View complaint ${c.id}: ${c.title}`}>
                <Card className="transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-sm text-muted-foreground">{c.location} · {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  )
}
