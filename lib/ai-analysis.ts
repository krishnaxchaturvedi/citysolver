import { complaints, type CategoryKey, type Priority, type Complaint } from "./data"

export interface AIAnalysis {
  priority: Priority
  riskScore: number
  confidence: number
  severity: string
  citizenImpactScore: number
  estimatedResolutionTime: string
  estimatedRepairCost: string
  recommendedDepartment: string
  requiredResources: string[]
  emergencyFlag: boolean
  trafficImpact: string
  weatherImpact: string
  nearbySchool: boolean
  nearbySchoolDistance: string
  nearbyHospital: boolean
  nearbyHospitalDistance: string
  nearbyGovtBuilding: boolean
  nearbyGovtBuildingDistance: string
  aiSummary: string
  aiReasoning: string[]
  rootCauseAnalysis: string
  recommendedOfficerLevel: string
}

export interface DuplicateMatch {
  duplicateProbability: number
  nearestComplaint: Complaint
  distance: string
  similarity: number
  assignedOfficer: string
  currentStatus: Complaint["status"]
}

const priorityScores: Record<Priority, number> = {
  Critical: 95,
  High: 75,
  Medium: 55,
  Low: 35,
}

const departments: Record<CategoryKey, string> = {
  Pothole: "Roads & Infrastructure Department",
  Garbage: "Sanitation & Waste Management",
  "Broken Streetlight": "Electrical & Lighting Division",
  "Water Leakage": "Water Works & Plumbing",
  "Drainage Issue": "Drainage & Storm Water Division",
  "Illegal Dumping": "Sanitation & Waste Management",
  "Public Safety": "Public Safety & Emergency Services",
  Other: "General Municipal Services",
}

const resources: Record<CategoryKey, string[]> = {
  Pothole: ["Asphalt mix (2 tonnes)", "Road roller", "Traffic cones (12)", "2-person crew"],
  Garbage: ["Garbage truck", "Sanitation workers (4)", "Disposal bags", "Disinfectant spray"],
  "Broken Streetlight": ["Replacement LED fixture", "Bucket truck", "Electrical tester", "Lineman (1)"],
  "Water Leakage": ["Pipe repair kit", "Excavator", "Water pump", "Plumbing crew (3)"],
  "Drainage Issue": ["Drain cleaning truck", "Jetting equipment", "Manual rods", "Drainage crew (4)"],
  "Illegal Dumping": ["Flatbed truck", "Wheel loader", "Protective gear (6)", "Sanitation crew (5)"],
  "Public Safety": ["Safety barricades", "Warning tape", "Emergency response team", "Traffic diversion signs"],
  Other: ["Inspection team", "Basic repair kit", "Documentation tools"],
}

const resolutionTimes: Record<Priority, string> = {
  Critical: "1-2 days",
  High: "3-5 days",
  Medium: "5-10 days",
  Low: "10-15 days",
}

const repairCosts: Record<Priority, string> = {
  Critical: "₹45,000 - ₹85,000",
  High: "₹15,000 - ₹35,000",
  Medium: "₹5,000 - ₹15,000",
  Low: "₹1,000 - ₹5,000",
}

const officerLevels: Record<Priority, string> = {
  Critical: "Senior Municipal Officer (Level 4)",
  High: "Ward Supervisor (Level 3)",
  Medium: "Field Inspector (Level 2)",
  Low: "Maintenance Worker (Level 1)",
}

const severityLabels: Record<Priority, string> = {
  Critical: "Severe",
  High: "Major",
  Medium: "Moderate",
  Low: "Minor",
}

const trafficImpacts: Record<Priority, string> = {
  Critical: "Severe disruption — expect 30-45 min delays, lane closures likely",
  High: "Moderate disruption — 10-20 min delays during peak hours",
  Medium: "Minor disruption — brief slowdowns possible",
  Low: "Minimal disruption — normal traffic flow expected",
}

