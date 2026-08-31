// ============================================================
// AI Follow-up Questions for Complaint Intake
// Detects missing information and suggests smart questions.
// Uses LLM when available, falls back to deterministic engine.
// ============================================================

import type { CategoryKey } from "@/lib/data"
import { callLLMWithFallback, type LLMMessage } from "./provider"

export interface SmartFollowUp {
  id: string
  question: string
  field: string
  category?: CategoryKey
}

// ---------- Deterministic fallback ----------

export function generateDeterministicFollowUps(params: {
  category: CategoryKey | ""
  description: string
  location: string
  hasImage: boolean
}): SmartFollowUp[] {
  const questions: SmartFollowUp[] = []
  const desc = params.description.toLowerCase()

  if (params.category === "Pothole") {
    if (!desc.match(/how (big|large|deep)/) && !desc.match(/\d+\s*(cm|inch|foot|meter)/)) {
      questions.push({ id: "size", question: "How large or deep is the pothole?", field: "description", category: "Pothole" })
    }
    if (!desc.includes("road") && !desc.includes("junction") && !desc.includes("street")) {
      questions.push({ id: "road_name", question: "Which road or junction is the pothole on?", field: "location", category: "Pothole" })
    }
    if (!desc.includes("traffic") && !desc.includes("blocked")) {
      questions.push({ id: "traffic", question: "Is the road completely blocked by the pothole?", field: "description", category: "Pothole" })
    }
  }

  if (params.category === "Garbage") {
    if (!desc.match(/\d+\s*(day|week)/) && !desc.includes("long")) {
      questions.push({ id: "duration", question: "How long has the garbage been piling up?", field: "description", category: "Garbage" })
    }
    if (!desc.includes("smell") && !desc.includes("health")) {
      questions.push({ id: "health", question: "Is the garbage causing health issues or bad odors?", field: "description", category: "Garbage" })
    }
  }

  if (params.category === "Broken Streetlight") {
    if (!desc.includes("night") && !desc.includes("dark")) {
      questions.push({ id: "darkness", question: "Is the area completely dark at night?", field: "description", category: "Broken Streetlight" })
    }
    if (!desc.includes("how many") && !desc.includes("number")) {
      questions.push({ id: "count", question: "How many streetlights are not working?", field: "description", category: "Broken Streetlight" })
    }
  }

  if (params.category === "Water Leakage") {
    if (!desc.includes("pipe") && !desc.includes("tap") && !desc.includes("main")) {
      questions.push({ id: "source", question: "Is it a pipe, tap, or main water line?", field: "description", category: "Water Leakage" })
    }
    if (!desc.includes("flow") && !desc.includes("still")) {
      questions.push({ id: "flowing", question: "Is water still flowing actively?", field: "description", category: "Water Leakage" })
    }
  }

  if (params.category === "Drainage Issue") {
    if (!desc.includes("stagnant") && !desc.includes("overflow")) {
      questions.push({ id: "overflow", question: "Is the drain overflowing or has stagnant water?", field: "description", category: "Drainage Issue" })
    }
  }

  if (params.category === "Public Safety") {
    if (!desc.includes("risk") && !desc.includes("danger")) {
      questions.push({ id: "risk", question: "Is anyone currently at risk from this hazard?", field: "description", category: "Public Safety" })
    }
    if (!desc.includes("wire") && !desc.includes("electrical") && !desc.includes("structural")) {
      questions.push({ id: "type", question: "What type of safety hazard is it?", field: "description", category: "Public Safety" })
    }
  }

  if (!params.location || params.location.length < 5) {
    questions.push({ id: "landmark", question: "Can you provide the nearest landmark?", field: "location" })
  }

  if (!params.hasImage) {
    questions.push({ id: "photo", question: "Can you upload a photo for evidence?", field: "image" })
  }

  return questions.slice(0, 5)
}

// ---------- LLM-powered follow-ups ----------

export async function generateFollowUpQuestions(params: {
  category: CategoryKey | ""
  description: string
  location: string
  hasImage: boolean
}): Promise<SmartFollowUp[]> {
  const fallback = generateDeterministicFollowUps(params)

  const systemPrompt = `You are a complaint intake AI. Detect missing information and suggest follow-up questions.
Return JSON array: [{"id":"string","question":"string","field":"description|location|image","category":"string"}]
Ask only about genuinely missing info. Max 5 questions. Return ONLY valid JSON, no markdown.`

  const userPrompt = `Complaint details:
Category: ${params.category || "Not selected"}
Description: ${params.description || "Empty"}
Location: ${params.location || "Not provided"}
Has photo: ${params.hasImage ? "Yes" : "No"}`

  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]

  try {
    const response = await callLLMWithFallback(messages, () => JSON.stringify(fallback))
    if (response.provider === "fallback") return fallback
    const parsed = JSON.parse(response.text)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 5)
    return fallback
  } catch {
    return fallback
  }
}
