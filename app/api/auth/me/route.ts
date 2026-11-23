import { requireUser, jsonError } from "@/lib/server/supabase"

export async function GET() {
  try {
    const user = await requireUser()
    return Response.json({ user: { id: user.id, email: user.email, ...user.profile } })
  } catch (error) {
    return jsonError(error)
  }
}
