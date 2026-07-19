"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { ComplaintRowSkeleton } from "@/components/loading-skeletons"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useAuth } from "@/lib/supabase/auth-context"
import {
  getComplaints,
  getOfficers,
  assignOfficer,
  updateComplaintStatus,
  addAdminNotes,
  resolveComplaint,
  subscribeToComplaints,
} from "@/lib/supabase/services"
import type { Complaint, Officer, Status } from "@/lib/supabase/types"
import { Search, ListChecks, X, Loader as Loader2 } from "lucide-react"
import { toast } from "sonner"

const statusOptions: Status[] = ["Submitted", "Under Review", "Approved", "Assigned", "In Progress", "Resolved", "Rejected"]

export default function AdminComplaintsPage() {
  const { profile } = useAuth()
  const [search, setSearch] = React.useState("")
  const [complaints, setComplaints] = React.useState<Complaint[]>([])
  const [officers, setOfficers] = React.useState<Officer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<Complaint | null>(null)
  const [acting, setActing] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [c, o] = await Promise.all([getComplaints(), getOfficers()])
      setComplaints(c)
      setOfficers(o)
    } catch (err: any) {
      setError(err.message || "Failed to load complaints")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
    const sub = subscribeToComplaints(() => load())
    return () => { sub() }
  }, [load])

  const filtered = React.useMemo(() => {
    if (!search) return complaints
    const q = search.toLowerCase()
    return complaints.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    )
  }, [search, complaints])

  const handleAssign = async (complaintId: string, officerId: string) => {
    setActing(true)
    try {
      await assignOfficer(complaintId, officerId)
      toast.success("Officer assigned")
      await load()
    } catch (err: any) {
      toast.error("Failed to assign officer", { description: err.message })
    } finally {
      setActing(false)
    }
  }

  const handleStatusChange = async (complaintId: string, status: Status) => {
    setActing(true)
    try {
      await updateComplaintStatus(complaintId, status)
      toast.success(`Status updated to ${status}`)
      await load()
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message })
    } finally {
      setActing(false)
    }
  }

  const handleResolve = async (complaintId: string) => {
    setActing(true)
    try {
      await resolveComplaint(complaintId)
      toast.success("Complaint resolved")
      await load()
    } catch (err: any) {
      toast.error("Failed to resolve", { description: err.message })
    } finally {
      setActing(false)
    }
  }

  const handleAddNotes = async (complaintId: string, notes: string) => {
    setActing(true)
    try {
      await addAdminNotes(complaintId, notes)
      toast.success("Notes saved")
      await load()
    } catch (err: any) {
      toast.error("Failed to save notes", { description: err.message })
    } finally {
      setActing(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "officer"]}>
      <DashboardShell
        items={adminNav}
        label="Admin Portal"
        title="All Complaints"
        description="Manage and assign civic complaints"
        user={{ name: profile?.full_name || "Admin", detail: profile?.role || "admin", avatar: profile?.avatar || "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200" }}
      >
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search by ID, title, location..."
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
        ) : error ? (
          <ErrorState title="Failed to load complaints" description={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title={search ? "No matching complaints" : "No complaints found"}
            description={search ? "Try adjusting your search terms." : "All submitted complaints will appear here."}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <Card key={c.id} className="transition-colors hover:bg-accent/50">
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
                  <Button size="sm" variant="outline" onClick={() => setSelected(c)} aria-label={`Manage complaint ${c.id}`}>
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selected && (
          <ManageDialog
            complaint={selected}
            officers={officers}
            acting={acting}
            onClose={() => setSelected(null)}
            onAssign={handleAssign}
            onStatusChange={handleStatusChange}
            onResolve={handleResolve}
            onAddNotes={handleAddNotes}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  )
}

function ManageDialog({
  complaint,
  officers,
  acting,
  onClose,
  onAssign,
  onStatusChange,
  onResolve,
  onAddNotes,
}: {
  complaint: Complaint
  officers: Officer[]
  acting: boolean
  onClose: () => void
  onAssign: (id: string, officerId: string) => void
  onStatusChange: (id: string, status: Status) => void
  onResolve: (id: string) => void
  onAddNotes: (id: string, notes: string) => void
}) {
  const [officerId, setOfficerId] = React.useState("")
  const [status, setStatus] = React.useState<Status>(complaint.status)
  const [notes, setNotes] = React.useState(complaint.admin_notes || "")

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Manage complaint ${complaint.id}`}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background/95 p-4 backdrop-blur">
          <div>
            <h2 className="text-base font-semibold">{complaint.id}</h2>
            <p className="text-xs text-muted-foreground">{complaint.title}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <Label htmlFor="officer">Assign Officer</Label>
            <select
              id="officer"
              value={officerId}
              onChange={e => setOfficerId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select an officer...</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.department}) — {o.workload_pct}% load</option>
              ))}
            </select>
            <Button
              size="sm"
              className="mt-2"
              disabled={!officerId || acting}
              onClick={() => officerId && onAssign(complaint.id, officerId)}
            >
              {acting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Assign Officer
            </Button>
          </div>

          <div>
            <Label htmlFor="status">Update Status</Label>
            <select
              id="status"
              value={status}
              onChange={e => setStatus(e.target.value as Status)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={acting || status === complaint.status}
              onClick={() => onStatusChange(complaint.id, status)}
            >
              Update Status
            </Button>
          </div>

          <div>
            <Label htmlFor="notes">Admin Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="mt-1"
            />
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={acting}
              onClick={() => onAddNotes(complaint.id, notes)}
            >
              Save Notes
            </Button>
          </div>

          <Button
            className="w-full"
            disabled={acting || complaint.status === "Resolved"}
            onClick={() => onResolve(complaint.id)}
          >
            {acting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Mark as Resolved
          </Button>
        </div>
      </div>
    </div>
  )
}
