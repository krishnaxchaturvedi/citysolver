import type { CategoryKey, Priority } from "@/lib/data"

// ============================================================
// AI Complaint Intake Assistant
// Real-time analysis during complaint creation:
// - Missing Information Detection
// - Smart Follow-up Questions
// - Duplicate Warning
// - Location Verification
// - Severity Verification
// - Category Verification
// - Completeness Score
// - AI Confidence Score
// - Risk Assessment
// ============================================================

export interface MissingInfoItem {
  field: string
  severity: "critical" | "important" | "optional"
  message: string
}

export interface FollowUpQuestion {
  id: string
  question: string
  field: string
  answered: boolean
}

export interface DuplicateWarning {
  isDuplicate: boolean
  probability: number
  reason: string
  existingId?: string
  existingTitle?: string
}

export interface LocationVerification {
  verified: boolean
  hasCoords: boolean
  hasAddress: boolean
  message: string
  suggestion?: string
}

export interface SeverityVerification {
  confirmed: boolean
  suggestedPriority: Priority
  currentPriority: Priority | ""
  reason: string
  keywords: string[]
}

export interface CategoryVerification {
  confirmed: boolean
  suggestedCategory: CategoryKey
  currentCategory: CategoryKey | ""
  confidence: number
  reason: string
}

export type RiskLevel = "low" | "moderate" | "high" | "severe"

export interface IntakeAnalysisResult {
  completenessScore: number
  confidenceScore: number
  riskAssessment: RiskLevel
  riskScore: number
  missingInfo: MissingInfoItem[]
  followUpQuestions: FollowUpQuestion[]
  duplicateWarning: DuplicateWarning
  locationVerification: LocationVerification
  severityVerification: SeverityVerification
  categoryVerification: CategoryVerification
  ready: boolean
}

// ---------- Category keyword maps for verification ----------

const categoryKeywords: Record<CategoryKey, { en: string[]; hi: string[] }> = {
  Pothole: { en: ["pothole", "crater", "road damage", "cracked", "broken road", "ditch", "speed breaker"], hi: ["गड्ढा", "सड़क", "खराब"] },
  Garbage: { en: ["garbage", "trash", "waste", "rubbish", "bin", "overflow", "litter", "dustbin"], hi: ["कचरा", "कूड़ा", "गंदगी"] },
  "Broken Streetlight": { en: ["streetlight", "street light", "lamp", "light not working", "dark", "pole", "bulb"], hi: ["स्ट्रीटलाइट", "लाइट", "अंधेरा"] },
  "Water Leakage": { en: ["water", "leak", "pipe", "burst", "flooding", "wet", "tap", "flowing"], hi: ["पानी", "रिसाव", "पाइप", "नल"] },
  "Drainage Issue": { en: ["drain", "drainage", "sewage", "blocked", "overflow", "waterlogging", "stagnant", "manhole"], hi: ["नाली", "मार्ग", "जलभराव"] },
  "Illegal Dumping": { en: ["dumping", "debris", "construction waste", "rubble", "dumped", "illegal"], hi: ["मलबा", "डंपिंग", "कचरा"] },
  "Public Safety": { en: ["wire", "electrical", "hazard", "danger", "electrocution", "safety", "exposed", "accident"], hi: ["तार", "बिजली", "खतरा"] },
  Other: { en: [], hi: [] },
}

function getCategoryKeywords(cat: CategoryKey): { en: string[]; hi: string[] } {
  return categoryKeywords[cat] || { en: [], hi: [] }
}

// ---------- Severity keyword maps ----------

const criticalKeywords = ["emergency", "immediate", "danger", "accident", "fire", "flood", "collapse", "death", "injury", "children", "school", "hospital", "live wire", "electrocution", "urgent", "severe", "highway", "main road"]
const highKeywords = ["dangerous", "risk", "night", "dark", "large", "deep", "blocked", "overflow", "urgent", "busy", "junction", "elderly", "heavy", "broken", "burst"]
const mediumKeywords = ["moderate", "minor", "small", "some", "few", "occasionally", "sometimes"]
const lowKeywords = ["minor", "small", "slight", "not urgent", "whenever", "no rush", "minor crack"]

function detectSeverityFromText(text: string): { priority: Priority; keywords: string[] } {
  const lower = text.toLowerCase()
  const matched: string[] = []

  for (const k of criticalKeywords) {
    if (lower.includes(k)) matched.push(k)
  }
  if (matched.length > 0) return { priority: "Critical", keywords: matched }

  for (const k of highKeywords) {
    if (lower.includes(k)) matched.push(k)
  }
  if (matched.length > 0) return { priority: "High", keywords: matched }

  for (const k of mediumKeywords) {
    if (lower.includes(k)) matched.push(k)
  }
  if (matched.length > 0) return { priority: "Medium", keywords: matched }

  for (const k of lowKeywords) {
    if (lower.includes(k)) matched.push(k)
  }
  if (matched.length > 0) return { priority: "Low", keywords: matched }

  return { priority: "Medium", keywords: [] }
}

