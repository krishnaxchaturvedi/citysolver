import type { CategoryKey, Priority } from "@/lib/data"

// ============================================================
// Speech Analysis — parse transcribed complaint text and
// auto-generate title, description, category, and priority.
// Supports English, Hindi (Devanagari), and Hinglish.
// ============================================================

export interface SpeechAnalysisResult {
  category: CategoryKey
  title: string
  description: string
  priority: Priority
  detectedKeywords: string[]
  language: "English" | "Hindi" | "Hinglish"
  confidence: number
}

interface CategoryRule {
  category: CategoryKey
  priority: Priority
  keywords: { en: string[]; hi: string[]; hinglish: string[] }
}

const categoryRules: CategoryRule[] = [
  {
    category: "Pothole",
    priority: "High",
    keywords: {
      en: ["pothole", "potholes", "road damage", "crater", "cracked road", "broken road", "road surface", "ditch"],
      hi: ["गड्ढा", "गड्ढे", "सड़क टूटी", "सड़क खराब", "रास्ता टूटा", "रास्ता खराब"],
      hinglish: ["gaddha", "gadha", "gadde", "sadak tooti", "sadak kharab", "rasta toota", "rasta kharab", "pothole"],
    },
  },
  {
    category: "Garbage",
    priority: "Medium",
    keywords: {
      en: ["garbage", "trash", "waste", "rubbish", "bin overflowing", "litter", "garbage collection", "dustbin"],
      hi: ["कचरा", "कूड़ा", "डस्टबिन", "कचरा इकट्ठा", "गंदगी"],
      hinglish: ["kachra", "kooda", "koora", "dustbin", "gandagi", "ganda", "kachra"],
    },
  },
  {
    category: "Broken Streetlight",
    priority: "High",
    keywords: {
      en: ["streetlight", "street light", "lamp", "light not working", "light broken", "dark street", "no light", "pole"],
      hi: ["स्ट्रीटलाइट", "लाइट नहीं", "बत्ती", "लाइट खराब", "सड़क अंधेरी", "बल्ब"],
      hinglish: ["streetlight", "light nahi", "batti", "light kharab", "bulb", "andhera", "light band"],
    },
  },
  {
    category: "Water Leakage",
    priority: "High",
    keywords: {
      en: ["water leakage", "pipe burst", "water pipe", "leaking water", "water flowing", "pipe broken", "water waste", "tap"],
      hi: ["पानी रिसाव", "पाइप फटा", "पानी का पाइप", "पानी बहाव", "नल", "पानी बर्बाद"],
      hinglish: ["paani", "pani", "pipe phata", "paani ka pipe", "pani ka pipe", "nal", "paani beh", "pani beh"],
    },
  },
  {
    category: "Drainage Issue",
    priority: "Medium",
    keywords: {
      en: ["drain", "drainage", "sewage", "blocked drain", "overflow drain", "waterlogging", "water logging", "stagnant water", "manhole"],
      hi: ["नाली", "नाली बंद", "नाली ओवरफ्लो", "जलभराव", "पानी भर गया", "सीवर"],
      hinglish: ["nali", "naali", "nali band", "nali overflow", "jalbharaav", "pani bhar", "sewer", "manhole"],
    },
  },
  {
    category: "Illegal Dumping",
    priority: "Medium",
    keywords: {
      en: ["illegal dumping", "construction debris", "rubble", "dumped waste", "dumping site", "debris on road", "construction waste"],
      hi: ["अवैध डंपिंग", "मलबा", "निर्माण कचरा", "कचरा फेंका", "डंपिंग"],
      hinglish: ["dumping", "malba", "debris", "construction waste", "kachra phenka", "rubble"],
    },
  },
  {
    category: "Public Safety",
    priority: "Critical",
    keywords: {
      en: ["live wire", "exposed wire", "electrical hazard", "danger", "unsafe", "electrocution", "hanging wire", "broken tree", "falling branch", "accident"],
      hi: ["तार टूटी", "बिजली का तार", "खतरनाक", "दुर्घटना", "सुरक्षा", "तार लटक"],
      hinglish: ["live wire", "taar tooti", "bijli ka taar", "khatarnak", "durghatna", "suraksha", "taar latka"],
    },
  },
]

