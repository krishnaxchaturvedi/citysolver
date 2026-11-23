import { ApiError, jsonError, requireUser, supabaseRest } from "@/lib/server/supabase"

export async function GET() {
  try {
    const user = await requireUser()
    if (user.profile.role !== "admin") throw new ApiError(403, "Admin access is required.")
    const officers = await supabaseRest("profiles?role=eq.officer&select=id,full_name,phone&order=full_name.asc")
    return Response.json({ officers })
  } catch (error) {
    return jsonError(error)
  }
}
