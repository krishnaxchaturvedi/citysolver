import { supabase, STORAGE_BUCKET } from "@/lib/supabase/client"
import type {
  Complaint,
  ComplaintImage,
  ComplaintStatusHistory,
  Notification,
  Officer,
  Profile,
  Reward,
  Badge,
  UserBadge,
  LeaderboardEntry,
  Status,
  Priority,
  CategoryKey,
} from "@/lib/supabase/types"

// ============ COMPLAINTS ============

export interface ComplaintInput {
  id: string
  category: CategoryKey
  title: string
  description: string
  priority: Priority
  location: string
  lat: number
  lng: number
  severity: number
  coins: number
}

export async function createComplaint(input: ComplaintInput, imageFile?: File) {
  let image_url: string | null = null

  if (imageFile) {
    const ext = imageFile.name.split(".").pop() || "jpg"
    const path = `${input.id}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, imageFile, { cacheControl: "3600", upsert: false })
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    image_url = pub.publicUrl
  }

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      id: input.id,
      category: input.category,
      title: input.title,
      description: input.description,
      priority: input.priority,
      location: input.location,
      lat: input.lat,
      lng: input.lng,
      severity: input.severity,
      coins: input.coins,
      image_url,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Complaint
}

export async function getComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Complaint[]) ?? []
}

export async function getMyComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Complaint[]) ?? []
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Complaint | null
}

export async function updateComplaint(
  id: string,
  updates: Partial<Pick<Complaint, "title" | "description" | "priority" | "location" | "lat" | "lng">>
): Promise<Complaint> {
  const { data, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Complaint
}

export async function deleteComplaint(id: string): Promise<void> {
  const { error } = await supabase.from("complaints").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

// ============ ADMIN COMPLAINT OPERATIONS ============

export async function assignOfficer(complaintId: string, officerId: string): Promise<void> {
  const { error } = await supabase
    .from("complaints")
    .update({ officer_id: officerId, status: "Assigned" })
    .eq("id", complaintId)
  if (error) throw new Error(error.message)

  await addStatusHistory(complaintId, "Assigned", `Assigned to officer ${officerId}`)
}

export async function updateComplaintStatus(
  complaintId: string,
  status: Status,
  note?: string
): Promise<void> {
  const { error } = await supabase
    .from("complaints")
    .update({ status })
    .eq("id", complaintId)
  if (error) throw new Error(error.message)

  await addStatusHistory(complaintId, status, note)
}

export async function addAdminNotes(complaintId: string, notes: string): Promise<void> {
  const { error } = await supabase
    .from("complaints")
    .update({ admin_notes: notes })
    .eq("id", complaintId)
  if (error) throw new Error(error.message)
}

export async function resolveComplaint(complaintId: string, note?: string): Promise<void> {
  await updateComplaintStatus(complaintId, "Resolved", note)
}

// ============ STATUS HISTORY ============

export async function addStatusHistory(
  complaintId: string,
  status: Status,
  note?: string
): Promise<void> {
  const { error } = await supabase
    .from("complaint_status_history")
    .insert({ complaint_id: complaintId, status, note })
  if (error) throw new Error(error.message)
}

export async function getStatusHistory(complaintId: string): Promise<ComplaintStatusHistory[]> {
  const { data, error } = await supabase
    .from("complaint_status_history")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as ComplaintStatusHistory[]) ?? []
}

// ============ COMPLAINT IMAGES ============

export async function addComplaintImage(complaintId: string, imageUrl: string): Promise<void> {
  const { error } = await supabase
    .from("complaint_images")
    .insert({ complaint_id: complaintId, image_url: imageUrl })
  if (error) throw new Error(error.message)
}

export async function getComplaintImages(complaintId: string): Promise<ComplaintImage[]> {
  const { data, error } = await supabase
    .from("complaint_images")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as ComplaintImage[]) ?? []
}

// ============ OFFICERS ============

export async function getOfficers(): Promise<Officer[]> {
  const { data, error } = await supabase
    .from("officers")
    .select("*")
    .order("workload_pct", { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Officer[]) ?? []
}

export async function getOfficer(id: string): Promise<Officer | null> {
  const { data, error } = await supabase
    .from("officers")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Officer | null
}

// ============ NOTIFICATIONS ============

export async function getNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data as Notification[]) ?? []
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false)
  if (error) throw new Error(error.message)
}

// ============ REWARDS ============

export async function getRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("cost", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as Reward[]) ?? []
}

// ============ BADGES ============

export async function getBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("tier", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as Badge[]) ?? []
}

export async function getUserBadges(): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
  if (error) throw new Error(error.message)
  return (data as UserBadge[]) ?? []
}

// ============ PROFILE ============

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data as Profile | null
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "full_name" | "phone" | "ward" | "city" | "state" | "avatar">>
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
  if (error) throw new Error(error.message)
}

// ============ LEADERBOARD ============

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar, coins, trust_score, contribution_score, verified_complaints, lifetime_contribution")
    .order("contribution_score", { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data as LeaderboardEntry[]) ?? []
}

// ============ DEPARTMENTS ============

export async function getDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

// ============ STORAGE ============

export async function uploadComplaintImage(complaintId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${complaintId}-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// ============ REALTIME HELPERS ============

export function subscribeToComplaints(callback: (payload: any) => void) {
  const channel = supabase
    .channel("complaints-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, callback)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export function subscribeToNotifications(callback: (payload: any) => void) {
  const channel = supabase
    .channel("notifications-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, callback)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export function subscribeToProfiles(callback: (payload: any) => void) {
  const channel = supabase
    .channel("profiles-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, callback)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

export function subscribeToOfficers(callback: (payload: any) => void) {
  const channel = supabase
    .channel("officers-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "officers" }, callback)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}

// ============ ID GENERATION ============

export function generateComplaintId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `CTS-${year}-${String(random).padStart(4, "0")}`
}

export function calculateSeverity(priority: Priority): number {
  switch (priority) {
    case "Critical": return 90 + Math.floor(Math.random() * 10)
    case "High": return 70 + Math.floor(Math.random() * 15)
    case "Medium": return 40 + Math.floor(Math.random() * 20)
    case "Low": return 10 + Math.floor(Math.random() * 25)
  }
}

export function calculateCoins(priority: Priority): number {
  switch (priority) {
    case "Critical": return 150
    case "High": return 90
    case "Medium": return 60
    case "Low": return 30
  }
}
