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
export type OverlayKey = "heatmap" | "cluster" | "markers"

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
