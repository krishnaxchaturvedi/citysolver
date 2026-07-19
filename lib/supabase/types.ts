export type UserRole = "citizen" | "officer" | "admin"

export type Priority = "Critical" | "High" | "Medium" | "Low"

export type Status =
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Rejected"

export type CategoryKey =
  | "Pothole"
  | "Garbage"
  | "Broken Streetlight"
  | "Water Leakage"
  | "Drainage Issue"
  | "Illegal Dumping"
  | "Public Safety"
  | "Other"

export type Availability = "available" | "busy" | "offline"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar: string | null
  phone: string | null
  ward: string | null
  city: string | null
  state: string | null
  trust_score: number
  contribution_score: number
  coins: number
  response_rate: number
  monthly_contribution: number
  lifetime_contribution: number
  verified_complaints: number
  false_reports: number
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  description: string | null
  head_officer_id: string | null
  created_at: string
}

export interface Officer {
  id: string
  user_id: string | null
  name: string
  department: string
  rank: string
  avatar: string | null
  availability: Availability
  workload_pct: number
  efficiency_pct: number
  capacity_pct: number
  avg_resolution_hours: number
  avg_resolution_time: string
  assigned_count: number
  resolved_count: number
  created_at: string
}

export interface Complaint {
  id: string
  user_id: string
  category: CategoryKey
  title: string
  description: string
  priority: Priority
  status: Status
  location: string
  lat: number
  lng: number
  image_url: string | null
  severity: number
  coins: number
  officer_id: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface ComplaintImage {
  id: string
  complaint_id: string
  image_url: string
  created_at: string
}

export interface ComplaintStatusHistory {
  id: string
  complaint_id: string
  status: Status
  changed_by: string | null
  note: string | null
  created_at: string
}

export interface Reward {
  id: string
  name: string
  description: string | null
  cost: number
  category: string
  image_url: string | null
  unlocked: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string | null
  tier: "bronze" | "silver" | "gold" | "platinum"
  icon: string | null
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  complaint_id: string | null
  read: boolean
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  full_name: string
  avatar: string | null
  coins: number
  trust_score: number
  contribution_score: number
  verified_complaints: number
  lifetime_contribution: number
}
