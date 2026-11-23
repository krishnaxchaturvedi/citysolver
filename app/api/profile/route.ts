import { NextRequest } from "next/server"
import { ApiError, jsonError, requireUser, supabaseRest } from "@/lib/server/supabase"

export async function GET() {
  try {
    const user = await requireUser()
    const rows = await supabaseRest(`profiles?id=eq.${user.id}&select=id,full_name,phone,role,city,state,preferences,created_at`)
    return Response.json({ profile: Array.isArray(rows) ? rows[0] : null, email: user.email })
  } catch (error) {
    return jsonError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    if (body.full_name !== undefined) {
      if (typeof body.full_name !== "string" || body.full_name.trim().length < 2 || body.full_name.length > 80) throw new ApiError(400, "Name must contain 2–80 characters.")
      updates.full_name = body.full_name.trim()
    }
    if (body.phone !== undefined) {
      if (typeof body.phone !== "string" || body.phone.length > 20) throw new ApiError(400, "Invalid phone number.")
      updates.phone = body.phone.trim() || null
    }
    if (body.city !== undefined) updates.city = typeof body.city === "string" ? body.city.trim().slice(0,80) : null
    if (body.state !== undefined) updates.state = typeof body.state === "string" ? body.state.trim().slice(0,80) : null
    if (body.preferences !== undefined) {
      if (!body.preferences || typeof body.preferences !== "object" || Array.isArray(body.preferences)) throw new ApiError(400, "Preferences must be an object.")
      const allowed = ["emailUpdates","pushUpdates","weeklyDigest","marketingEmails","publicProfile","showOnLeaderboard","shareLocation","screenReaderOptimized","keyboardNavigation","largeText"]
      const safe = Object.fromEntries(Object.entries(body.preferences).filter(([key,value]) => allowed.includes(key) && typeof value === "boolean"))
      updates.preferences = safe
    }
    updates.updated_at = new Date().toISOString()
    const rows = await supabaseRest(`profiles?id=eq.${user.id}&select=id,full_name,phone,role,city,state,preferences`, {
      method: "PATCH", body: JSON.stringify(updates),
    })
    return Response.json({ profile: Array.isArray(rows) ? rows[0] : null })
  } catch (error) {
    return jsonError(error)
  }
}
