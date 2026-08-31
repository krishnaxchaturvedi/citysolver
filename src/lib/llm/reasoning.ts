// ============================================================
// AI Reasoning Explanation
// Generates human-readable explanations of AI decisions.
// Shows WHY a priority was chosen, not internal chain-of-thought.
// ============================================================

import type { CategoryKey, Priority } from "@/lib/data"
import { callLLMWithFallback, type LLMMessage } from "./provider"

export interface ReasoningFactor {
  label: string
  detail: string
  weight: "high" | "medium" | "low"
}

export interface AIReasoningExplanation {
  factors: ReasoningFactor[]
  priority: Priority
  riskLevel: string
  confidence: number
  recommendedResponseTime: string
  summary: string
  provider: string
}

// ---------- Deterministic fallback ----------

const categoryBasePriority: Record<string, Priority> = {
  "Public Safety": "Critical",
  Pothole: "High",
  "Broken Streetlight": "High",
  "Water Leakage": "High",
  Garbage: "Medium",
  "Drainage Issue": "Medium",
  "Illegal Dumping": "Medium",
  Other: "Low",
}

const criticalKw = ["emergency", "immediate", "danger", "accident", "fire", "flood", "collapse", "death", "injury", "children", "school", "hospital", "live wire", "electrocution", "urgent", "severe", "highway", "main road"]
const highKw = ["dangerous", "risk", "night", "dark", "large", "deep", "blocked", "overflow", "urgent", "busy", "junction", "elderly", "heavy", "broken", "burst"]

const riskMap: Record<string, string> = { Critical: "Severe", High: "High", Medium: "Moderate", Low: "Low" }
const responseTimeMap: Record<string, string> = {
  Critical: "Immediate (within 24h)",
  High: "Urgent (within 48h)",
  Medium: "Normal (within 1 week)",
  Low: "Low (within 2 weeks)",
}

export function generateDeterministicReasoning(params: {
  category: CategoryKey
  description: string
  priority: Priority
  similarCount: number
  wardRiskScore: number
  citizenTrust: number
}): AIReasoningExplanation {
  const { category, description, priority, similarCount, wardRiskScore, citizenTrust } = params
  const desc = description.toLowerCase()
  const factors: ReasoningFactor[] = []

  // 1. Category risk
  const basePri = categoryBasePriority[category] || "Medium"
  factors.push({
    label: "1. Complaint category risk",
    detail: `"${category}" has a base priority of ${basePri}.`,
    weight: basePri === "Critical" ? "high" : basePri === "High" ? "medium" : "low",
  })

  // 2. Description severity
  const critHits = criticalKw.filter((k) => desc.includes(k))
  const highHits = highKw.filter((k) => desc.includes(k))
  let sevDetail = "No severity keywords detected."
  let sevWeight: "high" | "medium" | "low" = "low"
  if (critHits.length > 0) {
    sevDetail = `Critical keywords detected: ${critHits.slice(0, 3).join(", ")}`
    sevWeight = "high"
  } else if (highHits.length > 0) {
    sevDetail = `High-priority keywords detected: ${highHits.slice(0, 3).join(", ")}`
    sevWeight = "medium"
  }
  factors.push({ label: "2. Description severity", detail: sevDetail, weight: sevWeight })

  // 3. Location risk
  let locDetail = "No elevated location risk detected."
  let locWeight: "high" | "medium" | "low" = "low"
  if (wardRiskScore >= 75) {
    locDetail = `Ward risk score ${wardRiskScore}/100 — elevated risk area.`
    locWeight = "high"
  } else if (wardRiskScore >= 50) {
    locDetail = `Ward risk score ${wardRiskScore}/100 — moderate risk.`
    locWeight = "medium"
  }
  factors.push({ label: "3. Location risk", detail: locDetail, weight: locWeight })

  // 4. Similar complaints
  let simDetail = "No similar complaints nearby."
  let simWeight: "high" | "medium" | "low" = "low"
  if (similarCount >= 10) {
    simDetail = `${similarCount} similar complaints detected — indicates systemic issue.`
    simWeight = "high"
  } else if (similarCount >= 3) {
    simDetail = `${similarCount} similar complaints nearby.`
    simWeight = "medium"
  }
  factors.push({ label: "4. Similar complaints", detail: simDetail, weight: simWeight })

  // 5. Hotspot conditions
  let hotDetail = "No active hotspot conditions."
  let hotWeight: "high" | "medium" | "low" = "low"
  if (wardRiskScore >= 90) {
    hotDetail = "Area is an active hotspot with rising complaint volume."
    hotWeight = "high"
  } else if (similarCount >= 5) {
    hotDetail = "Emerging hotspot pattern detected."
    hotWeight = "medium"
  }
  factors.push({ label: "5. Current hotspot conditions", detail: hotDetail, weight: hotWeight })

  const confidence = Math.min(95, 60 + (critHits.length > 0 ? 15 : 0) + (similarCount > 0 ? 10 : 0) + (wardRiskScore > 0 ? 10 : 0))

  return {
    factors,
    priority,
    riskLevel: riskMap[priority] || "Moderate",
    confidence,
    recommendedResponseTime: responseTimeMap[priority] || "Normal (within 1 week)",
    summary: `Priority set to ${priority} based on category base (${basePri}), description severity, location risk, and complaint patterns.`,
    provider: "fallback",
  }
}

// ---------- LLM-powered reasoning ----------

export async function generateReasoningExplanation(params: {
  category: CategoryKey
  description: string
  priority: Priority
  similarCount: number
  wardRiskScore: number
  citizenTrust: number
}): Promise<AIReasoningExplanation> {
  const fallback = generateDeterministicReasoning(params)

  const systemPrompt = `You are a municipal AI explaining complaint priority decisions to citizens.
Explain WHY a priority was assigned using clear, human-readable factors.
Do NOT expose internal chain-of-thought. Only show user-facing explanations.
Return JSON: {"factors":[{"label":"string","detail":"string","weight":"high|medium|low"}],"priority":"string","riskLevel":"string","confidence":number,"recommendedResponseTime":"string","summary":"string"}
Use exactly 5 factors labeled "1." through "5." covering: category risk, description severity, location risk, similar complaints, hotspot conditions.
Return ONLY valid JSON, no markdown.`

  const userPrompt = `Explain the priority decision for this complaint:
Category: ${params.category}
Priority: ${params.priority}
Description: ${params.description}
Similar complaints nearby: ${params.similarCount}
Ward risk score: ${params.wardRiskScore}/100
Citizen trust score: ${params.citizenTrust}/100`

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]

  const response = await callLLMWithFallback(messages, () => JSON.stringify(fallback))

  if (response.provider === "fallback") return fallback

  try {
    const parsed = JSON.parse(response.text)
    return {
      ...parsed,
      provider: response.provider,
      confidence: Math.min(99, Math.max(1, parsed.confidence || fallback.confidence)),
    }
  } catch {
    return fallback
  }
}
