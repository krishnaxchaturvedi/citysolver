import { NextRequest } from "next/server"
import { setAuthCookie, supabaseAuth, jsonError } from "@/lib/server/supabase"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json()
    if (!name?.trim() || !email?.trim() || typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Name, valid email and a password of at least 8 characters are required." }, { status: 400 })
    }
    const result = await supabaseAuth("signup", {
      email: email.trim().toLowerCase(),
      password,
      data: { full_name: name.trim(), phone: phone?.trim() || null },
    })
    if (result.access_token) await setAuthCookie(result.access_token, result.expires_in)
    return Response.json({ user: result.user, confirmationRequired: !result.access_token }, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
