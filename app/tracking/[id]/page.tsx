"use client"

import * as React from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { ArrowLeft, MapPin, Calendar, User, Loader as Loader2 } from "lucide-react"
import { getComplaint, getStatusHistory, getOfficer } from "@/lib/supabase/services"
import type { Complaint, ComplaintStatusHistory, Officer } from "@/lib/supabase/types"

export default function TrackingPage() {
  const params = useParams<{ id: string }>()
  const [complaint, setComplaint] = React.useState<Complaint | null>(null)
  const [history, setHistory] = React.useState<ComplaintStatusHistory[]>([])
  const [officer, setOfficer] = React.useState<Officer | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    (async () => {
      try {
        const c = await getComplaint(params.id)
        if (!c) { notFound(); return }
        setComplaint(c)
        const [h, o] = await Promise.all([
          getStatusHistory(params.id),
          c.officer_id ? getOfficer(c.officer_id) : Promise.resolve(null),
        ])
        setHistory(h)
        setOfficer(o)
      } catch {
        notFound()
      } finally {
        setLoading(false)
      }
    })()
  }, [params.id])

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        </div>
      </ProtectedRoute>
    )
  }

  if (!complaint) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <Button variant="ghost" size="sm" render={<Link href="/complaints" />} className="mb-4" aria-label="Back to complaints">
            <ArrowLeft className="mr-2 size-4" aria-hidden="true" /> Back
          </Button>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{complaint.id}</span>
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
              <CardTitle>{complaint.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.image_url && (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  <img src={complaint.image_url} alt={complaint.category} className="size-full object-cover" />
                </div>
              )}
              <p className="text-sm text-muted-foreground">{complaint.description}</p>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" aria-hidden="true" /> {complaint.location}</div>
                <div className="flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" aria-hidden="true" /> {new Date(complaint.created_at).toLocaleDateString()}</div>
              </div>
              {officer && (
                <div className="rounded-lg bg-primary/5 p-3 text-sm">
                  <span className="text-muted-foreground">Assigned Officer: </span>
                  <span className="font-medium text-primary">{officer.name} ({officer.rank})</span>
                </div>
              )}
              {complaint.admin_notes && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="text-muted-foreground">Admin Notes: </span>
                  <span>{complaint.admin_notes}</span>
                </div>
              )}
              {history.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                  <p className="mb-3 text-sm font-semibold">Status History</p>
                  <div className="space-y-2">
                    {history.map(h => (
                      <div key={h.id} className="flex items-center gap-2 text-xs">
                        <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                        <span className="font-medium">{h.status}</span>
                        <span className="text-muted-foreground">· {new Date(h.created_at).toLocaleString()}</span>
                        {h.note && <span className="text-muted-foreground">· {h.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