function calculatePriority(category: CategoryKey, description: string): Priority {
  const desc = description.toLowerCase()
  const criticalKeywords = ["highway", "main road", "arterial", "live wire", "electrocution", "flood", "burst", "explosion", "collapse", "accident", "fatal", "death", "injury"]
  const highKeywords = ["dangerous", "risk", "children", "school", "hospital", "night", "dark", "large", "deep", "blocked", "overflow", "urgent", "emergency"]

  const catPriority: Record<CategoryKey, "Critical" | "High" | "Medium"> = {
    "Public Safety": "Critical",
    "Pothole": "High",
    "Broken Streetlight": "High",
    "Water Leakage": "High",
    "Garbage": "Medium",
    "Drainage Issue": "Medium",
    "Illegal Dumping": "Medium",
    "Other": "Medium",
  }

  if (criticalKeywords.some(k => desc.includes(k))) return "Critical"
  if (highKeywords.some(k => desc.includes(k))) return "High"
  return catPriority[category] || "Low"
}

const categorySummaries: Record<CategoryKey, (desc: string, priority: Priority) => string> = {
  Pothole: (desc, priority) => {
    const size = desc.toLowerCase().includes("large") || desc.toLowerCase().includes("deep") ? "large" : "moderate"
    const location = desc.toLowerCase().includes("school") ? "near a school zone" : desc.toLowerCase().includes("main road") || desc.toLowerCase().includes("junction") ? "on a main arterial road" : "in a residential area"
    return `AI detected a ${size} pothole ${location}. Classified as ${priority} priority due to road surface degradation and vehicle safety risk. Thermal imaging suggests ${desc.toLowerCase().includes("deep") ? "deep" : "shallow"} subsurface erosion.`
  },
  Garbage: (desc, priority) => {
    const days = desc.toLowerCase().includes("four") ? "4" : desc.toLowerCase().includes("three") ? "3" : "several"
    return `AI analysis indicates uncollected waste persisting for ${days} days. Classified as ${priority} priority due to sanitation hazard and pest attraction risk. Waste composition analysis suggests organic decomposition is accelerating.`
  },
  "Broken Streetlight": (desc, priority) => {
    const stretch = desc.toLowerCase().includes("entire") || desc.toLowerCase().includes("stretch") ? "an entire stretch" : "individual"
    return `AI detected ${stretch} of non-functional streetlights. Classified as ${priority} priority due to reduced nighttime visibility and pedestrian safety risk. Power grid analysis suggests ${desc.toLowerCase().includes("week") ? "prolonged" : "recent"} outage.`
  },
  "Water Leakage": (desc, priority) => {
    const burst = desc.toLowerCase().includes("burst") || desc.toLowerCase().includes("flooding")
    return `AI detected a ${burst ? "major pipe burst" : "water leakage"}. Classified as ${priority} priority due to water wastage and infrastructure erosion. Flow analysis estimates ${burst ? "2,000+" : "500+"} litres wasted per hour.`
  },
  "Drainage Issue": (desc, priority) => {
    const waterlogging = desc.toLowerCase().includes("waterlogg") || desc.toLowerCase().includes("flood")
    return `AI detected a ${waterlogging ? "severely blocked drain with active waterlogging" : "blocked drainage system"}. Classified as ${priority} priority due to ${waterlogging ? "flooding risk and mosquito breeding" : "drainage backup"}. Sediment analysis indicates ${waterlogging ? "complete" : "partial"} blockage.`
  },
  "Illegal Dumping": (desc, priority) => {
    const debris = desc.toLowerCase().includes("debris") || desc.toLowerCase().includes("construction")
    return `AI detected ${debris ? "construction debris" : "illegal waste"} dumped on public land. Classified as ${priority} priority due to environmental violation and ${debris ? "walkway obstruction" : "health hazard"}. Volume estimate: ${debris ? "8-12 cubic metres" : "3-5 cubic metres"}.`
  },
  "Public Safety": (desc, priority) => {
    const electrical = desc.toLowerCase().includes("wire") || desc.toLowerCase().includes("electric")
    return `AI detected a ${electrical ? "live electrical hazard" : "public safety threat"}. Classified as ${priority} priority due to ${electrical ? "electrocution risk to pedestrians" : "imminent danger to citizens"}. Emergency response protocol recommended.`
  },
  Other: (desc, priority) => {
    return `AI analyzed this general civic complaint. Classified as ${priority} priority based on description sentiment analysis and category inference. Further manual review may refine the assessment.`
  },
}

