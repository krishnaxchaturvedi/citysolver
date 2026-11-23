import { NextRequest } from "next/server"
import { setAuthCookie, supabaseAuth, jsonError } from "@/lib/server/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400 })
    const result = await supabaseAuth("token?grant_type=password", { email: String(email).trim().toLowerCase(), password })
    await setAuthCookie(result.access_token, result.expires_in)
    return Response.json({ user: result.user })
  } catch (error) {
    return jsonError(error)
  }
}
