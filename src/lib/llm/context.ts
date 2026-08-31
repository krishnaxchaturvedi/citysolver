// ============================================================
// AI Context Builder
// Builds role-aware context payloads to send to the LLM.
// Only includes data the user is authorized to see.
// ============================================================

import type { Priority, CategoryKey } from "@/lib/data"

export type UserRole = "citizen" | "officer" | "admin"

export interface ComplaintSummary {
  id: string
  title: string
  category: CategoryKey
  priority: Priority
  status: string
  location: string
  description: string
  created_at: string
  officer_id?: string | null
}

export interface OfficerSummary {
  id: string
  name: string
  department: string
  rank: string
  availability: string
  workload_pct: number
  efficiency_pct: number
  assigned_count: number
  resolved_count: number
}

export interface ProfileSummary {
  id: string
  full_name: string
  role: UserRole
  trust_score: number
  contribution_score: number
  coins: number
  ward?: string
}

export interface ChatContext {
  role: UserRole
  profile: ProfileSummary
  complaints: ComplaintSummary[]
  officers?: OfficerSummary[]
  notifications?: { id: string; type: string; title: string; read: boolean }[]
  stats?: {
    totalComplaints: number
    pending: number
    resolved: number
    critical: number
    byCategory: Record<string, number>
    byStatus: Record<string, number>
  }
}

// ---------- Context builders ----------

export function buildCitizenContext(
  profile: ProfileSummary,
  complaints: ComplaintSummary[],
  notifications?: ChatContext["notifications"],
): ChatContext {
  const myComplaints = complaints.filter((c) => c.id) // already filtered by caller
  const pending = myComplaints.filter((c) => !["Resolved", "Rejected"].includes(c.status)).length
  const resolved = myComplaints.filter((c) => c.status === "Resolved").length
  const critical = myComplaints.filter((c) => c.priority === "Critical").length

  const byCategory: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  for (const c of myComplaints) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
  }

  return {
    role: "citizen",
    profile,
    complaints: myComplaints,
    notifications,
    stats: {
      totalComplaints: myComplaints.length,
      pending,
      resolved,
      critical,
      byCategory,
      byStatus,
    },
  }
}

export function buildOfficerContext(
  profile: ProfileSummary,
  assignedComplaints: ComplaintSummary[],
  officerInfo?: OfficerSummary,
): ChatContext {
  const pending = assignedComplaints.filter((c) => !["Resolved", "Rejected"].includes(c.status)).length
  const resolved = assignedComplaints.filter((c) => c.status === "Resolved").length
  const critical = assignedComplaints.filter((c) => c.priority === "Critical").length

  return {
    role: "officer",
    profile,
    complaints: assignedComplaints,
    officers: officerInfo ? [officerInfo] : [],
    stats: {
      totalComplaints: assignedComplaints.length,
      pending,
      resolved,
      critical,
      byCategory: {},
      byStatus: {},
    },
  }
}

export function buildAdminContext(
  profile: ProfileSummary,
  allComplaints: ComplaintSummary[],
  officers: OfficerSummary[],
): ChatContext {
  const pending = allComplaints.filter((c) => !["Resolved", "Rejected"].includes(c.status)).length
  const resolved = allComplaints.filter((c) => c.status === "Resolved").length
  const critical = allComplaints.filter((c) => c.priority === "Critical").length

  const byCategory: Record<string, number> = {}
  const byStatus: Record<string, number> = {}
  for (const c of allComplaints) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
  }

  return {
    role: "admin",
    profile,
    complaints: allComplaints,
    officers,
    stats: {
      totalComplaints: allComplaints.length,
      pending,
      resolved,
      critical,
      byCategory,
      byStatus,
    },
  }
}

// ---------- System prompt builder ----------

export function buildSystemPrompt(ctx: ChatContext): string {
  const base = `You are CitySolver AI, a municipal complaint assistant for an Indian city.
You help ${ctx.role}s with civic complaints, tracking, priorities, and city services.
Be concise, helpful, and specific. Use the provided context to answer questions.
Never expose another citizen's private data. Only reference the user's own complaints.`

  const profileStr = `User: ${ctx.profile.full_name} (${ctx.role}), Trust: ${ctx.profile.trust_score}/100, Ward: ${ctx.profile.ward || "N/A"}`

  const statsStr = ctx.stats
    ? `Stats: ${ctx.stats.totalComplaints} total, ${ctx.stats.pending} pending, ${ctx.stats.resolved} resolved, ${ctx.stats.critical} critical`
    : ""

  const complaintsStr =
    ctx.complaints.length > 0
      ? `Their complaints:\n${ctx.complaints
          .slice(0, 20)
          .map(
            (c) =>
              `- ${c.id}: "${c.title}" | ${c.category} | ${c.priority} | ${c.status} | ${c.location} | ${c.created_at.slice(0, 10)}`,
          )
          .join("\n")}`
      : "No complaints on record."

  const officersStr =
    ctx.officers && ctx.officers.length > 0
      ? `Officers:\n${ctx.officers
          .slice(0, 10)
          .map(
            (o) =>
              `- ${o.name} (${o.department}, ${o.rank}) | Workload: ${o.workload_pct}% | Efficiency: ${o.efficiency_pct}% | Assigned: ${o.assigned_count} | Resolved: ${o.resolved_count}`,
          )
          .join("\n")}`
      : ""

  const notifStr =
    ctx.notifications && ctx.notifications.length > 0
      ? `Recent notifications:\n${ctx.notifications.slice(0, 5).map((n) => `- ${n.title} (${n.read ? "read" : "unread"})`).join("\n")}`
      : ""

  return [base, profileStr, statsStr, complaintsStr, officersStr, notifStr].filter(Boolean).join("\n\n")
}
