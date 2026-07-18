"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { currentUser, complaints } from "@/lib/data"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { ComplaintRowSkeleton } from "@/components/loading-skeletons"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Search, ListChecks, TriangleAlert as AlertTriangle } from "lucide-react"

const ComplaintCard = React.memo(function ComplaintCard({ complaint }: { complaint: typeof complaints[number] }) {
  return (
    <Link
      href={`/tracking/${complaint.id}`}
      aria-label={`View complaint ${complaint.id}: ${complaint.title}`}
    >
      <Card className="transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{complaint.id}</span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <p className="font-medium">{complaint.title}</p>
            <p className="text-sm text-muted-foreground">{complaint.location} · {complaint.date}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

export default function ComplaintsPage() {
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

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
    }, 400)
  }, [])

  React.useEffect(() => { load() }, [load])

  const filtered = React.useMemo(() => {
    if (!search) return complaints
    const q = search.toLowerCase()
    return complaints.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="My Complaints"
      description="Track all your submitted complaints"
      user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}
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
          description="There was an error fetching your complaints. Please try again."
          onRetry={load}
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
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      )}
    </DashboardShell>
  )
}
