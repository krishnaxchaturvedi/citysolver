"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { complaints } from "@/lib/data"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { ComplaintRowSkeleton } from "@/components/loading-skeletons"
import { EmptyState } from "@/components/ui/states"
import { adminUser } from "@/lib/officer-data"
import { Search, ListChecks } from "lucide-react"

const ComplaintCard = React.memo(function ComplaintCard({ complaint }: { complaint: typeof complaints[number] }) {
  return (
    <Card className="transition-colors hover:bg-accent/50">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{complaint.id}</span>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
          <p className="font-medium">{complaint.title}</p>
          <p className="text-sm text-muted-foreground">{complaint.location} · {complaint.date} · {complaint.citizen}</p>
          {complaint.officer && <p className="text-xs text-primary">Assigned: {complaint.officer}</p>}
        </div>
      </CardContent>
    </Card>
  )
})

export default function AdminComplaintsPage() {
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const filtered = React.useMemo(() => {
    if (!search) return complaints
    const q = search.toLowerCase()
    return complaints.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.citizen.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <DashboardShell
      items={adminNav}
      label="Admin Portal"
      title="All Complaints"
      description="Manage and assign civic complaints"
      user={{ name: adminUser.name, detail: adminUser.rank, avatar: adminUser.avatar }}
    >
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Search by ID, title, location, or citizen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search complaints"
        />
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 8 }).map((_, i) => <ComplaintRowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={search ? "No matching complaints" : "No complaints found"}
          description={search ? "Try adjusting your search terms." : "All submitted complaints will appear here."}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} />)}
        </div>
      )}
    </DashboardShell>
  )
}
