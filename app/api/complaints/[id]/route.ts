import { NextRequest } from "next/server"
import { jsonError, requireUser, supabaseRest } from "@/lib/server/supabase"

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireUser()
    const { id } = await context.params
    const rows = await supabaseRest(`complaints?ticket_id=eq.${encodeURIComponent(id)}&select=*,complaint_events( id,status,note,created_at,actor_id )`)
    const complaint = Array.isArray(rows) ? rows[0] : null
    if (!complaint) return Response.json({ error: "Complaint not found." }, { status: 404 })
    return Response.json({ complaint })
  } catch (error) {
    return jsonError(error)
  }
}
