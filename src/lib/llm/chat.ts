// ============================================================
// AI Chat Assistant Engine
// Handles user questions about complaints, status, priorities,
// departments, officers, and city services.
// Uses LLM when available, falls back to deterministic responses.
// ============================================================

import { callLLMWithFallback, type LLMMessage } from "./provider"
import { buildSystemPrompt, type ChatContext } from "./context"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  actions?: { type: string; label: string; description: string; params: Record<string, string> }[]
  error?: boolean
}

export interface ChatResponse {
  message: ChatMessage
  provider: string
}

// ---------- Deterministic fallback ----------

export function generateDeterministicResponse(question: string, ctx: ChatContext): string {
  const q = question.toLowerCase()

  // "Where is my complaint?"
  if (q.includes("where") && (q.includes("complaint") || q.includes("my"))) {
    if (ctx.complaints.length === 0) return "You don't have any complaints yet. You can file a new complaint from the Report page."
    const latest = ctx.complaints[0]
    return `Your most recent complaint "${latest.title}" (ID: ${latest.id}) is at ${latest.location}. Current status: ${latest.status}.`
  }

  // "Why was my complaint marked high priority?"
  if (q.includes("why") && (q.includes("priority") || q.includes("high") || q.includes("critical"))) {
    if (ctx.complaints.length === 0) return "You don't have any complaints to analyze."
    const high = ctx.complaints.filter((c) => ["Critical", "High"].includes(c.priority))
    if (high.length === 0) return "None of your complaints are marked as high or critical priority."
    const c = high[0]
    return `Your complaint "${c.title}" was marked ${c.priority} priority based on the category (${c.category}), keywords in your description, and the location's risk profile. ${c.priority === "Critical" ? "Critical complaints require immediate attention within 24 hours." : "High priority complaints are addressed within 48 hours."}`
  }

  // "Which complaints are pending in my ward?"
  if (q.includes("pending") || q.includes("unresolved")) {
    const pending = ctx.complaints.filter((c) => !["Resolved", "Rejected"].includes(c.status))
    if (pending.length === 0) return "You have no pending complaints. All your complaints have been resolved or rejected."
    return `You have ${pending.length} pending complaint${pending.length > 1 ? "s" : ""}:\n${pending.map((c) => `• ${c.id}: "${c.title}" — ${c.status}`).join("\n")}`
  }

  // "How long will my complaint take?"
  if (q.includes("how long") || q.includes("timeline") || q.includes("when")) {
    if (ctx.complaints.length === 0) return "You don't have any complaints yet."
    const c = ctx.complaints[0]
    const timeMap: Record<string, string> = { Critical: "1-2 days", High: "3-5 days", Medium: "5-10 days", Low: "10-15 days" }
    const time = timeMap[c.priority] || "5-10 days"
    return `Your complaint "${c.title}" (${c.priority} priority) has an estimated resolution time of ${time} from when an officer is assigned. Current status: ${c.status}.`
  }

  // "What should I do if the issue is dangerous?"
  if (q.includes("danger") || q.includes("dangerous") || q.includes("risk") || q.includes("safety")) {
    return "If the issue poses immediate danger (live wires, flooding, structural damage), call the emergency services hotline immediately. In your complaint, mention 'danger' or 'emergency' in the description so it gets Critical priority and 24-hour response. You can also file a Public Safety category complaint for faster routing."
  }

  // "Show me my unresolved complaints"
  if (q.includes("show") || q.includes("list") || q.includes("all")) {
    if (ctx.complaints.length === 0) return "You don't have any complaints yet."
    return `Here are your complaints:\n${ctx.complaints.slice(0, 10).map((c) => `• ${c.id}: "${c.title}" — ${c.category} | ${c.priority} | ${c.status}`).join("\n")}`
  }

  // Questions about the currently analyzed photograph
  if (ctx.imageAnalysis && (q.includes("photograph") || q.includes("photo") || q.includes("image") || q.includes("picture"))) {
    const image = ctx.imageAnalysis
    if (q.includes("suitable") || q.includes("evidence") || q.includes("quality")) {
      return `This photograph is ${image.evidenceScore >= 70 ? "good" : image.evidenceScore >= 40 ? "usable but could be improved" : "not strong enough"} as complaint evidence. Its evidence quality score is ${image.evidenceScore}/100, while the detected issue confidence is ${image.confidence}%.`
    }
    if (q.includes("department") || q.includes("handle")) {
      return `The photograph most likely shows ${image.detectedCategory}. The suggested department is ${image.suggestedDepartment || "General Municipal Services"}.`
    }
    if (q.includes("action") || q.includes("should i") || q.includes("recommend")) {
      return image.recommendedAction || "Add the exact location, severity, and any immediate public safety impact before submitting."
    }
    return `The photograph most likely shows ${image.detectedCategory} with ${image.confidence}% confidence. ${image.evidence || "Add a clear description and exact location to help municipal staff verify it."}`
  }

  // Department questions
  if (q.includes("department") || q.includes("who handles")) {
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
    if (ctx.complaints.length > 0) {
      const c = ctx.complaints[0]
      return `Your "${c.category}" complaint is handled by the ${deptMap[c.category] || "General Municipal Services"}.`
    }
    return "Each complaint category is routed to a specific municipal department. For example, potholes go to Roads & Infrastructure, garbage to Sanitation & Waste Management."
  }

  // Officer questions
  if (q.includes("officer") || q.includes("assigned")) {
    if (ctx.complaints.length === 0) return "You don't have any complaints with officer assignments."
    const assigned = ctx.complaints.filter((c) => c.officer_id)
    if (assigned.length === 0) return "None of your complaints have been assigned to an officer yet. They are currently under review."
    return `${assigned.length} of your complaints have been assigned to an officer. The assigned officer will handle the resolution.`
  }

  // Default
  const suggestions = [
    "Try asking: 'Where is my complaint?'",
    "Or: 'Why was my complaint marked high priority?'",
    "Or: 'How long will my complaint take?'",
    "Or: 'Which complaints are pending?'",
  ]
  return `I can help you with your complaints, their status, priority, and resolution timeline. ${suggestions.join(" ")}`
}

// ---------- Main chat function ----------

export async function sendChatMessage(
  question: string,
  ctx: ChatContext,
  conversationHistory: ChatMessage[] = [],
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(ctx)
  const fallback = () => generateDeterministicResponse(question, ctx)

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory
      .slice(-10)
      .filter((m) => !m.error)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })) as LLMMessage[],
    { role: "user", content: question },
  ]

  const response = await callLLMWithFallback(messages, fallback)

  return {
    message: {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "assistant",
      content: response.text,
      timestamp: new Date().toISOString(),
    },
    provider: response.provider,
  }
}

// ---------- Suggested questions ----------

export function getSuggestedQuestions(role: "citizen" | "officer" | "admin"): string[] {
  if (role === "citizen") {
    return [
      "Where is my complaint?",
      "Why was my complaint marked high priority?",
      "How long will my complaint take?",
      "Which complaints are pending?",
      "What should I do if the issue is dangerous?",
      "What issue is visible in my photograph?",
      "Is this image suitable as complaint evidence?",
      "Which department should handle this issue?",
    ]
  }
  if (role === "officer") {
    return [
      "What are my assigned complaints?",
      "Which complaints need urgent attention?",
      "What's my current workload?",
      "How many complaints have I resolved?",
    ]
  }
  return [
    "Give me today's municipal briefing.",
    "Which complaints are critical?",
    "Are there any unusual complaint spikes?",
    "Which departments need more staffing?",
    "Show me SLA risks.",
  ]
}
