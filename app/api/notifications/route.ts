import { NextRequest } from "next/server"
import { ApiError, jsonError, requireUser, supabaseRest } from "@/lib/server/supabase"

export async function GET() {
  try {
    const user = await requireUser()
    const rows = await supabaseRest(`notifications?user_id=eq.${user.id}&select=id,title,message,read_at,created_at&order=created_at.desc&limit=100`)
    return Response.json({ notifications: rows })
  } catch (error) {
    return jsonError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    if (body.mark_all === true) {
      const rows = await supabaseRest(`notifications?user_id=eq.${user.id}&read_at=is.null`, {
        method: "PATCH", body: JSON.stringify({ read_at: new Date().toISOString() }),
      })
      return Response.json({ updated: Array.isArray(rows) ? rows.length : 0 })
    }
    if (typeof body.id !== "string" || !body.id) throw new ApiError(400, "Notification id is required.")
    const rows = await supabaseRest(`notifications?id=eq.${encodeURIComponent(body.id)}&user_id=eq.${user.id}`, {
      method: "PATCH", body: JSON.stringify({ read_at: body.read === false ? null : new Date().toISOString() }),
    })
    return Response.json({ notification: Array.isArray(rows) ? rows[0] : null })
  } catch (error) {
    return jsonError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser()
    const id = request.nextUrl.searchParams.get("id")
    if (!id) throw new ApiError(400, "Notification id is required.")
    await supabaseRest(`notifications?id=eq.${encodeURIComponent(id)}&user_id=eq.${user.id}`, { method: "DELETE" })
    return Response.json({ success: true })
  } catch (error) {
    return jsonError(error)
  }
}
