import { supabase } from "@/lib/supabase/client"
import type {
  CategoryKey,
  Complaint,
  Officer,
  Profile,
} from "@/lib/supabase/types"
import {
  detectDuplicateComplaint,
  calculatePriority,
  getRootCauses,
  getRecommendation,
  predictHotspots,
  analyzeOfficer,
  findBestOfficer,
  analyzeCitizen,
  generateAIInsights,
  type DuplicateResult,
  type PriorityResult,
  type RootCause,
  type AIRecommendation,
  type HotspotPrediction,
  type OfficerAIResult,
  type CitizenAIResult,
  type AIInsights,
} from "@/lib/ai/engine"

// ============================================================
// AI Services — async wrappers that fetch live Supabase data
// and run AI analysis. All functions return typed predictions.
// ============================================================

async function fetchAllComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Complaint[]) ?? []
}

async function fetchOfficers(): Promise<Officer[]> {
  const { data, error } = await supabase
    .from("officers")
    .select("*")
    .order("workload_pct", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Officer[]) ?? []
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Profile | null
}

// ---------- Duplicate detection ----------

export async function runDuplicateDetection(
  category: CategoryKey,
  title: string,
  description: string,
  lat: number,
  lng: number,
): Promise<DuplicateResult | null> {
  const existing = await fetchAllComplaints()
  return detectDuplicateComplaint(category, title, description, lat, lng, existing)
}

// ---------- Priority engine ----------

export async function runPriorityEngine(
  category: CategoryKey,
  description: string,
  lat: number,
  lng: number,
  citizenId?: string,
): Promise<PriorityResult> {
  const [complaints, profile] = await Promise.all([
    fetchAllComplaints(),
    citizenId ? fetchProfile(citizenId) : Promise.resolve(null),
  ])

  // Similar complaint count (same category, within 1km)
  let similarCount = 0
  let wardRiskScore = 0
  const wardCounts = new Map<string, number>()
  for (const c of complaints) {
    const dx = (c.lat - lat) * 111
    const dy = (c.lng - lng) * 111
    const dist = Math.sqrt(dx * dx + dy * dy) * 1000
    if (c.category === category && dist < 1000) similarCount++
    const ward = c.location.split(",")[0].trim() || "Unknown"
    wardCounts.set(ward, (wardCounts.get(ward) || 0) + 1)
  }
  // Ward risk = max concentration in any ward normalized
  const maxWard = Math.max(...wardCounts.values(), 0)
  wardRiskScore = Math.min(100, maxWard * 5)

  const citizenTrust = profile?.trust_score ?? 50
  return calculatePriority(category, description, similarCount, citizenTrust, wardRiskScore)
}

// ---------- Root cause ----------

export function runRootCauseAnalysis(category: CategoryKey): RootCause[] {
  return getRootCauses(category)
}

// ---------- Recommendation ----------

export function runRecommendationEngine(category: CategoryKey): AIRecommendation {
  return getRecommendation(category)
}

// ---------- Hotspot prediction ----------

export async function runHotspotPrediction(): Promise<HotspotPrediction> {
  const complaints = await fetchAllComplaints()
  return predictHotspots(complaints)
}

// ---------- Officer AI ----------

export async function runOfficerAI(
  officerId: string,
): Promise<{ officer: Officer; ai: OfficerAIResult } | null> {
  const [officers, complaints] = await Promise.all([fetchOfficers(), fetchAllComplaints()])
  const officer = officers.find(o => o.id === officerId)
  if (!officer) return null
  return { officer, ai: analyzeOfficer(officer, complaints) }
}

export async function runBestOfficerForComplaint(
  category: CategoryKey,
): Promise<{ officer: Officer; score: number; reason: string } | null> {
  const [officers, complaints] = await Promise.all([fetchOfficers(), fetchAllComplaints()])
  return findBestOfficer(officers, complaints, category)
}

// ---------- Citizen AI ----------

export async function runCitizenAI(
  userId: string,
): Promise<{ profile: Profile; ai: CitizenAIResult } | null> {
  const [profile, complaints] = await Promise.all([
    fetchProfile(userId),
    fetchAllComplaints(),
  ])
  if (!profile) return null
  return { profile, ai: analyzeCitizen(profile, complaints) }
}

// ---------- AI Analytics ----------

export async function runAIInsights(): Promise<AIInsights> {
  const [complaints, officers] = await Promise.all([fetchAllComplaints(), fetchOfficers()])
  return generateAIInsights(complaints, officers)
}
