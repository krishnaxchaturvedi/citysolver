import type {
  CategoryKey,
  Priority,
  Complaint,
  Officer,
  Profile,
} from "@/lib/supabase/types"

// ============================================================
// AI Intelligence Layer - Pure utility functions
// Modular so each can be replaced with OpenAI/Gemini later.
// All functions are pure: pass data in, get predictions out.
// ============================================================

// ---------- Text similarity ----------

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => w.replace(/[^a-z0-9]/g, ""))
}

export function jaccardSimilarity(a: string, b: string): number {
  const sa = new Set(tokenize(a))
  const sb = new Set(tokenize(b))
  if (sa.size === 0 && sb.size === 0) return 0
  let common = 0
  for (const w of sa) if (sb.has(w)) common++
  const union = sa.size + sb.size - common
  return union === 0 ? 0 : common / union
}

export function cosineSimilarity(a: string, b: string): number {
  const ta = tokenize(a)
  const tb = tokenize(b)
  const freqA = new Map<string, number>()
  const freqB = new Map<string, number>()
  for (const w of ta) freqA.set(w, (freqA.get(w) || 0) + 1)
  for (const w of tb) freqB.set(w, (freqB.get(w) || 0) + 1)
  let dot = 0
  for (const [w, v] of freqA) {
    const bv = freqB.get(w)
    if (bv) dot += v * bv
  }
  let magA = 0
  let magB = 0
  for (const v of freqA.values()) magA += v * v
  for (const v of freqB.values()) magB += v * v
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

// ---------- Geo distance ----------

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ---------- Duplicate detection ----------

export interface DuplicateResult {
  duplicateProbability: number
  nearestComplaint: Complaint
  distance: string
  similarity: number
  assignedOfficer: string
  currentStatus: Complaint["status"]
}

export function detectDuplicateComplaint(
  category: CategoryKey,
  title: string,
  description: string,
  lat: number,
  lng: number,
  existing: Complaint[],
): DuplicateResult | null {
  if (!category || description.length < 10 || existing.length === 0) return null

  let best: Complaint | null = null
  let bestSim = 0
  let bestDist = ""
  let bestProb = 0

  for (const c of existing) {
    if (c.category !== category) continue
    const textSim = cosineSimilarity(description, c.description) * 100
    const titleSim = jaccardSimilarity(title || description, c.title) * 100
    const meters = haversineMeters(lat, lng, c.lat, c.lng)
    const locProx = Math.max(0, 100 - meters / 10)
    const sim = Math.round(textSim * 0.45 + titleSim * 0.15 + locProx * 0.4)
    const prob = Math.min(98, Math.round(sim * 0.9 + (textSim > 50 ? 8 : 0)))
    if (sim > bestSim && sim > 20) {
      bestSim = sim
      best = c
      bestDist = `${Math.round(meters)}m`
      bestProb = prob
    }
  }

  if (!best) return null
  return {
    duplicateProbability: bestProb,
    nearestComplaint: best,
    distance: bestDist,
    similarity: bestSim,
    assignedOfficer: best.officer_id || "Not yet assigned",
    currentStatus: best.status,
  }
}

// ---------- Priority engine ----------

export interface PriorityResult {
  priority: Priority
  severity: number
  riskLevel: string
  urgency: string
  estimatedResolutionTime: string
  confidence: number
  reasoning: string[]
}

const categoryBasePriority: Record<CategoryKey, "Critical" | "High" | "Medium" | "Low"> = {
  "Public Safety": "Critical",
  Pothole: "High",
  "Broken Streetlight": "High",
  "Water Leakage": "High",
  Garbage: "Medium",
  "Drainage Issue": "Medium",
  "Illegal Dumping": "Medium",
  Other: "Low",
}

const criticalKeywords = [
  "highway", "main road", "arterial", "live wire", "electrocution", "flood",
  "burst", "explosion", "collapse", "accident", "fatal", "death", "injury",
  "emergency", "danger", "hospital", "school", "children",
]

const highKeywords = [
  "dangerous", "risk", "night", "dark", "large", "deep", "blocked",
  "overflow", "urgent", "busy", "junction", "elderly",
]

const resolutionTimeMap: Record<Priority, string> = {
  Critical: "1-2 days",
  High: "3-5 days",
  Medium: "5-10 days",
  Low: "10-15 days",
}

export function calculatePriority(
  category: CategoryKey,
  description: string,
  similarCount: number,
  citizenTrust: number,
  wardRiskScore: number,
): PriorityResult {
  const desc = description.toLowerCase()
  let priority: Priority = categoryBasePriority[category] || "Medium"

  if (criticalKeywords.some(k => desc.includes(k))) priority = "Critical"
  else if (highKeywords.some(k => desc.includes(k))) priority = "High"

  // Ward risk score (0-100) bumps priority
  if (wardRiskScore >= 75 && priority !== "Critical") priority = "High"
  if (wardRiskScore >= 90) priority = "Critical"

  // Similar complaint surge
  if (similarCount >= 10 && priority === "Medium") priority = "High"
  if (similarCount >= 20 && priority !== "Critical") priority = "Critical"

  // Low-reputation citizen slightly dampens
  if (citizenTrust < 30 && priority === "Critical") priority = "High"

  const severityMap: Record<Priority, number> = {
    Critical: 90 + Math.floor(Math.random() * 10),
    High: 70 + Math.floor(Math.random() * 15),
    Medium: 40 + Math.floor(Math.random() * 20),
    Low: 10 + Math.floor(Math.random() * 25),
  }

  const riskMap: Record<Priority, string> = {
    Critical: "Severe",
    High: "High",
    Medium: "Moderate",
    Low: "Low",
  }

  const urgencyMap: Record<Priority, string> = {
    Critical: "Immediate (within 24h)",
    High: "Urgent (within 48h)",
    Medium: "Normal (within 1 week)",
    Low: "Low (within 2 weeks)",
  }

  let confidence = 70
  if (description.length > 100) confidence += 8
  if (similarCount > 0) confidence += 7
  if (wardRiskScore > 0) confidence += 5
  confidence = Math.min(confidence, 95)

  const reasoning: string[] = []
  reasoning.push(`Category "${category}" has a base priority of ${categoryBasePriority[category]}.`)
  if (criticalKeywords.some(k => desc.includes(k)))
    reasoning.push(`Description contains critical keyword(s), escalating to Critical.`)
  else if (highKeywords.some(k => desc.includes(k)))
    reasoning.push(`Description contains high-priority keyword(s), escalating to High.`)
  if (wardRiskScore >= 75)
    reasoning.push(`Ward risk score ${wardRiskScore}/100 is elevated, increasing priority.`)
  if (similarCount >= 5)
    reasoning.push(`${similarCount} similar complaints nearby — indicates a systemic issue.`)
  if (citizenTrust < 30)
    reasoning.push(`Citizen trust score ${citizenTrust}/100 is low — priority dampened slightly.`)
  reasoning.push(`Final priority: ${priority}.`)

  return {
    priority,
    severity: severityMap[priority],
    riskLevel: riskMap[priority],
    urgency: urgencyMap[priority],
    estimatedResolutionTime: resolutionTimeMap[priority],
    confidence,
    reasoning,
  }
}

// ---------- Root cause analysis ----------

export interface RootCause {
  cause: string
  confidence: number
}

const rootCauseMap: Record<CategoryKey, RootCause[]> = {
  Pothole: [
    { cause: "Water seepage weakening road base", confidence: 82 },
    { cause: "Heavy vehicle traffic stress", confidence: 71 },
    { cause: "Poor maintenance schedule", confidence: 65 },
    { cause: "Substandard road material", confidence: 48 },
  ],
  Garbage: [
    { cause: "Collection route disruption", confidence: 78 },
    { cause: "Insufficient bin capacity", confidence: 64 },
    { cause: "High waste generation zone", confidence: 55 },
    { cause: "Lack of public awareness", confidence: 42 },
  ],
  "Broken Streetlight": [
    { cause: "Upstream electrical fault", confidence: 80 },
    { cause: "Aging infrastructure", confidence: 68 },
    { cause: "Weather damage", confidence: 52 },
    { cause: "Vandalism", confidence: 35 },
  ],
  "Water Leakage": [
    { cause: "Corrosion-induced pipe rupture", confidence: 85 },
    { cause: "Excessive water pressure", confidence: 60 },
    { cause: "Aging pipe network (25+ years)", confidence: 72 },
    { cause: "Poor joint sealing", confidence: 45 },
  ],
  "Drainage Issue": [
    { cause: "Sediment buildup over time", confidence: 79 },
    { cause: "Debris entry from unsealed covers", confidence: 66 },
    { cause: "Inadequate gradient", confidence: 50 },
    { cause: "Monsoon overload", confidence: 58 },
  ],
  "Illegal Dumping": [
    { cause: "Contractor avoiding disposal fees", confidence: 76 },
    { cause: "Lack of surveillance", confidence: 62 },
    { cause: "Insufficient enforcement", confidence: 55 },
    { cause: "Remote location enabling anonymity", confidence: 48 },
  ],
  "Public Safety": [
    { cause: "Wind damage to fixtures", confidence: 68 },
    { cause: "Vehicle contact", confidence: 55 },
    { cause: "Inspection cycle gaps", confidence: 60 },
    { cause: "Aging infrastructure", confidence: 45 },
  ],
  Other: [
    { cause: "Insufficient data — manual inspection recommended", confidence: 50 },
  ],
}

export function getRootCauses(category: CategoryKey): RootCause[] {
  return rootCauseMap[category] || rootCauseMap.Other
}

// ---------- Recommendation engine ----------

export interface AIRecommendation {
  bestDepartment: string
  suggestedOfficerLevel: string
  estimatedBudget: { amount: number; currency: string }
  estimatedWorkforce: { count: number; unit: string }
  equipmentRequired: string[]
  preventiveMeasures: string[]
  temporarySolution: string
  permanentSolution: string
}

const departmentMap: Record<CategoryKey, string> = {
  Pothole: "Roads & Infrastructure Department",
  Garbage: "Sanitation & Waste Management",
  "Broken Streetlight": "Electrical & Lighting Division",
  "Water Leakage": "Water Works & Plumbing",
  "Drainage Issue": "Drainage & Storm Water Division",
  "Illegal Dumping": "Sanitation & Waste Management",
  "Public Safety": "Public Safety & Emergency Services",
  Other: "General Municipal Services",
}

const budgetMap: Record<CategoryKey, number> = {
  Pothole: 85000,
  Garbage: 25000,
  "Broken Streetlight": 45000,
  "Water Leakage": 120000,
  "Drainage Issue": 95000,
  "Illegal Dumping": 35000,
  "Public Safety": 60000,
  Other: 40000,
}

const workforceMap: Record<CategoryKey, number> = {
  Pothole: 6, Garbage: 3, "Broken Streetlight": 4, "Water Leakage": 8,
  "Drainage Issue": 7, "Illegal Dumping": 4, "Public Safety": 5, Other: 3,
}

const equipmentMap: Record<CategoryKey, string[]> = {
  Pothole: ["Asphalt mix (2 tonnes)", "Road roller", "Traffic cones (12)"],
  Garbage: ["Garbage truck", "Disposal bags", "Disinfectant spray"],
  "Broken Streetlight": ["Replacement LED fixture", "Bucket truck", "Electrical tester"],
  "Water Leakage": ["Pipe repair kit", "Excavator", "Water pump"],
  "Drainage Issue": ["Drain cleaning truck", "Jetting equipment", "Manual rods"],
  "Illegal Dumping": ["Flatbed truck", "Wheel loader", "Protective gear"],
  "Public Safety": ["Safety barricades", "Warning tape", "Traffic diversion signs"],
  Other: ["Inspection team kit", "Basic repair tools"],
}

const officerLevelMap: Record<CategoryKey, string> = {
  Pothole: "Senior Engineer",
  Garbage: "Junior Supervisor",
  "Broken Streetlight": "Mid-level Technician",
  "Water Leakage": "Senior Engineer",
  "Drainage Issue": "Senior Engineer",
  "Illegal Dumping": "Junior Supervisor",
  "Public Safety": "Senior Officer",
  Other: "Mid-level Officer",
}

const preventiveMap: Record<CategoryKey, string[]> = {
  Pothole: [
    "Bi-monthly road surface inspections during monsoon",
    "Fiber-reinforced asphalt in high-traffic zones",
    "Drainage channels to prevent water accumulation",
  ],
  Garbage: [
    "Smart bins with fill-level sensors",
    "Daily collection in high-density areas",
    "Community waste segregation campaign",
  ],
  "Broken Streetlight": [
    "Upgrade to LED fixtures with remote monitoring",
    "Photocell sensors for fault detection",
    "Quarterly preventive maintenance",
  ],
  "Water Leakage": [
    "Acoustic leak detection sensors",
    "Replace aging cast-iron with HDPE pipes",
    "Pressure management valves",
  ],
  "Drainage Issue": [
    "Mesh grates at drain inlets",
    "Quarterly desilting before monsoon",
    "Real-time water level monitoring",
  ],
  "Illegal Dumping": [
    "Motion-activated CCTV at hotspots",
    "Citizen reporting reward program",
    "Penalty signage with hotline numbers",
  ],
  "Public Safety": [
    "Monthly safety audits of public infrastructure",
    "Protective barriers at hazard zones",
    "Rapid hazard containment training",
  ],
  Other: [
    "Proactive inspection schedule for municipal assets",
    "Centralized risk register",
    "Field staff early identification training",
  ],
}

const temporaryMap: Record<CategoryKey, string> = {
  Pothole: "Apply cold-mix asphalt as temporary patch while scheduling full resurfacing.",
  Garbage: "Deploy additional collection vehicles and install temporary smart bins.",
  "Broken Streetlight": "Install temporary solar-powered LED lights during diagnosis.",
  "Water Leakage": "Isolate affected pipe section and deploy water tankers during repair.",
  "Drainage Issue": "Use high-pressure jetting to clear blockage immediately.",
  "Illegal Dumping": "Clear debris and install temporary CCTV monitoring.",
  "Public Safety": "Cordon off hazard area and deploy traffic marshals.",
  Other: "Conduct site inspection within 24 hours.",
}

const permanentMap: Record<CategoryKey, string> = {
  Pothole: "Full-depth road base repair with reinforced asphalt and improved drainage.",
  Garbage: "Permanent smart bin installation with auto-compaction and route optimization.",
  "Broken Streetlight": "Replace entire circuit with LED network and remote monitoring system.",
  "Water Leakage": "Replace aging pipe section with HDPE and install pressure sensors.",
  "Drainage Issue": "Redesign drainage with proper gradient and permanent debris filters.",
  "Illegal Dumping": "Install permanent CCTV with automated fine issuance system.",
  "Public Safety": "Permanent protective infrastructure and warning systems.",
  Other: "Implement permanent remediation based on inspection findings.",
}

export function getRecommendation(category: CategoryKey): AIRecommendation {
  return {
    bestDepartment: departmentMap[category] || departmentMap.Other,
    suggestedOfficerLevel: officerLevelMap[category] || officerLevelMap.Other,
    estimatedBudget: { amount: budgetMap[category] || budgetMap.Other, currency: "INR" },
    estimatedWorkforce: { count: workforceMap[category] || workforceMap.Other, unit: "workers" },
    equipmentRequired: equipmentMap[category] || equipmentMap.Other,
    preventiveMeasures: preventiveMap[category] || preventiveMap.Other,
    temporarySolution: temporaryMap[category] || temporaryMap.Other,
    permanentSolution: permanentMap[category] || permanentMap.Other,
  }
}

// ---------- Hotspot prediction ----------

export interface HotspotPrediction {
  ward: string
  riskPercentage: number
  expectedGrowth: number
  affectedWards: string[]
  estimatedImpact: string
  predictedNextHotspot: { ward: string; probability: number; reason: string; timeframe: string }
}

export function predictHotspots(complaints: Complaint[]): HotspotPrediction {
  // Group by ward (use location as ward proxy)
  const wardMap = new Map<string, { count: number; critical: number; recent: number }>()

  for (const c of complaints) {
    const ward = c.location.split(",")[0].trim() || "Unknown"
    const entry = wardMap.get(ward) || { count: 0, critical: 0, recent: 0 }
    entry.count++
    if (c.priority === "Critical") entry.critical++
    const ageDays = (Date.now() - new Date(c.created_at).getTime()) / 86400000
    if (ageDays <= 7) entry.recent++
    wardMap.set(ward, entry)
  }

  if (wardMap.size === 0) {
    return {
      ward: "Unknown",
      riskPercentage: 0,
      expectedGrowth: 0,
      affectedWards: [],
      estimatedImpact: "No data available",
      predictedNextHotspot: { ward: "Unknown", probability: 0, reason: "Insufficient data", timeframe: "—" },
    }
  }

  const sorted = Array.from(wardMap.entries()).sort((a, b) => b[1].count - a[1].count)
  const top = sorted[0]
  const topRisk = Math.min(95, 40 + top[1].count * 5 + top[1].critical * 10)
  const growth = top[1].recent > 0 ? Math.round((top[1].recent / top[1].count) * 100) : 0
  const affected = sorted.slice(0, 5).map(([w]) => w)

  const next = sorted[1] || sorted[0]
  const nextProb = Math.min(90, 30 + next[1].count * 4 + next[1].critical * 8)

  return {
    ward: top[0],
    riskPercentage: topRisk,
    expectedGrowth: growth,
    affectedWards: affected,
    estimatedImpact: `${top[1].count} active complaints, ${top[1].critical} critical — estimated ${topRisk}% risk of escalation`,
    predictedNextHotspot: {
      ward: next[0],
      probability: nextProb,
      reason: `${next[1].count} complaints with rising severity — projected hotspot within 2 weeks.`,
      timeframe: "10-14 days",
    },
  }
}

// ---------- Officer AI ----------

export interface OfficerAIResult {
  workloadScore: number
  burnoutRisk: string
  recommendedReassignment: string
  predictedCompletionDate: string
  bestForComplaint: boolean
}

export function analyzeOfficer(officer: Officer, allComplaints: Complaint[]): OfficerAIResult {
  const assigned = allComplaints.filter(c => c.officer_id === officer.id)
  const pending = assigned.filter(c => c.status !== "Resolved" && c.status !== "Rejected")
  const workload = Math.min(100, officer.workload_pct + pending.length * 3)

  let burnout = "Low"
  if (workload >= 90) burnout = "Critical"
  else if (workload >= 75) burnout = "High"
  else if (workload >= 60) burnout = "Moderate"

  let reassignment = "No reassignment needed"
  if (burnout === "Critical")
    reassignment = `Reassign ${Math.ceil(pending.length / 2)} complaints to available officers immediately`
  else if (burnout === "High")
    reassignment = "Consider reassigning 1-2 pending complaints"

  const days = Math.max(1, Math.ceil(officer.avg_resolution_hours / 24))
  const completion = new Date()
  completion.setDate(completion.getDate() + days)

  return {
    workloadScore: workload,
    burnoutRisk: burnout,
    recommendedReassignment: reassignment,
    predictedCompletionDate: completion.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    bestForComplaint: burnout === "Low" || burnout === "Moderate",
  }
}

export function findBestOfficer(
  officers: Officer[],
  allComplaints: Complaint[],
  category: CategoryKey,
): { officer: Officer; score: number; reason: string } | null {
  if (officers.length === 0) return null
  let best: Officer | null = null
  let bestScore = -1
  let reason = ""
  for (const o of officers) {
    const ai = analyzeOfficer(o, allComplaints)
    const deptMatch = o.department.toLowerCase().includes(category.toLowerCase().split(" ")[0]) ? 15 : 0
    const score = ai.workloadScore * -0.5 + o.efficiency_pct + deptMatch + (ai.bestForComplaint ? 10 : 0)
    if (score > bestScore) {
      bestScore = score
      best = o
      reason = `${o.name} has ${o.efficiency_pct}% efficiency, ${ai.workloadScore}% workload (${ai.burnoutRisk} burnout), and department alignment.`
    }
  }
  return best ? { officer: best, score: Math.round(bestScore), reason } : null
}

// ---------- Citizen AI ----------

export interface CitizenAIResult {
  trustScore: number
  reputationScore: number
  falseReportProbability: number
  communityImpactScore: number
  contributionTrend: string
}

export function analyzeCitizen(
  profile: Profile,
  complaints: Complaint[],
): CitizenAIResult {
  const userComplaints = complaints.filter(c => c.user_id === profile.id)
  const total = userComplaints.length
  const resolved = userComplaints.filter(c => c.status === "Resolved").length
  const rejected = userComplaints.filter(c => c.status === "Rejected").length

  const trust = Math.min(100, Math.max(0, profile.trust_score))
  const reputation = Math.min(100, Math.round((trust * 0.4) + (profile.contribution_score * 0.4) + (resolved * 2)))
  const falseProb = total > 0 ? Math.min(95, Math.round((rejected / total) * 100 + (profile.false_reports * 5))) : 0
  const impact = Math.min(100, Math.round(resolved * 3 + profile.lifetime_contribution * 0.5))

  let trend = "Stable"
  const recent = userComplaints.filter(c => {
    const ageDays = (Date.now() - new Date(c.created_at).getTime()) / 86400000
    return ageDays <= 30
  }).length
  if (recent >= 5) trend = "Rising"
  else if (recent === 0 && total > 0) trend = "Declining"

  return {
    trustScore: trust,
    reputationScore: reputation,
    falseReportProbability: falseProb,
    communityImpactScore: impact,
    contributionTrend: trend,
  }
}

// ---------- AI Analytics ----------

export interface AIInsights {
  risingCategories: { category: string; growthPct: number }[]
  predictedMonthlyComplaints: number
  departmentEfficiencyPrediction: { department: string; predictedEfficiency: number }[]
  budgetForecast: { category: string; amount: number }[]
  resolutionForecast: { month: string; predicted: number }[]
}

export function generateAIInsights(
  complaints: Complaint[],
  officers: Officer[],
): AIInsights {
  // Rising categories (compare recent vs older)
  const now = Date.now()
  const recent30 = complaints.filter(c => (now - new Date(c.created_at).getTime()) / 86400000 <= 30)
  const older30to60 = complaints.filter(c => {
    const age = (now - new Date(c.created_at).getTime()) / 86400000
    return age > 30 && age <= 60
  })

  const catRecent = new Map<string, number>()
  const catOlder = new Map<string, number>()
  for (const c of recent30) catRecent.set(c.category, (catRecent.get(c.category) || 0) + 1)
  for (const c of older30to60) catOlder.set(c.category, (catOlder.get(c.category) || 0) + 1)

  const allCats = new Set([...catRecent.keys(), ...catOlder.keys()])
  const rising: { category: string; growthPct: number }[] = []
  for (const cat of allCats) {
    const r = catRecent.get(cat) || 0
    const o = catOlder.get(cat) || 0
    const growth = o === 0 ? (r > 0 ? 100 : 0) : Math.round(((r - o) / o) * 100)
    rising.push({ category: cat, growthPct: growth })
  }
  rising.sort((a, b) => b.growthPct - a.growthPct)

  // Predicted monthly complaints (linear extrapolation)
  const monthlyCounts = new Map<string, number>()
  for (const c of complaints) {
    const m = new Date(c.created_at).toLocaleString("en-IN", { month: "short" })
    monthlyCounts.set(m, (monthlyCounts.get(m) || 0) + 1)
  }
  const counts = Array.from(monthlyCounts.values())
  const avg = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0
  const trend = counts.length >= 2 ? (counts[counts.length - 1] - counts[counts.length - 2]) : 0
  const predictedMonthly = Math.max(0, Math.round(avg + trend * 0.5))

  // Department efficiency prediction
  const deptMap = new Map<string, { officers: Officer[]; totalEff: number }>()
  for (const o of officers) {
    const entry = deptMap.get(o.department) || { officers: [], totalEff: 0 }
    entry.officers.push(o)
    entry.totalEff += o.efficiency_pct
    deptMap.set(o.department, entry)
  }
  const deptPred = Array.from(deptMap.entries()).map(([dept, e]) => ({
    department: dept,
    predictedEfficiency: e.officers.length > 0 ? Math.round(e.totalEff / e.officers.length) : 0,
  }))

  // Budget forecast by category
  const budgetByCat = new Map<string, number>()
  for (const c of complaints) {
    const base = budgetMap[c.category as CategoryKey] || 40000
    budgetByCat.set(c.category, (budgetByCat.get(c.category) || 0) + base)
  }
  const budgetForecast = Array.from(budgetByCat.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Resolution forecast (next 6 months)
  const resolutionForecast: { month: string; predicted: number }[] = []
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentMonth = new Date().getMonth()
  for (let i = 0; i < 6; i++) {
    const m = months[(currentMonth + i) % 12]
    const predicted = Math.max(0, Math.round((resolvedCount / Math.max(1, counts.length)) * (1 + i * 0.05)))
    resolutionForecast.push({ month: m, predicted })
  }

  return {
    risingCategories: rising.slice(0, 5),
    predictedMonthlyComplaints: predictedMonthly,
    departmentEfficiencyPrediction: deptPred,
    budgetForecast,
    resolutionForecast,
  }
}