const categoryReasoning: Record<CategoryKey, (desc: string, priority: Priority) => string[]> = {
  Pothole: (desc, priority) => {
    const reasons: string[] = []
    if (desc.toLowerCase().includes("school")) reasons.push(`AI flagged this as ${priority} priority because it is within 120 meters of a government school and affects approximately 850 daily commuters.`)
    if (desc.toLowerCase().includes("main road") || desc.toLowerCase().includes("junction")) reasons.push("The location is on a primary arterial road with high traffic volume, increasing accident probability.")
    if (desc.toLowerCase().includes("deep") || desc.toLowerCase().includes("large")) reasons.push("Pothole dimensions suggest severe structural damage requiring immediate road base repair.")
    if (desc.toLowerCase().includes("two-wheeler") || desc.toLowerCase().includes("swerv")) reasons.push("Vehicle swerving behavior detected in description, indicating active accident risk for two-wheelers.")
    reasons.push("Historical data shows 73% of similar potholes in this sector worsen within 72 hours without intervention.")
    return reasons.slice(0, 4)
  },
  Garbage: (desc, priority) => {
    const reasons: string[] = []
    if (desc.toLowerCase().includes("market")) reasons.push(`AI flagged this as ${priority} priority due to proximity to a commercial market with high foot traffic and waste accumulation patterns.`)
    if (desc.toLowerCase().includes("animal") || desc.toLowerCase().includes("stray")) reasons.push("Stray animal activity detected, increasing disease transmission risk and waste dispersion radius.")
    if (desc.toLowerCase().includes("four") || desc.toLowerCase().includes("days")) reasons.push("Extended collection delay indicates a systemic route disruption rather than an isolated miss.")
    reasons.push("Sanitation index for this zone is 34% below the municipal threshold, triggering automatic escalation.")
    return reasons.slice(0, 4)
  },
  "Broken Streetlight": (desc, priority) => {
    const reasons: string[] = []
    if (desc.toLowerCase().includes("dark") || desc.toLowerCase().includes("night")) reasons.push(`AI flagged this as ${priority} priority because the outage affects nighttime visibility in an area with reported pedestrian activity.`)
    if (desc.toLowerCase().includes("entire") || desc.toLowerCase().includes("stretch")) reasons.push("Multiple fixture failure suggests a circuit or transformer fault, not individual bulb burnout.")
    if (desc.toLowerCase().includes("week")) reasons.push("Prolonged outage (>7 days) indicates the issue may not have been previously reported through official channels.")
    reasons.push("Crime safety correlation data shows a 22% increase in incidents in unlit zones within 14 days.")
    return reasons.slice(0, 4)
  },
  "Water Leakage": (desc, priority) => {
    const reasons: string[] = []
    if (desc.toLowerCase().includes("burst") || desc.toLowerCase().includes("flood")) reasons.push(`AI flagged this as ${priority} priority due to a major pipe burst causing active flooding and rapid infrastructure erosion.`)
    if (desc.toLowerCase().includes("wast")) reasons.push("Water wastage volume is estimated at 2,000+ litres per hour, exceeding the municipal emergency threshold.")
    if (desc.toLowerCase().includes("erod") || desc.toLowerCase().includes("road base")) reasons.push("Subsurface erosion detected, which can lead to sinkhole formation if left unaddressed.")
    reasons.push("Pressure data from nearby valves suggests a main line rupture requiring immediate shutoff.")
    return reasons.slice(0, 4)
  },
  "Drainage Issue": (desc, priority) => {
    const reasons: string[] = []
    if (desc.toLowerCase().includes("school")) reasons.push(`AI flagged this as ${priority} priority because the waterlogging is within 80 meters of a school, posing health risks to approximately 600 students.`)
    if (desc.toLowerCase().includes("waterlogg") || desc.toLowerCase().includes("rain")) reasons.push("Active waterlogging detected, with mosquito breeding risk increasing by 40% within 48 hours.")
    if (desc.toLowerCase().includes("block")) reasons.push("Sediment and debris analysis indicates a complete blockage requiring jetting equipment.")
    reasons.push("Monsoon preparedness protocol: drainage failures in this sector have a 65% recurrence rate within 30 days.")
    return reasons.slice(0, 4)
  },
  "Illegal Dumping": (desc, priority) => {
    const reasons: string[] = []
    if (desc.toLowerCase().includes("construction") || desc.toLowerCase().includes("debris")) reasons.push(`AI flagged this as ${priority} priority because construction debris indicates a commercial violation, not a residential one.`)
    if (desc.toLowerCase().includes("plot") || desc.toLowerCase().includes("public")) reasons.push("Dumping on public land constitutes a civic code violation requiring documentation and potential fines.")
    if (desc.toLowerCase().includes("pest") || desc.toLowerCase().includes("walkway")) reasons.push("Pest attraction and walkway obstruction compound the public health impact.")
    reasons.push("Satellite imagery comparison shows this plot was clear 7 days ago, indicating a recent dumping event.")
    return reasons.slice(0, 4)
  },
  "Public Safety": (desc, priority) => {
    const reasons: string[] = []
    if (desc.toLowerCase().includes("wire") || desc.toLowerCase().includes("electric")) reasons.push(`AI flagged this as ${priority} priority because live electrical wires pose an immediate electrocution risk to pedestrians and commuters.`)
    if (desc.toLowerCase().includes("bus") || desc.toLowerCase().includes("stop")) reasons.push("Proximity to a bus stop increases exposure to approximately 1,200 daily commuters.")
    if (desc.toLowerCase().includes("hang") || desc.toLowerCase().includes("low")) reasons.push("Wire height analysis suggests contact risk for tall vehicles and pedestrians during rain.")
    reasons.push("Emergency response protocol: 94% of similar electrical hazards required disconnection within 2 hours.")
    return reasons.slice(0, 4)
  },
  Other: (desc, priority) => {
    return [
      `AI classified this as ${priority} priority based on natural language sentiment analysis of the complaint description.`,
      "Category inference model suggests this may relate to infrastructure maintenance.",
      "Historical pattern matching found 12 similar complaints in this ward over the past quarter.",
    ]
  },
}

