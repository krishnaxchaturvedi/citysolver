import { clearAuthCookie } from "@/lib/server/supabase"

export async function POST() {
  await clearAuthCookie()
  return Response.json({ success: true })
}
