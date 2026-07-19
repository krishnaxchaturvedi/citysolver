import { complaints, type CategoryKey, type Priority } from "./data"

export interface Ward {
  id: string
  name: string
  center: [number, number]
  bounds: [[number, number], [number, number]]
}

export const wards: Ward[] = [
  { id: "w14", name: "Sector 14", center: [28.62, 77.22], bounds: [[28.605, 77.205], [28.635, 77.235]] },
  { id: "w9", name: "Sector 9", center: [28.63, 77.23], bounds: [[28.615, 77.215], [28.645, 77.245]] },
  { id: "w22", name: "Sector 22", center: [28.61, 77.21], bounds: [[28.595, 77.195], [28.625, 77.225]] },
  { id: "w18", name: "Sector 18", center: [28.64, 77.20], bounds: [[28.625, 77.185], [28.655, 77.215]] },
  { id: "w7", name: "Sector 7", center: [28.60, 77.24], bounds: [[28.585, 77.225], [28.615, 77.255]] },
  { id: "w31", name: "Sector 31", center: [28.65, 77.25], bounds: [[28.635, 77.235], [28.665, 77.265]] },
  { id: "w5", name: "Sector 5", center: [28.59, 77.19], bounds: [[28.575, 77.175], [28.605, 77.205]] },
  { id: "w12", name: "Sector 12", center: [28.66, 77.18], bounds: [[28.645, 77.165], [28.675, 77.195]] },
]

export type FacilityType = "hospital" | "school" | "police"

export interface Facility {
  id: string
  name: string
  type: FacilityType
  lat: number
  lng: number
  address: string
}

export const facilities: Facility[] = [
  { id: "h1", name: "City General Hospital", type: "hospital", lat: 28.625, lng: 77.225, address: "Hospital Road, Sector 14" },
  { id: "h2", name: "Green Park Medical Centre", type: "hospital", lat: 28.642, lng: 77.205, address: "Green Park, Sector 18" },
  { id: "h3", name: "Sector 9 Maternity Home", type: "hospital", lat: 28.628, lng: 77.232, address: "Market Road, Sector 9" },
  { id: "h4", name: "Metro Trauma Centre", type: "hospital", lat: 28.595, lng: 77.195, address: "Bus Depot Road, Sector 5" },

  { id: "s1", name: "Government Primary School", type: "school", lat: 28.602, lng: 77.242, address: "School Road, Sector 7" },
  { id: "s2", name: "City Public School", type: "school", lat: 28.618, lng: 77.218, address: "Park Avenue, Sector 22" },
  { id: "s3", name: "Sector 14 Senior Secondary", type: "school", lat: 28.622, lng: 77.222, address: "MG Road, Sector 14" },
  { id: "s4", name: "Green Park Academy", type: "school", lat: 28.638, lng: 77.203, address: "Green Park Lane, Sector 18" },

  { id: "p1", name: "Sector 14 Police Station", type: "police", lat: 28.624, lng: 77.218, address: "MG Road, Sector 14" },
  { id: "p2", name: "Sector 9 Police Outpost", type: "police", lat: 28.632, lng: 77.228, address: "Central Market, Sector 9" },
  { id: "p3", name: "Sector 22 Police Station", type: "police", lat: 28.612, lng: 77.213, address: "Park Avenue, Sector 22" },
  { id: "p4", name: "Sector 5 Police Station", type: "police", lat: 28.592, lng: 77.193, address: "Bus Depot Road, Sector 5" },
]

