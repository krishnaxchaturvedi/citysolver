import { NextRequest } from "next/server"
import { ApiError, jsonError, requireUser, supabaseRest } from "@/lib/server/supabase"

const allowedStatuses = new Set(["Under Review","Approved","Assigned","In Progress","Resolved","Rejected"])

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    if (!["admin","officer"].includes(user.profile.role)) throw new ApiError(403, "Staff access is required.")
    const { id } = await context.params
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    if (body.status !== undefined) {
      if (!allowedStatuses.has(body.status)) throw new ApiError(400, "Invalid complaint status.")
      updates.status = body.status
      if (body.status === "Resolved") updates.resolved_at = new Date().toISOString()
    }
    if (body.assigned_officer_id !== undefined) {
      if (user.profile.role !== "admin") throw new ApiError(403, "Only admins can assign officers.")
      updates.assigned_officer_id = body.assigned_officer_id || null
      if (body.assigned_officer_id) updates.status = "Assigned"
    }
    if (body.priority !== undefined) {
      if (user.profile.role !== "admin" || !["Critical","High","Medium","Low"].includes(body.priority)) throw new ApiError(403, "Only admins can set a valid priority.")
      updates.priority = body.priority
    }
    updates.updated_at = new Date().toISOString()
    const rows = await supabaseRest(`complaints?ticket_id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
    const complaint = Array.isArray(rows) ? rows[0] : null
    if (!complaint) throw new ApiError(404, "Complaint not found.")
    const status = String(updates.status || complaint.status)
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : null
    if (updates.status || note) {
      await supabaseRest("complaint_events", {
        method: "POST",
        body: JSON.stringify({ complaint_id: complaint.id, actor_id: user.id, status, note }),
      })
    }
    // The database trigger awards resolution coins exactly once and creates notifications.
    return Response.json({ complaint })
  } catch (error) {
    return jsonError(error)
  }
}
