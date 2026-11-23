import { cookies } from "next/headers"

const COOKIE_NAME = "citysolver_access_token"

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new ApiError(503, "Supabase is not configured. Add the project URL and anon key to environment variables.")
  return { url: url.replace(/\/$/, ""), key }
}

export async function getAccessToken() {
  const jar = await cookies()
  return jar.get(COOKIE_NAME)?.value ?? null
}

export async function setAuthCookie(token: string, expiresIn = 3600) {
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, expiresIn),
  })
}

export async function clearAuthCookie() {
  const jar = await cookies()
  jar.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 })
}

export async function supabaseAuth(path: string, body?: unknown) {
  const { url, key } = supabaseConfig()
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(response.status, payload.msg || payload.message || payload.error_description || "Authentication request failed")
  return payload
}

export async function supabaseRest(path: string, options: RequestInit = {}) {
  const { url, key } = supabaseConfig()
  const token = await getAccessToken()
  if (!token) throw new ApiError(401, "Please sign in to continue.")
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
    cache: "no-store",
  })
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, payload?.message || payload?.hint || "Database request failed")
  return payload
}

export async function requireUser() {
  const token = await getAccessToken()
  if (!token) throw new ApiError(401, "Please sign in to continue.")
  const { url, key } = supabaseConfig()
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  const user = await response.json().catch(() => ({}))
  if (!response.ok || !user.id) throw new ApiError(401, "Your session has expired. Please sign in again.")
  const profiles = await supabaseRest(`profiles?id=eq.${encodeURIComponent(user.id)}&select=id,full_name,role,phone`)
  const profile = Array.isArray(profiles) ? profiles[0] : null
  if (!profile) throw new ApiError(403, "Your profile is not available. Contact an administrator.")
  return { ...user, profile }
}

export function jsonError(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500
  const message = error instanceof Error ? error.message : "Unexpected server error"
  return Response.json({ error: message }, { status })
}