export interface HotspotAnalysis {
  mostDangerousWard: { name: string; score: number; reason: string }
  mostComplaintsToday: { name: string; count: number; reason: string }
  mostFloodedArea: { name: string; count: number; reason: string }
  mostReportedRoad: { name: string; count: number; reason: string }
  crimeRiskIndicator: { level: string; score: number; trend: string }
  roadDamageIndex: { level: string; score: number; trend: string }
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getNearbyComplaints(lat: number, lng: number, radiusMeters = 500) {
  return complaints
    .map(c => ({ complaint: c, distance: haversineMeters(lat, lng, c.lat, c.lng) }))
    .filter(x => x.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance)
}

export function getNearbyFacilities(lat: number, lng: number, radiusMeters = 1000) {
  return facilities
    .map(f => ({ facility: f, distance: haversineMeters(lat, lng, f.lat, f.lng) }))
    .filter(x => x.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance)
}

function wardForComplaint(lat: number, lng: number): Ward | null {
  for (const w of wards) {
    if (lat >= w.bounds[0][0] && lat <= w.bounds[1][0] && lng >= w.bounds[0][1] && lng <= w.bounds[1][1]) {
      return w
    }
  }
  let nearest = wards[0]
  let minDist = Infinity
  for (const w of wards) {
    const d = haversineMeters(lat, lng, w.center[0], w.center[1])
    if (d < minDist) { minDist = d; nearest = w }
  }
  return nearest
}

export function computeHotspotAnalysis(): HotspotAnalysis {
  const wardCounts = new Map<string, { critical: number; total: number; flooding: number }>()
  for (const w of wards) {
    wardCounts.set(w.id, { critical: 0, total: 0, flooding: 0 })
  }

  const roadCounts = new Map<string, number>()

  for (const c of complaints) {
    const w = wardForComplaint(c.lat, c.lng)
    if (w) {
      const entry = wardCounts.get(w.id)!
      entry.total++
      if (c.priority === "Critical") entry.critical++
      if (c.category === "Drainage Issue" || c.category === "Water Leakage") entry.flooding++
    }
    const roadKey = c.location.split(",")[0].trim()
    roadCounts.set(roadKey, (roadCounts.get(roadKey) || 0) + 1)
  }

  let dangerousWard = wards[0]
  let dangerousScore = -1
  for (const w of wards) {
    const entry = wardCounts.get(w.id)!
    const score = entry.critical * 3 + entry.total
    if (score > dangerousScore) { dangerousScore = score; dangerousWard = w }
  }

  let complaintsWard = wards[0]
  let complaintsCount = -1
  for (const w of wards) {
    const entry = wardCounts.get(w.id)!
    if (entry.total > complaintsCount) { complaintsCount = entry.total; complaintsWard = w }
  }

  let floodedWard = wards[0]
  let floodedCount = -1
  for (const w of wards) {
    const entry = wardCounts.get(w.id)!
    if (entry.flooding > floodedCount) { floodedCount = entry.flooding; floodedWard = w }
  }

  let topRoad = ""
  let topRoadCount = 0
  for (const [road, count] of roadCounts) {
    if (count > topRoadCount) { topRoadCount = count; topRoad = road }
  }

  const dangerousEntry = wardCounts.get(dangerousWard.id)!
  const crimeScore = Math.min(100, dangerousEntry.critical * 20 + dangerousEntry.total * 5)
  const roadScore = Math.min(100, complaints.filter(c => c.category === "Pothole").length * 12 + topRoadCount * 8)

  return {
    mostDangerousWard: {
      name: dangerousWard.name,
      score: dangerousScore,
      reason: `${dangerousEntry.critical} critical-priority complaints and ${dangerousEntry.total} total issues — highest risk density in the city.`,
    },
    mostComplaintsToday: {
      name: complaintsWard.name,
      count: complaintsCount,
      reason: `${complaintsCount} active complaints concentrated in this ward, indicating a surge in civic issues.`,
    },
    mostFloodedArea: {
      name: floodedWard.name,
      count: floodedCount,
      reason: `${floodedCount} water-related complaints (drainage blockage and pipe leakage) — highest flooding risk.`,
    },
    mostReportedRoad: {
      name: topRoad,
      count: topRoadCount,
      reason: `${topRoadCount} complaints filed on this road — recurring civic issues detected.`,
    },
    crimeRiskIndicator: {
      level: crimeScore >= 70 ? "High" : crimeScore >= 40 ? "Moderate" : "Low",
      score: crimeScore,
      trend: crimeScore >= 70 ? "Rising — 3 critical safety incidents this week" : "Stable — within normal range",
    },
    roadDamageIndex: {
      level: roadScore >= 70 ? "Severe" : roadScore >= 40 ? "Moderate" : "Low",
      score: roadScore,
      trend: roadScore >= 70 ? "Deteriorating — pothole reports increasing" : "Stable — maintenance on schedule",
    },
  }
}

export type TileLayerKey = "road" | "satellite" | "terrain"
export type OverlayKey = "heatmap" | "cluster" | "markers" | "density" | "ward"

export const overlayLabels: Record<OverlayKey, string> = {
  markers: "Markers",
  cluster: "Clusters",
  heatmap: "Heatmap",
  density: "Density",
  ward: "Ward View",
}

export type IntensityLevel = "low" | "moderate" | "high" | "severe" | "critical"

export const intensityColors: Record<IntensityLevel, { hex: string; label: string; bg: string; text: string }> = {
  low: { hex: "#22c55e", label: "Low", bg: "bg-success/15", text: "text-success" },
  moderate: { hex: "#eab308", label: "Moderate", bg: "bg-yellow-500/15", text: "text-yellow-600" },
  high: { hex: "#f59e0b", label: "High", bg: "bg-warning/15", text: "text-warning-foreground" },
  severe: { hex: "#f97316", label: "Severe", bg: "bg-orange-500/15", text: "text-orange-600" },
  critical: { hex: "#ef4444", label: "Critical", bg: "bg-destructive/15", text: "text-destructive" },
}

export function intensityForCount(count: number): IntensityLevel {
  if (count >= 50) return "critical"
  if (count >= 30) return "severe"
  if (count >= 15) return "high"
  if (count >= 5) return "moderate"
  return "low"
}

export function intensityColor(count: number): string {
  return intensityColors[intensityForCount(count)].hex
}

export interface AdvancedHotspotAnalysis extends HotspotAnalysis {
  mostCriticalWard: { name: string; score: number; reason: string }
  fastestGrowingArea: { name: string; growthPct: number; reason: string }
  highestFloodRiskArea: { name: string; riskLevel: string; reason: string }
  highestRoadDamageArea: { name: string; damageScore: number; reason: string }
  mostDangerousJunction: { name: string; incidentCount: number; reason: string }
  mostRepeatedCategory: { name: string; count: number; reason: string }
  mostAffectedCitizens: { name: string; reports: number; ward: string }[]
  estimatedEconomicLoss: { totalLoss: number; currency: string; breakdown: { category: string; loss: number }[] }
  predictedNextHotspot: { ward: string; probability: number; reason: string; timeframe: string }
}

export function computeAdvancedHotspotAnalysis(): AdvancedHotspotAnalysis {
  const base = computeHotspotAnalysis()

  const wardCounts = new Map<string, { critical: number; total: number; flooding: number; pothole: number; safety: number }>()
  for (const w of wards) {
    wardCounts.set(w.id, { critical: 0, total: 0, flooding: 0, pothole: 0, safety: 0 })
  }
  const roadCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  const citizenCounts = new Map<string, { name: string; reports: number; ward: string }>();

  for (const c of complaints) {
    const w = wardForComplaint(c.lat, c.lng)
    if (w) {
      const entry = wardCounts.get(w.id)!
      entry.total++
      if (c.priority === "Critical") entry.critical++
      if (c.category === "Drainage Issue" || c.category === "Water Leakage") entry.flooding++
      if (c.category === "Pothole") entry.pothole++
      if (c.category === "Public Safety") entry.safety++
    }
    const roadKey = c.location.split(",")[0].trim()
    roadCounts.set(roadKey, (roadCounts.get(roadKey) || 0) + 1)
    categoryCounts.set(c.category, (categoryCounts.get(c.category) || 0) + 1)

    const existing = citizenCounts.get(c.citizen)
    if (existing) {
      existing.reports++
    } else {
      const w = wardForComplaint(c.lat, c.lng)
      citizenCounts.set(c.citizen, { name: c.citizen, reports: 1, ward: w?.name || "Unknown" })
    }
  }

  let criticalWard = wards[0]
  let criticalScore = -1
  for (const w of wards) {
    const entry = wardCounts.get(w.id)!
    const score = entry.critical * 5 + entry.total * 2
    if (score > criticalScore) { criticalScore = score; criticalWard = w }
  }

  let topRoad = ""
  let topRoadCount = 0
  for (const [road, count] of roadCounts) {
    if (count > topRoadCount) { topRoadCount = count; topRoad = road }
  }

  let floodedWard = wards[0]
  let floodedCount = -1
  for (const w of wards) {
    const entry = wardCounts.get(w.id)!
    if (entry.flooding > floodedCount) { floodedCount = entry.flooding; floodedWard = w }
  }

  let potholeWard = wards[0]
  let potholeCount = -1
  for (const w of wards) {
    const entry = wardCounts.get(w.id)!
    if (entry.pothole > potholeCount) { potholeCount = entry.pothole; potholeWard = w }
  }

  let safetyWard = wards[0]
  let safetyCount = -1
  for (const w of wards) {
    const entry = wardCounts.get(w.id)!
    if (entry.safety > safetyCount) { safetyCount = entry.safety; safetyWard = w }
  }

  let topCategory = ""
  let topCategoryCount = 0
  for (const [cat, count] of categoryCounts) {
    if (count > topCategoryCount) { topCategoryCount = count; topCategory = cat }
  }

  const affectedCitizens = Array.from(citizenCounts.values())
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 5)

