// ============================================================
// AI Admin Copilot
// Generates operational briefings and recommendations
// from live database data for admin users.
// ============================================================

import { callLLMWithFallback, type LLMMessage } from "./provider"
import type { ChatContext } from "./context"

export interface AdminBriefing {
  dailySummary: string
  criticalComplaints: { id: string; title: string; reason: string }[]
  unusualSpikes: { category: string; count: number; trend: string }[]
  departmentRecommendations: { department: string; action: string }[]
  officerAllocation: { officerId: string; action: string }[]
  slaRisks: { complaintId: string; risk: string }[]
  wardProblems: { ward: string; issue: string; count: number }[]
  operationalBriefing: string
  provider: string
}

// ---------- Deterministic fallback ----------

export function generateDeterministicBriefing(ctx: ChatContext): AdminBriefing {
  const complaints = ctx.complaints
  const today = new Date().toISOString().slice(0, 10)
  const todayComplaints = complaints.filter((c) => c.created_at.slice(0, 10) === today)

  const critical = complaints
    .filter((c) => c.priority === "Critical" && !["Resolved", "Rejected"].includes(c.status))
    .slice(0, 5)
    .map((c) => ({ id: c.id, title: c.title, reason: `${c.category} at ${c.location} — ${c.priority} priority` }))

  // Spike detection: category with >3 complaints in last 7 days
  const weekAgo = Date.now() - 7 * 86400000
  const recentComplaints = complaints.filter((c) => new Date(c.created_at).getTime() > weekAgo)
  const catCounts: Record<string, number> = {}
  for (const c of recentComplaints) catCounts[c.category] = (catCounts[c.category] || 0) + 1
  const spikes = Object.entries(catCounts)
    .filter(([, n]) => n >= 3)
    .map(([category, count]) => ({ category, count, trend: count >= 5 ? "Rising rapidly" : "Increasing" }))
    .slice(0, 5)

  // Department recommendations
  const deptMap: Record<string, string> = {
    Pothole: "Roads & Infrastructure Department",
    Garbage: "Sanitation & Waste Management",
    "Broken Streetlight": "Electrical & Lighting Division",
    "Water Leakage": "Water Works & Plumbing",
    "Drainage Issue": "Drainage & Storm Water Division",
    "Illegal Dumping": "Sanitation & Waste Management",
    "Public Safety": "Public Safety & Emergency Services",
    Other: "General Municipal Services",
  }
  const deptCounts: Record<string, number> = {}
  for (const c of complaints) {
    const dept = deptMap[c.category] || "General Municipal Services"
    deptCounts[dept] = (deptCounts[dept] || 0) + 1
  }
  const deptRecs = Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([dept, count]) => ({
      department: dept,
      action: count > 5 ? `High load (${count} complaints) — consider additional staffing` : `Monitor (${count} complaints)`,
    }))

  // Officer allocation
  const officerRecs = (ctx.officers || [])
    .sort((a, b) => b.workload_pct - a.workload_pct)
    .slice(0, 3)
    .map((o) => ({
      officerId: o.id,
      action:
        o.workload_pct >= 90
          ? `Critical workload (${o.workload_pct}%) — reassign ${Math.ceil(o.assigned_count / 2)} complaints`
          : o.workload_pct >= 75
            ? `High workload (${o.workload_pct}%) — consider reassignment`
            : `Available for new assignments (${o.workload_pct}% workload)`,
    }))

  // SLA risks
  const slaRisks = complaints
    .filter((c) => ["Critical", "High"].includes(c.priority) && !["Resolved", "Rejected"].includes(c.status))
    .slice(0, 5)
    .map((c) => {
      const ageDays = (Date.now() - new Date(c.created_at).getTime()) / 86400000
      const threshold = c.priority === "Critical" ? 2 : 5
      return {
        complaintId: c.id,
        risk: ageDays > threshold ? `Overdue by ${Math.round(ageDays - threshold)} days` : `Within SLA (${Math.round(threshold - ageDays)} days remaining)`,
      }
    })

  // Ward problems
  const wardCounts: Record<string, { count: number; categories: Record<string, number> }> = {}
  for (const c of complaints) {
    const ward = c.location.split(",")[0].trim() || "Unknown"
    if (!wardCounts[ward]) wardCounts[ward] = { count: 0, categories: {} }
    wardCounts[ward].count++
    wardCounts[ward].categories[c.category] = (wardCounts[ward].categories[c.category] || 0) + 1
  }
  const wardProbs = Object.entries(wardCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([ward, data]) => {
      const topCat = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0]
      return { ward, issue: topCat ? topCat[0] : "Mixed", count: data.count }
    })

  const briefing = `Daily Municipal Briefing (${today}):
${todayComplaints.length} new complaints today, ${ctx.stats?.pending || 0} pending, ${critical.length} critical.
${spikes.length > 0 ? `Spike detected in ${spikes.map((s) => s.category).join(", ")}.` : "No unusual spikes detected."}
${deptRecs.length > 0 ? `Top department load: ${deptRecs[0].department} (${deptRecs[0].action}).` : ""}
${officerRecs.length > 0 ? `Highest workload officer: ${officerRecs[0].action}.` : ""}
${slaRisks.filter((s) => s.risk.includes("Overdue")).length} SLA breaches detected.`

  return {
    dailySummary: `${todayComplaints.length} complaints received today. ${ctx.stats?.pending || 0} pending, ${critical.length} critical, ${ctx.stats?.resolved || 0} resolved.`,
    criticalComplaints: critical,
    unusualSpikes: spikes,
    departmentRecommendations: deptRecs,
    officerAllocation: officerRecs,
    slaRisks,
    wardProblems: wardProbs,
    operationalBriefing: briefing,
    provider: "fallback",
  }
}

// ---------- LLM-powered briefing ----------

export async function generateAdminBriefing(ctx: ChatContext): Promise<AdminBriefing> {
  const fallback = generateDeterministicBriefing(ctx)

  const systemPrompt = `You are a municipal admin AI copilot. Generate a daily operational briefing from live complaint data.
Return JSON with fields: dailySummary, criticalComplaints (array of {id,title,reason}), unusualSpikes (array of {category,count,trend}), departmentRecommendations (array of {department,action}), officerAllocation (array of {officerId,action}), slaRisks (array of {complaintId,risk}), wardProblems (array of {ward,issue,count}), operationalBriefing (string).
Be concise and actionable. Return ONLY valid JSON, no markdown.`

  const dataStr = `Live data:
Total complaints: ${ctx.stats?.totalComplaints || 0}
Pending: ${ctx.stats?.pending || 0}
Resolved: ${ctx.stats?.resolved || 0}
Critical: ${ctx.stats?.critical || 0}
By category: ${JSON.stringify(ctx.stats?.byCategory || {})}
By status: ${JSON.stringify(ctx.stats?.byStatus || {})}
Officers: ${JSON.stringify((ctx.officers || []).slice(0, 10))}
Recent complaints: ${JSON.stringify(ctx.complaints.slice(0, 15).map((c) => ({ id: c.id, title: c.title, category: c.category, priority: c.priority, status: c.status, location: c.location, created_at: c.created_at.slice(0, 10) })))}`

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: dataStr },
  ]

  const response = await callLLMWithFallback(messages, () => JSON.stringify(fallback))

  if (response.provider === "fallback") return fallback

  try {
    const parsed = JSON.parse(response.text)
    return { ...parsed, provider: response.provider }
  } catch {
    return fallback
  }
}