// ---------- Main analysis function ----------

export function analyzeIntake(params: {
  category: CategoryKey | ""
  description: string
  location: string
  hasCoords: boolean
  hasImage: boolean
  priority: Priority | ""
  existingComplaints?: { id: string; title: string; category: CategoryKey; description: string; lat: number; lng: number }[]
  lat?: number
  lng?: number
}): IntakeAnalysisResult {
  const { category, description, location, hasCoords, hasImage, priority } = params

  // --- Missing Information Detection ---
  const missingInfo: MissingInfoItem[] = []

  if (!category) {
    missingInfo.push({ field: "category", severity: "critical", message: "Please select an issue category" })
  }
  if (description.length < 20) {
    missingInfo.push({ field: "description", severity: "critical", message: "Description is too short — provide at least 20 characters" })
  }
  if (!location && !hasCoords) {
    missingInfo.push({ field: "location", severity: "critical", message: "Please provide a location or use GPS auto-detect" })
  }
  if (!hasImage) {
    missingInfo.push({ field: "image", severity: "important", message: "Adding a photo strengthens your complaint" })
  }
  if (!priority) {
    missingInfo.push({ field: "priority", severity: "important", message: "Select a priority level" })
  }
  if (description.length > 0 && description.length < 50) {
    missingInfo.push({ field: "description_detail", severity: "optional", message: "More details would help officers respond faster" })
  }

  // --- Smart Follow-up Questions ---
  const followUpQuestions: FollowUpQuestion[] = []
  const descLower = description.toLowerCase()

  if (category === "Pothole" && description.length > 10) {
    if (!descLower.match(/how (big|large|deep)/) && !descLower.match(/\d+\s*(cm|inch|foot|meter|metre)/)) {
      followUpQuestions.push({ id: "pothole_size", question: "How large or deep is the pothole?", field: "description", answered: false })
    }
    if (!descLower.includes("traffic") && !descLower.includes("road") && !descLower.includes("junction")) {
      followUpQuestions.push({ id: "pothole_road", question: "Which road or junction is the pothole on?", field: "location", answered: false })
    }
  }

  if (category === "Garbage" && description.length > 10) {
    if (!descLower.match(/how (many|much)/) && !descLower.match(/\d+\s*(day|week)/)) {
      followUpQuestions.push({ id: "garbage_duration", question: "How long has the garbage been piling up?", field: "description", answered: false })
    }
  }

  if (category === "Broken Streetlight" && description.length > 10) {
    if (!descLower.includes("night") && !descLower.includes("dark")) {
      followUpQuestions.push({ id: "streetlight_area", question: "Is the area completely dark at night?", field: "description", answered: false })
    }
  }

  if (category === "Water Leakage" && description.length > 10) {
    if (!descLower.includes("pipe") && !descLower.includes("tap") && !descLower.includes("main")) {
      followUpQuestions.push({ id: "water_source", question: "Is it a pipe, tap, or main water line?", field: "description", answered: false })
    }
  }

  if (category === "Public Safety" && description.length > 10) {
    if (!descLower.includes("wire") && !descLower.includes("electrical") && !descLower.includes("hazard")) {
      followUpQuestions.push({ id: "safety_type", question: "What type of safety hazard is it?", field: "description", answered: false })
    }
  }

  if (!location && !hasCoords && description.length > 10) {
    followUpQuestions.push({ id: "location_detail", question: "Can you provide a nearby landmark or street name?", field: "location", answered: false })
  }

  // --- Duplicate Warning ---
  let duplicateWarning: DuplicateWarning = { isDuplicate: false, probability: 0, reason: "No duplicate complaints detected" }
  if (params.existingComplaints && params.existingComplaints.length > 0 && category && description.length > 20) {
    let bestMatch: typeof params.existingComplaints[0] | null = null
    let bestProb = 0
    let bestReason = ""

    for (const c of params.existingComplaints) {
      if (c.category !== category) continue
      const descWords = new Set(descLower.split(/\s+/).filter((w) => w.length > 3))
      const existingWords = new Set(c.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3))
      let common = 0
      for (const w of descWords) if (existingWords.has(w)) common++
      const union = descWords.size + existingWords.size - common
      const textSim = union > 0 ? (common / union) * 100 : 0

      let locSim = 0
      if (params.lat !== undefined && params.lng !== undefined) {
        const dx = (c.lat - params.lat) * 111
        const dy = (c.lng - params.lng) * 111
        const dist = Math.sqrt(dx * dx + dy * dy) * 1000
        locSim = Math.max(0, 100 - dist / 10)
      }

      const prob = Math.round(textSim * 0.6 + locSim * 0.4)
      if (prob > bestProb && prob > 30) {
        bestProb = prob
        bestMatch = c
        bestReason = `Similar complaint found with ${Math.round(textSim)}% text match`
        if (locSim > 50) bestReason += ` and nearby location`
      }
    }

    if (bestMatch) {
      duplicateWarning = {
        isDuplicate: bestProb > 60,
        probability: bestProb,
        reason: bestReason,
        existingId: bestMatch.id,
        existingTitle: bestMatch.title,
      }
    }
  }

  // --- Location Verification ---
  const locationVerification: LocationVerification = {
    verified: location.length >= 3 || hasCoords,
    hasCoords,
    hasAddress: location.length >= 3,
    message: hasCoords
      ? "Location coordinates detected"
      : location.length >= 3
        ? "Address provided"
        : "Please provide a specific address or use GPS",
    suggestion: !hasCoords && location.length < 3 ? "Use Auto Detect GPS for precise location" : undefined,
  }

  // --- Severity Verification ---
  const detected = detectSeverityFromText(description)
  const severityVerification: SeverityVerification = {
    confirmed: priority === detected.priority || priority === "",
    suggestedPriority: detected.priority,
    currentPriority: priority,
    reason: detected.keywords.length > 0
      ? `Keywords detected: ${detected.keywords.slice(0, 3).join(", ")}`
      : "No severity keywords found — defaulting to Medium",
    keywords: detected.keywords,
  }

  // --- Category Verification ---
  let categoryVerification: CategoryVerification = {
    confirmed: true,
    suggestedCategory: (category || "Other") as CategoryKey,
    currentCategory: category,
    confidence: 50,
    reason: "No category selected",
  }

  if (category && description.length > 10) {
    const catKw = getCategoryKeywords(category as CategoryKey)
    const allCatKeywords = [...catKw.en, ...catKw.hi]
    const hits = allCatKeywords.filter((k) => descLower.includes(k.toLowerCase()))

    // Check if other categories match better
    let bestCat = category as CategoryKey
    let bestHits = hits.length
    let bestConfidence = hits.length > 0 ? Math.min(95, 50 + hits.length * 15) : 50

    for (const cKey of Object.keys(categoryKeywords) as CategoryKey[]) {
      if (cKey === category || cKey === "Other") continue
      const kw = getCategoryKeywords(cKey)
      const allKw = [...kw.en, ...kw.hi]
      const otherHits = allKw.filter((k) => descLower.includes(k.toLowerCase()))
      if (otherHits.length > bestHits) {
        bestHits = otherHits.length
        bestCat = cKey
        bestConfidence = Math.min(95, 50 + otherHits.length * 15)
      }
    }

    categoryVerification = {
      confirmed: bestCat === category,
      suggestedCategory: bestCat,
      currentCategory: category,
      confidence: bestConfidence,
      reason: bestCat === category
        ? `Category matches description (${hits.length} keyword matches)`
        : `Description better matches "${bestCat}" category`,
    }
  }

  // --- Completeness Score ---
  let completeness = 0
  if (category) completeness += 20
  if (description.length >= 20) completeness += 20
  if (description.length >= 50) completeness += 10
  if (location.length >= 3 || hasCoords) completeness += 20
  if (hasImage) completeness += 15
  if (priority) completeness += 10
  if (description.length >= 100) completeness += 5
  completeness = Math.min(100, completeness)

  // --- AI Confidence Score ---
  let confidence = 30
  if (category) confidence += 15
  if (description.length >= 20) confidence += 15
  if (description.length >= 50) confidence += 10
  if (location.length >= 3 || hasCoords) confidence += 15
  if (hasImage) confidence += 10
  if (priority) confidence += 5
  if (categoryVerification.confirmed) confidence += 5
  if (severityVerification.confirmed) confidence += 5
  if (duplicateWarning.isDuplicate) confidence -= 10
  confidence = Math.max(10, Math.min(98, confidence))

  // --- Risk Assessment ---
  let riskScore = 0
  if (detected.priority === "Critical") riskScore += 40
  else if (detected.priority === "High") riskScore += 25
  else if (detected.priority === "Medium") riskScore += 15
  else riskScore += 5

  if (duplicateWarning.isDuplicate) riskScore += 15
  if (!hasImage) riskScore += 10
  if (!locationVerification.verified) riskScore += 15
  if (description.length < 50) riskScore += 10
  if (missingInfo.filter((m) => m.severity === "critical").length > 0) riskScore += 10
  riskScore = Math.min(100, riskScore)

  const riskLevel: RiskLevel = riskScore >= 75 ? "severe" : riskScore >= 50 ? "high" : riskScore >= 25 ? "moderate" : "low"

  // --- Ready ---
  const criticalMissing = missingInfo.filter((m) => m.severity === "critical").length
  const ready = criticalMissing === 0 && completeness >= 60

  return {
    completenessScore: completeness,
    confidenceScore: confidence,
    riskAssessment: riskLevel,
    riskScore,
    missingInfo,
    followUpQuestions,
    duplicateWarning,
    locationVerification,
    severityVerification,
    categoryVerification,
    ready,
  }
}