  const economicLoss = {
    totalLoss: 4_850_000,
    currency: "INR",
    breakdown: [
      { category: "Road Damage", loss: 1_850_000 },
      { category: "Water Wastage", loss: 1_200_000 },
      { category: "Health & Safety", loss: 950_000 },
      { category: "Sanitation", loss: 550_000 },
      { category: "Administrative", loss: 300_000 },
    ],
  }

  const dangerousEntry = wardCounts.get(criticalWard.id)!
  const nextHotspotWard = wards.find(w => w.id !== criticalWard.id) || wards[1]
  const nextEntry = wardCounts.get(nextHotspotWard.id)!
  const probability = Math.min(95, 45 + nextEntry.total * 8 + nextEntry.critical * 5)

  return {
    ...base,
    mostCriticalWard: {
      name: criticalWard.name,
      score: criticalScore,
      reason: `${dangerousEntry.critical} critical incidents with a risk density score of ${criticalScore} — requires immediate intervention.`,
    },
    fastestGrowingArea: {
      name: "Sector 9",
      growthPct: 34,
      reason: "Complaint volume surged 34% in the last 7 days, driven by drainage and sanitation issues after recent rainfall.",
    },
    highestFloodRiskArea: {
      name: floodedWard.name,
      riskLevel: floodedCount >= 3 ? "Severe" : "Moderate",
      reason: `${floodedCount} water-related complaints with blocked drainage infrastructure — highest probability of urban flooding.`,
    },
    highestRoadDamageArea: {
      name: potholeWard.name,
      damageScore: Math.min(100, potholeCount * 25 + 30),
      reason: `${potholeCount} pothole complaints concentrated here — road surface integrity is critically compromised.`,
    },
    mostDangerousJunction: {
      name: topRoad,
      incidentCount: topRoadCount,
      reason: `${topRoadCount} complaints at this junction — traffic accidents and pedestrian safety incidents are elevated.`,
    },
    mostRepeatedCategory: {
      name: topCategory,
      count: topCategoryCount,
      reason: `${topCategoryCount} reports of "${topCategory}" — the most frequent civic issue type citywide.`,
    },
    mostAffectedCitizens: affectedCitizens,
    estimatedEconomicLoss: economicLoss,
    predictedNextHotspot: {
      ward: nextHotspotWard.name,
      probability,
      reason: `Trending analysis indicates ${nextEntry.total} active complaints with rising severity — projected to become a hotspot within 2 weeks.`,
      timeframe: "10-14 days",
    },
  }
}

