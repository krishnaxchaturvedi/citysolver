import { NextRequest } from "next/server"
import { ApiError, jsonError, requireUser, supabaseConfig, supabaseRest } from "@/lib/server/supabase"

const priorities = ["Critical", "High", "Medium", "Low"] as const
function assessPriority(category: string, description: string) {
  const text = description.toLowerCase()
  if (/(live wire|electrocut|fire|collapse|fatal|injur|accident|flood|burst pipe)/.test(text) || category === "Public Safety") return { priority: "Critical", risk_score: 95 }
  if (/(school|hospital|main road|danger|blocked drain|overflow)/.test(text) || ["Pothole","Broken Streetlight","Water Leakage"].includes(category)) return { priority: "High", risk_score: 75 }
  if (["Garbage","Drainage Issue","Illegal Dumping"].includes(category)) return { priority: "Medium", risk_score: 55 }
  return { priority: "Low", risk_score: 35 }
}

export async function GET() {
  try {
    const user = await requireUser()
    const query = user.profile.role === "citizen"
      ? `complaints?citizen_id=eq.${user.id}&select=*&order=created_at.desc`
      : "complaints?select=*&order=created_at.desc"
    const complaints = await supabaseRest(query)
    return Response.json({ complaints })
  } catch (error) {
    return jsonError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    if (user.profile.role !== "citizen") throw new ApiError(403, "Only citizen accounts can submit reports.")
    const body = await request.json()
    const { category, description, location, landmark, latitude, longitude, imageDataUrl } = body
    if (!category || typeof description !== "string" || description.trim().length < 20 || description.length > 500 || !location?.trim()) {
      throw new ApiError(400, "Choose a category and provide a 20–500 character description and location.")
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new ApiError(400, "A valid GPS location is required.")
    }
    const assessment = assessPriority(category, description)
    const ticketId = `CS-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    let imageUrl: string | null = null

    if (typeof imageDataUrl === "string" && imageDataUrl.startsWith("data:image/")) {
      const match = imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
      if (!match) throw new ApiError(400, "Evidence must be a JPEG, PNG or WebP image.")
      const bytes = Buffer.from(match[2], "base64")
      if (bytes.byteLength > 5 * 1024 * 1024) throw new ApiError(413, "Evidence image must be 5 MB or smaller.")
      const { url, key } = supabaseConfig()
      const token = (await import("next/headers")).cookies
      const jar = await token()
      const accessToken = jar.get("citysolver_access_token")?.value
      const extension = match[1].split("/")[1] === "jpeg" ? "jpg" : match[1].split("/")[1]
      const objectPath = `${user.id}/${ticketId}.${extension}`
      const upload = await fetch(`${url}/storage/v1/object/complaint-evidence/${objectPath}`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${accessToken}`, "Content-Type": match[1], "x-upsert": "false" },
        body: bytes,
        cache: "no-store",
      })
      if (!upload.ok) {
        const detail = await upload.json().catch(() => ({}))
        throw new ApiError(upload.status, detail.message || "Evidence upload failed. Check the Supabase storage migration.")
      }
      imageUrl = objectPath
    }

    const rows = await supabaseRest("complaints", {
      method: "POST",
      body: JSON.stringify({
        ticket_id: ticketId,
        citizen_id: user.id,
        category,
        title: `${category} near ${location.trim()}`,
        description: description.trim(),
        location: location.trim(),
        landmark: landmark?.trim() || null,
        latitude,
        longitude,
        image_url: imageUrl,
        ...assessment,
        status: "Submitted",
      }),
    })
    const complaint = Array.isArray(rows) ? rows[0] : rows
    await supabaseRest("complaint_events", {
      method: "POST",
      body: JSON.stringify({ complaint_id: complaint.id, actor_id: user.id, status: "Submitted", note: "Complaint submitted by citizen" }),
    })
    return Response.json({ complaint }, { status: 201 })
  } catch (error) {
    return jsonError(error)
  }
}