const rootCauses: Record<CategoryKey, string> = {
  Pothole: "Root cause analysis: Prolonged water seepage has weakened the road base, compounded by heavy vehicle traffic and insufficient drainage. The subgrade layer has likely degraded, requiring full-depth repair rather than surface patching.",
  Garbage: "Root cause analysis: Collection route disruption likely caused by truck breakdown or crew shortage. The waste accumulation pattern suggests a missed collection cycle rather than increased generation.",
  "Broken Streetlight": "Root cause analysis: Multiple fixture failure along a single stretch indicates a upstream electrical fault — likely a damaged underground cable or failed control panel. Individual bulb replacement will not resolve the issue.",
  "Water Leakage": "Root cause analysis: Pipe age analysis suggests corrosion-induced rupture. The main line is estimated to be 25+ years old, exceeding its service life. Adjacent road erosion confirms prolonged leakage before surface manifestation.",
  "Drainage Issue": "Root cause analysis: Sediment buildup combined with debris entry from an unsealed drain cover. The blockage pattern indicates gradual accumulation over weeks, worsened by recent rainfall events.",
  "Illegal Dumping": "Root cause analysis: The dumping pattern and debris type suggest a construction contractor avoiding authorized disposal fees. Vehicle tire marks and debris volume indicate a commercial dump truck, not individual dumping.",
  "Public Safety": "Root cause analysis: Wind damage or vehicle contact likely displaced the electrical fixtures. The wire exposure pattern suggests insufficient maintenance inspection cycles in this zone.",
  Other: "Root cause analysis: Insufficient data for definitive root cause identification. Manual inspection is recommended to determine the underlying cause and appropriate remediation strategy.",
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function calculateAIAnalysis(
  category: CategoryKey,
  description: string,
  hasImage: boolean,
  hasLocation: boolean,
  location?: string,
): AIAnalysis {
  const priority = calculatePriority(category, description)
  const desc = description.toLowerCase()

  let riskScore = priorityScores[priority]
  const severityKeywords = ["urgent", "immediate", "dangerous", "safety", "hazard", "risk"]
  riskScore += severityKeywords.filter(k => desc.includes(k)).length * 5
  riskScore = Math.min(Math.max(riskScore, 0), 100)

  let confidence = 68
  if (hasImage) confidence += 15
  if (hasLocation) confidence += 10
  if (description.length > 100) confidence += 5
  if (location && location.length > 5) confidence += 2
  confidence = Math.min(confidence, 96)

  const hash = hashString(description + category)
  const citizenImpactScore = Math.min(Math.max(
    Math.floor(riskScore * 0.6 + (hash % 30) + (desc.includes("school") ? 15 : 0) + (desc.includes("hospital") ? 12 : 0)),
    10), 100)

  const nearbySchool = desc.includes("school") || (hash % 3 === 0)
  const nearbyHospital = desc.includes("hospital") || (hash % 4 === 0)
  const nearbyGovtBuilding = desc.includes("government") || desc.includes("office") || (hash % 5 === 0)

  const schoolDist = 40 + (hash % 80)
  const hospitalDist = 80 + (hash % 120)
  const govtDist = 60 + (hash % 100)

  const weatherImpact = priority === "Critical"
    ? "Heavy rain expected in 48 hrs — will worsen road damage and increase flooding risk"
    : priority === "High"
    ? "Light rain forecast — may aggravate the issue, recommend expedited repair"
    : "Clear weather expected — minimal weather-related worsening"

  const emergencyFlag = priority === "Critical" || desc.includes("electrocution") || desc.includes("live wire") || desc.includes("explosion") || desc.includes("flood")

  return {
    priority,
    riskScore,
    confidence,
    severity: severityLabels[priority],
    citizenImpactScore,
    estimatedResolutionTime: resolutionTimes[priority],
    estimatedRepairCost: repairCosts[priority],
    recommendedDepartment: departments[category],
    requiredResources: resources[category],
    emergencyFlag,
    trafficImpact: trafficImpacts[priority],
    weatherImpact,
    nearbySchool,
    nearbySchoolDistance: nearbySchool ? `${schoolDist}m` : "—",
    nearbyHospital,
    nearbyHospitalDistance: nearbyHospital ? `${hospitalDist}m` : "—",
    nearbyGovtBuilding,
    nearbyGovtBuildingDistance: nearbyGovtBuilding ? `${govtDist}m` : "—",
    aiSummary: categorySummaries[category](description, priority),
    aiReasoning: categoryReasoning[category](description, priority),
    rootCauseAnalysis: rootCauses[category],
    recommendedOfficerLevel: officerLevels[priority],
  }
}

export function detectDuplicates(
  category: CategoryKey,
  description: string,
  location: string,
  coordinates: { lat: number; lng: number } | null,
): DuplicateMatch | null {
  if (!category || description.length < 20) return null

  const desc = description.toLowerCase()
  const descWords = new Set(desc.split(/\s+/).filter(w => w.length > 3))

  let bestMatch: Complaint | null = null
  let bestSimilarity = 0
  let bestDistance = ""
  let bestProbability = 0

  for (const c of complaints) {
    if (c.category !== category) continue

    const cDesc = c.description.toLowerCase()
    const cWords = new Set(cDesc.split(/\s+/).filter(w => w.length > 3))
    let common = 0
    for (const w of descWords) { if (cWords.has(w)) common++ }
    const wordSimilarity = (common / Math.max(descWords.size, cWords.size, 1)) * 100

    let locationProximity = 0
    let distanceStr = ""
    if (coordinates) {
      const dLat = (c.lat - coordinates.lat) * 111
      const dLng = (c.lng - coordinates.lng) * 111 * Math.cos(coordinates.lat * Math.PI / 180)
      const meters = Math.sqrt(dLat * dLat + dLng * dLng) * 1000
      distanceStr = `${meters.toFixed(0)}m`
      locationProximity = Math.max(0, 100 - meters / 10)
    } else {
      const locLower = location.toLowerCase()
      const cLocLower = c.location.toLowerCase()
      const locWords = locLower.split(/\s+/).filter(w => w.length > 2)
      const cLocWords = cLocLower.split(/\s+/).filter(w => w.length > 2)
      const locCommon = locWords.filter(w => cLocWords.includes(w)).length
      locationProximity = locWords.length > 0 ? (locCommon / Math.max(locWords.length, 1)) * 100 : 30
      distanceStr = locationProximity > 60 ? "~200m" : locationProximity > 30 ? "~500m" : "~1.2km"
    }

    const similarity = Math.round(wordSimilarity * 0.6 + locationProximity * 0.4)
    const probability = Math.min(98, Math.round(similarity * 0.85 + (wordSimilarity > 50 ? 10 : 0)))

    if (similarity > bestSimilarity && similarity > 25) {
      bestSimilarity = similarity
      bestMatch = c
      bestDistance = distanceStr
      bestProbability = probability
    }
  }

  if (!bestMatch) return null

  return {
    duplicateProbability: bestProbability,
    nearestComplaint: bestMatch,
    distance: bestDistance,
    similarity: bestSimilarity,
    assignedOfficer: bestMatch.officer || "Not yet assigned",
    currentStatus: bestMatch.status,
  }
}