const criticalKeywords = {
  en: ["emergency", "immediate", "danger", "accident", "fire", "flood", "collapse", "death", "injury", "children", "school", "hospital", "urgent"],
  hi: ["आपातकालीन", "तुरंत", "खतरा", "दुर्घटना", "आग", "बाढ़", "मृत्यु", "चोट", "बच्चे", "स्कूल", "अस्पताल"],
  hinglish: ["emergency", "turant", "khatra", "durghatna", "aag", "baadh", "mrityu", "chot", "bacche", "school", "aspatal", "urgent"],
}

function detectLanguageLabel(text: string): "English" | "Hindi" | "Hinglish" {
  if (/[\u0900-\u097F]/.test(text)) return "Hindi"
  const lower = text.toLowerCase()
  const hinglishWords = ["sadak", "paani", "kachra", "nali", "bijli", "ganda", "kharab", "toota", "phata", "gaddha", "kooda", "bheja"]
  const words = lower.split(/\s+/)
  const hits = words.filter((w) => hinglishWords.includes(w.replace(/[^a-z]/g, "")))
  if (hits.length >= 2) return "Hinglish"
  return "English"
}

function countKeywordMatches(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase()
  return keywords.filter((k) => lower.includes(k.toLowerCase()))
}

export function analyzeSpeech(transcript: string): SpeechAnalysisResult {
  const language = detectLanguageLabel(transcript)
  const lower = transcript.toLowerCase()

  let bestCategory: CategoryKey = "Other"
  let bestPriority: Priority = "Low"
  let bestMatchCount = 0
  let bestKeywords: string[] = []

  for (const rule of categoryRules) {
    const allKeywords = [
      ...rule.keywords.en,
      ...rule.keywords.hi,
      ...rule.keywords.hinglish,
    ]
    const matched = countKeywordMatches(lower, allKeywords)
    if (matched.length > bestMatchCount) {
      bestMatchCount = matched.length
      bestCategory = rule.category
      bestPriority = rule.priority
      bestKeywords = matched
    }
  }

  // Check for critical keywords to escalate priority
  const allCritical = [
    ...criticalKeywords.en,
    ...criticalKeywords.hi,
    ...criticalKeywords.hinglish,
  ]
  const criticalHits = countKeywordMatches(lower, allCritical)
  if (criticalHits.length > 0) {
    bestPriority = "Critical"
  }

  // Generate title — first sentence or first 60 chars
  const sentences = transcript.split(/[।.!?]/).map((s) => s.trim()).filter(Boolean)
  let title = sentences[0] || transcript.trim()
  if (title.length > 60) title = title.slice(0, 57) + "..."

  // If no good title from speech, generate from category
  if (!title) {
    const catLabel = bestCategory === "Other" ? "Civic Issue" : bestCategory
    title = `${catLabel} reported via voice`
  }

  // Generate description — full transcript, cleaned up
  let description = transcript.trim()
  if (!description) {
    description = "Complaint reported via voice input. Please review and add details."
  }
  if (description.length < 20) {
    description += " — reported through voice complaint."
  }

  // Confidence based on keyword match density
  const wordCount = transcript.split(/\s+/).filter(Boolean).length
  const confidence = wordCount > 0
    ? Math.min(95, Math.round(40 + (bestMatchCount / Math.max(wordCount, 1)) * 200 + bestMatchCount * 10))
    : 30

  return {
    category: bestCategory,
    title,
    description,
    priority: bestPriority,
    detectedKeywords: [...new Set([...bestKeywords, ...criticalHits])],
    language,
    confidence,
  }
}