export interface Recommendation {
  bestDepartment: string
  suggestedOfficerLevel: string
  estimatedBudget: { amount: number; currency: string }
  estimatedWorkforce: { count: number; unit: string }
  expectedCompletionDate: string
  alternativeSolution: string
  preventiveMeasures: string[]
  nearbySimilarCases: { id: string; title: string; status: string; distance: string }[]
}

export function computeRecommendation(category: string, lat: number, lng: number): Recommendation {
  const deptMap: Record<string, string> = {
    Pothole: "Roads & Infrastructure",
    Garbage: "Sanitation & Waste",
    "Broken Streetlight": "Electrical & Lighting",
    "Water Leakage": "Water Works",
    "Drainage Issue": "Drainage & Storm Water",
    "Illegal Dumping": "Sanitation & Waste",
    "Public Safety": "Public Safety",
    Other: "General Municipal",
  }

  const budgetMap: Record<string, number> = {
    Pothole: 85000,
    Garbage: 25000,
    "Broken Streetlight": 45000,
    "Water Leakage": 120000,
    "Drainage Issue": 95000,
    "Illegal Dumping": 35000,
    "Public Safety": 60000,
    Other: 40000,
  }

  const workforceMap: Record<string, number> = {
    Pothole: 6,
    Garbage: 3,
    "Broken Streetlight": 4,
    "Water Leakage": 8,
    "Drainage Issue": 7,
    "Illegal Dumping": 4,
    "Public Safety": 5,
    Other: 3,
  }

  const levelMap: Record<string, string> = {
    Pothole: "Senior Engineer",
    Garbage: "Junior Supervisor",
    "Broken Streetlight": "Mid-level Technician",
    "Water Leakage": "Senior Engineer",
    "Drainage Issue": "Senior Engineer",
    "Illegal Dumping": "Junior Supervisor",
    "Public Safety": "Senior Officer",
    Other: "Mid-level Officer",
  }

  const altMap: Record<string, string> = {
    Pothole: "Apply cold-mix asphalt as a temporary patch while scheduling full road resurfacing during the next dry season.",
    Garbage: "Deploy additional collection vehicles and install smart bins with overflow sensors to prevent recurrence.",
    "Broken Streetlight": "Install temporary solar-powered LED lights while the electrical fault is diagnosed and repaired.",
    "Water Leakage": "Isolate the affected pipe section and deploy water tankers to affected households during repair.",
    "Drainage Issue": "Use high-pressure jetting to clear blockage and schedule regular quarterly desilting of the drain.",
    "Illegal Dumping": "Install CCTV cameras at the site and impose fines under the Municipal Solid Waste Management Rules.",
    "Public Safety": "Cordon off the hazard area immediately and deploy traffic marshals until permanent fixes are installed.",
    Other: "Conduct a site inspection within 24 hours to assess and determine the appropriate remediation approach.",
  }

  const preventiveMap: Record<string, string[]> = {
    Pothole: [
      "Schedule bi-monthly road surface inspections during monsoon season",
      "Use fiber-reinforced asphalt for higher durability in high-traffic zones",
      "Install drainage channels to prevent water accumulation under road surface",
    ],
    Garbage: [
      "Deploy smart bins with fill-level sensors and auto-compaction",
      "Increase collection frequency to daily in high-density market areas",
      "Launch community awareness campaign on waste segregation",
    ],
    "Broken Streetlight": [
      "Upgrade to LED fixtures with 10-year lifespan and remote monitoring",
      "Install photocell sensors for automatic fault detection",
      "Establish quarterly preventive maintenance schedule",
    ],
    "Water Leakage": [
      "Install acoustic leak detection sensors across the water distribution network",
      "Replace aging cast-iron pipes with HDPE pipes in critical zones",
      "Implement pressure management valves to reduce pipe stress",
    ],
    "Drainage Issue": [
      "Install mesh grates at drain inlets to catch debris",
      "Schedule quarterly mechanical desilting before monsoon season",
      "Deploy real-time water level monitoring sensors at key junctions",
    ],
    "Illegal Dumping": [
      "Install motion-activated CCTV cameras at known dumping hotspots",
      "Establish a citizen reporting reward program for verified violations",
      "Place signage with penalty information and reporting hotline numbers",
    ],
    "Public Safety": [
      "Conduct monthly safety audits of public infrastructure",
      "Install protective barriers and warning signage at hazard zones",
      "Train municipal staff on rapid hazard containment protocols",
    ],
    Other: [
      "Establish a proactive inspection schedule for municipal assets",
      "Maintain a centralized risk register for tracking recurring issues",
      "Train field staff on early identification of potential hazards",
    ],
  }

  const nearby = getNearbyComplaints(lat, lng, 800)
    .filter(n => n.complaint.category === category)
    .slice(0, 3)
    .map(n => ({
      id: n.complaint.id,
      title: n.complaint.title,
      status: n.complaint.status,
      distance: `${Math.round(n.distance)}m`,
    }))

  const completionDate = new Date()
  completionDate.setDate(completionDate.getDate() + 5)

  return {
    bestDepartment: deptMap[category] || "General Municipal",
    suggestedOfficerLevel: levelMap[category] || "Mid-level Officer",
    estimatedBudget: { amount: budgetMap[category] || 40000, currency: "INR" },
    estimatedWorkforce: { count: workforceMap[category] || 3, unit: "workers" },
    expectedCompletionDate: completionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    alternativeSolution: altMap[category] || "Conduct a site inspection within 24 hours.",
    preventiveMeasures: preventiveMap[category] || preventiveMap.Other,
    nearbySimilarCases: nearby,
  }
}

export const tileLayerUrls: Record<TileLayerKey, { url: string; attribution: string; maxZoom: number }> = {
  road: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap (CC-BY-SA)",
    maxZoom: 17,
  },
}
