// ============================================================
// AI Actions
// Recommends actions but never silently executes destructive ones.
// All actions require explicit user confirmation.
// ============================================================

import { callLLMWithFallback, type LLMMessage } from "./provider"

export type ActionType = "assign_officer" | "change_status" | "escalate" | "send_notification"

export interface AIAction {
  type: ActionType
  label: string
  description: string
  requiresConfirmation: boolean
  params: Record<string, string>
  riskLevel: "safe" | "moderate" | "dangerous"
}

export interface AIActionRecommendation {
  actions: AIAction[]
  explanation: string
  provider: string
}

// ---------- Deterministic fallback ----------

export function generateDeterministicActions(context: {
  complaintId?: string
  status?: string
  priority?: string
  hasOfficer?: boolean
  availableOfficers?: { id: string; name: string; workload: number }[]
}): AIActionRecommendation {
  const actions: AIAction[] = []

  if (context.complaintId) {
    if (!context.hasOfficer && context.availableOfficers && context.availableOfficers.length > 0) {
      const best = context.availableOfficers.sort((a, b) => a.workload - b.workload)[0]
      actions.push({
        type: "assign_officer",
        label: `Assign ${best.name}`,
        description: `Assign ${best.name} (workload: ${best.workload}%) to this complaint`,
        requiresConfirmation: true,
        params: { complaintId: context.complaintId, officerId: best.id },
        riskLevel: "moderate",
      })
    }

    if (context.status === "Submitted" || context.status === "Under Review") {
      actions.push({
        type: "change_status",
        label: "Approve complaint",
        description: "Move this complaint from review to approved status",
        requiresConfirmation: true,
        params: { complaintId: context.complaintId, newStatus: "Approved" },
        riskLevel: "moderate",
      })
    }

    if (context.priority === "Critical") {
      actions.push({
        type: "escalate",
        label: "Escalate to senior officer",
        description: "Escalate this critical complaint to a senior officer for immediate attention",
        requiresConfirmation: true,
        params: { complaintId: context.complaintId },
        riskLevel: "moderate",
      })
    }

    actions.push({
      type: "send_notification",
      label: "Notify citizen",
      description: "Send a status update notification to the complaint author",
      requiresConfirmation: true,
      params: { complaintId: context.complaintId },
      riskLevel: "safe",
    })
  }

  return {
    actions,
    explanation: actions.length > 0
      ? `${actions.length} recommended action${actions.length > 1 ? "s" : ""} available. All require confirmation before execution.`
      : "No actions recommended at this time.",
    provider: "fallback",
  }
}

// ---------- LLM-powered action recommendations ----------

export async function generateActionRecommendations(context: {
  complaintId?: string
  status?: string
  priority?: string
  hasOfficer?: boolean
  availableOfficers?: { id: string; name: string; workload: number }[]
}): Promise<AIActionRecommendation> {
  const fallback = generateDeterministicActions(context)

  const systemPrompt = `You are a municipal AI assistant recommending actions for complaints.
Recommend safe, actionable steps. Never recommend destructive actions without noting they need confirmation.
Return JSON: {"actions":[{"type":"assign_officer|change_status|escalate|send_notification","label":"string","description":"string","requiresConfirmation":true,"params":{},"riskLevel":"safe|moderate|dangerous"}],"explanation":"string"}
Return ONLY valid JSON, no markdown.`

  const userPrompt = `Context:
Complaint ID: ${context.complaintId || "N/A"}
Status: ${context.status || "N/A"}
Priority: ${context.priority || "N/A"}
Has officer: ${context.hasOfficer ? "Yes" : "No"}
Available officers: ${JSON.stringify(context.availableOfficers?.slice(0, 5) || [])}`

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
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
