// ============================================================
// Complaint AI Summary
// Generates structured AI summaries for individual complaints.
// Uses LLM when available, falls back to deterministic engine.
// ============================================================

import type { CategoryKey, Priority } from "@/lib/data"
import { callLLMWithFallback, type LLMMessage } from "./provider"

export interface ComplaintAISummary {
  oneLineSummary: string
  detailedSummary: string
  detectedIssue: string
  location: string
  severity: string
  keyEvidence: string[]
  recommendedAction: string
  expectedResolution: string
  confidenceScore: number
  provider: string
}

// ---------- Deterministic fallback ----------

const departmentMap: Record<string, string> = {
  Pothole: "Roads & Infrastructure Department",
  Garbage: "Sanitation & Waste Management",
  "Broken Streetlight": "Electrical & Lighting Division",
  "Water Leakage": "Water Works & Plumbing",
  "Drainage Issue": "Drainage & Storm Water Division",
  "Illegal Dumping": "Sanitation & Waste Management",
  "Public Safety": "Public Safety & Emergency Services",
  Other: "General Municipal Services",
}

const resolutionMap: Record<string, string> = {
  Critical: "1-2 days",
  High: "3-5 days",
  Medium: "5-10 days",
  Low: "10-15 days",
}

export function generateDeterministicSummary(complaint: {
  id: string
  title: string
  category: CategoryKey
  description: string
  priority: Priority
  location: string
  image_url?: string | null
  status?: string
}): ComplaintAISummary {
  const dept = departmentMap[complaint.category] || departmentMap.Other
  const resolution = resolutionMap[complaint.priority] || "5-10 days"

  const evidence: string[] = []
  if (complaint.image_url) evidence.push("Photo evidence provided")
  evidence.push(`Category classified as ${complaint.category}`)
  evidence.push(`Priority assessed as ${complaint.priority}`)
  if (complaint.description.length > 100) evidence.push("Detailed description provided")

  const confidence = Math.min(
    95,
    50 + (complaint.description.length > 50 ? 15 : 0) + (complaint.image_url ? 15 : 0) + (complaint.location ? 10 : 0) + 5,
  )

  return {
    oneLineSummary: `${complaint.category} issue at ${complaint.location} — ${complaint.priority} priority`,
    detailedSummary: `Complaint ${complaint.id} reports a ${complaint.category.toLowerCase()} problem at ${complaint.location}. ${complaint.description.slice(0, 200)}${complaint.description.length > 200 ? "..." : ""} The issue has been classified as ${complaint.priority} priority and routed to the ${dept}.`,
    detectedIssue: complaint.category,
    location: complaint.location,
    severity: complaint.priority,
    keyEvidence: evidence,
    recommendedAction: `Route to ${dept}. ${complaint.priority === "Critical" ? "Immediate dispatch required." : "Schedule inspection and repair."}`,
    expectedResolution: `Estimated ${resolution} from assignment`,
    confidenceScore: confidence,
    provider: "fallback",
  }
}

// ---------- LLM-powered summary ----------

export async function generateComplaintSummary(complaint: {
  id: string
  title: string
  category: CategoryKey
  description: string
  priority: Priority
  location: string
  image_url?: string | null
  status?: string
}): Promise<ComplaintAISummary> {
  const fallback = () => JSON.stringify(generateDeterministicSummary(complaint))

  const systemPrompt = `You are a municipal complaint analysis AI. Analyze the complaint and return a JSON object with these exact fields:
{
  "oneLineSummary": "string",
  "detailedSummary": "string",
  "detectedIssue": "string",
  "location": "string",
  "severity": "string",
  "keyEvidence": ["string"],
  "recommendedAction": "string",
  "expectedResolution": "string",
  "confidenceScore": number
}
Return ONLY valid JSON, no markdown.`

  const userPrompt = `Analyze this complaint:
ID: ${complaint.id}
Title: ${complaint.title}
Category: ${complaint.category}
Priority: ${complaint.priority}
Location: ${complaint.location}
Description: ${complaint.description}
Has Photo: ${complaint.image_url ? "Yes" : "No"}
Status: ${complaint.status || "Submitted"}`

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]

  const response = await callLLMWithFallback(messages, fallback)

  if (response.provider === "fallback") {
    return generateDeterministicSummary(complaint)
  }

  try {
    const parsed = JSON.parse(response.text)
    return {
      ...parsed,
      provider: response.provider,
      confidenceScore: Math.min(99, Math.max(1, parsed.confidenceScore || 80)),
    }
  } catch {
    return generateDeterministicSummary(complaint)
  }
}
