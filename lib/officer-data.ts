export type Department =
  | "Roads & Infrastructure"
  | "Sanitation & Waste"
  | "Electrical & Lighting"
  | "Water Works"
  | "Drainage & Storm Water"
  | "Public Safety"
  | "General Municipal"

export type Availability = "Available" | "On Field" | "On Break" | "Off Duty"
export type SkillLevel = "Trainee" | "Junior" | "Mid-level" | "Senior" | "Expert"

export interface Officer {
  id: string
  name: string
  avatar: string
  department: Department
  availability: Availability
  assignedComplaints: number
  resolvedToday: number
  avgResolutionTime: string
  avgResolutionHours: number
  workloadPct: number
  efficiencyPct: number
  citizenRating: number
  skillLevel: SkillLevel
  experienceYears: number
  capacityPct: number
}

export const officers: Officer[] = [
  {
    id: "OFC-001",
    name: "Eng. R. Mehta",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "Roads & Infrastructure",
    availability: "On Field",
    assignedComplaints: 12,
    resolvedToday: 5,
    avgResolutionTime: "2.4 days",
    avgResolutionHours: 58,
    workloadPct: 85,
    efficiencyPct: 92,
    citizenRating: 4.8,
    skillLevel: "Senior",
    experienceYears: 9,
    capacityPct: 78,
  },
  {
    id: "OFC-002",
    name: "San. T. Rao",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "Sanitation & Waste",
    availability: "Available",
    assignedComplaints: 8,
    resolvedToday: 7,
    avgResolutionTime: "1.2 days",
    avgResolutionHours: 29,
    workloadPct: 60,
    efficiencyPct: 96,
    citizenRating: 4.9,
    skillLevel: "Expert",
    experienceYears: 14,
    capacityPct: 88,
  },
  {
    id: "OFC-003",
    name: "Eng. K. Singh",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "Water Works",
    availability: "On Field",
    assignedComplaints: 15,
    resolvedToday: 3,
    avgResolutionTime: "3.1 days",
    avgResolutionHours: 74,
    workloadPct: 95,
    efficiencyPct: 78,
    citizenRating: 4.2,
    skillLevel: "Mid-level",
    experienceYears: 5,
    capacityPct: 62,
  },
  {
    id: "OFC-004",
    name: "Off. S. Banerjee",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "Public Safety",
    availability: "On Break",
    assignedComplaints: 6,
    resolvedToday: 4,
    avgResolutionTime: "1.8 days",
    avgResolutionHours: 43,
    workloadPct: 45,
    efficiencyPct: 88,
    citizenRating: 4.6,
    skillLevel: "Senior",
    experienceYears: 11,
    capacityPct: 72,
  },
  {
    id: "OFC-005",
    name: "Eng. P. Desai",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "Electrical & Lighting",
    availability: "Available",
    assignedComplaints: 10,
    resolvedToday: 6,
    avgResolutionTime: "2.0 days",
    avgResolutionHours: 48,
    workloadPct: 70,
    efficiencyPct: 90,
    citizenRating: 4.7,
    skillLevel: "Mid-level",
    experienceYears: 6,
    capacityPct: 80,
  },
  {
    id: "OFC-006",
    name: "Off. M. Gupta",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "Drainage & Storm Water",
    availability: "Off Duty",
    assignedComplaints: 4,
    resolvedToday: 0,
    avgResolutionTime: "2.8 days",
    avgResolutionHours: 67,
    workloadPct: 30,
    efficiencyPct: 72,
    citizenRating: 4.0,
    skillLevel: "Junior",
    experienceYears: 3,
    capacityPct: 55,
  },
  {
    id: "OFC-007",
    name: "Eng. A. Pillai",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "Roads & Infrastructure",
    availability: "On Field",
    assignedComplaints: 14,
    resolvedToday: 4,
    avgResolutionTime: "2.6 days",
    avgResolutionHours: 62,
    workloadPct: 90,
    efficiencyPct: 84,
    citizenRating: 4.5,
    skillLevel: "Senior",
    experienceYears: 8,
    capacityPct: 68,
  },
  {
    id: "OFC-008",
    name: "Off. N. Reddy",
    avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
    department: "General Municipal",
    availability: "Available",
    assignedComplaints: 7,
    resolvedToday: 5,
    avgResolutionTime: "1.5 days",
    avgResolutionHours: 36,
    workloadPct: 55,
    efficiencyPct: 91,
    citizenRating: 4.4,
    skillLevel: "Trainee",
    experienceYears: 1,
    capacityPct: 76,
  },
]

export const departmentPerformance = [
  { department: "Sanitation", efficiency: 96, resolved: 49, pending: 9 },
  { department: "Roads", efficiency: 88, resolved: 51, pending: 26 },
  { department: "Water", efficiency: 78, resolved: 35, pending: 21 },
  { department: "Electrical", efficiency: 90, resolved: 38, pending: 12 },
  { department: "Safety", efficiency: 88, resolved: 31, pending: 6 },
  { department: "Drainage", efficiency: 72, resolved: 28, pending: 14 },
]

export const todayPerformance = [
  { hour: "9 AM", resolved: 4, assigned: 6 },
  { hour: "11 AM", resolved: 8, assigned: 10 },
  { hour: "1 PM", resolved: 12, assigned: 14 },
  { hour: "3 PM", resolved: 18, assigned: 20 },
  { hour: "5 PM", resolved: 24, assigned: 22 },
]

export const pendingWorkData = [
  { officer: "Eng. K. Singh", pending: 15 },
  { officer: "Eng. A. Pillai", pending: 14 },
  { officer: "Eng. R. Mehta", pending: 12 },
  { officer: "Eng. P. Desai", pending: 10 },
  { officer: "Off. S. Banerjee", pending: 6 },
]

export const adminUser = {
  name: "Admin Officer",
  rank: "City Administrator",
  avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200",
}

export interface OfficerWeeklyPerformance {
  week: string
  resolved: number
  assigned: number
  efficiency: number
}

export interface OfficerMonthlyPerformance {
  month: string
  resolved: number
  assigned: number
  avgResolutionHours: number
}

export interface OfficerCompletionTrend {
  day: string
  completed: number
  pending: number
}

export interface OfficerRoutePoint {
  name: string
  time: string
  status: "completed" | "current" | "upcoming"
  complaintId?: string
}

export interface OfficerDetail {
  weeklyPerformance: OfficerWeeklyPerformance[]
  monthlyPerformance: OfficerMonthlyPerformance[]
  completionTrend: OfficerCompletionTrend[]
  currentRoute: OfficerRoutePoint[]
  currentAssignment: { complaintId: string; title: string; location: string; startedAt: string; eta: string } | null
  pendingBacklog: number
  workloadPrediction: { nextWeekPct: number; trend: "rising" | "stable" | "declining"; recommendation: string }
  departmentEfficiency: number
}

const officerDetails: Record<string, OfficerDetail> = {
  "OFC-001": {
    weeklyPerformance: [
      { week: "W1", resolved: 18, assigned: 22, efficiency: 82 },
      { week: "W2", resolved: 22, assigned: 25, efficiency: 88 },
      { week: "W3", resolved: 20, assigned: 24, efficiency: 83 },
      { week: "W4", resolved: 24, assigned: 26, efficiency: 92 },
    ],
    monthlyPerformance: [
      { month: "Jan", resolved: 72, assigned: 85, avgResolutionHours: 62 },
      { month: "Feb", resolved: 78, assigned: 90, avgResolutionHours: 58 },
      { month: "Mar", resolved: 85, assigned: 95, avgResolutionHours: 55 },
      { month: "Apr", resolved: 82, assigned: 92, avgResolutionHours: 56 },
      { month: "May", resolved: 90, assigned: 98, avgResolutionHours: 54 },
      { month: "Jun", resolved: 88, assigned: 96, avgResolutionHours: 58 },
    ],
    completionTrend: [
      { day: "Mon", completed: 4, pending: 8 },
      { day: "Tue", completed: 6, pending: 7 },
      { day: "Wed", completed: 5, pending: 6 },
      { day: "Thu", completed: 7, pending: 5 },
      { day: "Fri", completed: 5, pending: 7 },
      { day: "Sat", completed: 3, pending: 5 },
      { day: "Sun", completed: 2, pending: 4 },
    ],
    currentRoute: [
      { name: "MG Road Junction, Sector 14", time: "09:15", status: "completed", complaintId: "CTS-2026-0001" },
      { name: "Flyover Approach, Sector 12", time: "11:30", status: "current", complaintId: "CTS-2026-0008" },
      { name: "Park Avenue, Sector 22", time: "14:00", status: "upcoming" },
      { name: "Central Market, Sector 9", time: "16:30", status: "upcoming" },
    ],
    currentAssignment: {
      complaintId: "CTS-2026-0001",
      title: "Large pothole near MG Road junction",
      location: "MG Road Junction, Sector 14",
      startedAt: "09:15 AM",
      eta: "11:45 AM",
    },
    pendingBacklog: 7,
    workloadPrediction: { nextWeekPct: 88, trend: "rising", recommendation: "Consider reassigning 2 low-priority cases to OFC-007 to balance workload." },
    departmentEfficiency: 88,
  },
  "OFC-002": {
    weeklyPerformance: [
      { week: "W1", resolved: 24, assigned: 26, efficiency: 92 },
      { week: "W2", resolved: 26, assigned: 28, efficiency: 93 },
      { week: "W3", resolved: 28, assigned: 30, efficiency: 93 },
      { week: "W4", resolved: 30, assigned: 31, efficiency: 96 },
    ],
    monthlyPerformance: [
      { month: "Jan", resolved: 95, assigned: 100, avgResolutionHours: 32 },
      { month: "Feb", resolved: 98, assigned: 102, avgResolutionHours: 30 },
      { month: "Mar", resolved: 102, assigned: 105, avgResolutionHours: 28 },
      { month: "Apr", resolved: 105, assigned: 108, avgResolutionHours: 29 },
      { month: "May", resolved: 108, assigned: 110, avgResolutionHours: 27 },
      { month: "Jun", resolved: 110, assigned: 112, avgResolutionHours: 29 },
    ],
    completionTrend: [
      { day: "Mon", completed: 7, pending: 3 },
      { day: "Tue", completed: 8, pending: 2 },
      { day: "Wed", completed: 6, pending: 4 },
      { day: "Thu", completed: 9, pending: 1 },
      { day: "Fri", completed: 7, pending: 2 },
      { day: "Sat", completed: 4, pending: 1 },
      { day: "Sun", completed: 0, pending: 0 },
    ],
    currentRoute: [
      { name: "Central Market, Sector 9", time: "08:45", status: "completed", complaintId: "CTS-2026-0002" },
      { name: "School Road, Sector 7", time: "10:30", status: "current", complaintId: "CTS-2026-0005" },
      { name: "Plot 44, Sector 31", time: "13:00", status: "upcoming" },
    ],
    currentAssignment: {
      complaintId: "CTS-2026-0002",
      title: "Overflowing garbage bins at market",
      location: "Central Market, Sector 9",
      startedAt: "08:45 AM",
      eta: "10:15 AM",
    },
    pendingBacklog: 1,
    workloadPrediction: { nextWeekPct: 62, trend: "stable", recommendation: "Workload is well-balanced. Maintain current assignment rate." },
    departmentEfficiency: 96,
  },
  "OFC-003": {
    weeklyPerformance: [
      { week: "W1", resolved: 12, assigned: 20, efficiency: 60 },
      { week: "W2", resolved: 14, assigned: 22, efficiency: 64 },
      { week: "W3", resolved: 13, assigned: 21, efficiency: 62 },
      { week: "W4", resolved: 15, assigned: 22, efficiency: 68 },
    ],
    monthlyPerformance: [
      { month: "Jan", resolved: 48, assigned: 75, avgResolutionHours: 78 },
      { month: "Feb", resolved: 52, assigned: 80, avgResolutionHours: 76 },
      { month: "Mar", resolved: 55, assigned: 82, avgResolutionHours: 74 },
      { month: "Apr", resolved: 58, assigned: 85, avgResolutionHours: 72 },
      { month: "May", resolved: 60, assigned: 88, avgResolutionHours: 70 },
      { month: "Jun", resolved: 62, assigned: 90, avgResolutionHours: 74 },
    ],
    completionTrend: [
      { day: "Mon", completed: 2, pending: 13 },
      { day: "Tue", completed: 3, pending: 14 },
      { day: "Wed", completed: 1, pending: 15 },
      { day: "Thu", completed: 4, pending: 12 },
      { day: "Fri", completed: 2, pending: 13 },
      { day: "Sat", completed: 1, pending: 11 },
      { day: "Sun", completed: 0, pending: 10 },
    ],
    currentRoute: [
      { name: "Green Park Lane, Sector 18", time: "09:00", status: "current", complaintId: "CTS-2026-0004" },
      { name: "School Road, Sector 7", time: "12:00", status: "upcoming" },
      { name: "Flyover Approach, Sector 12", time: "15:00", status: "upcoming" },
    ],
    currentAssignment: {
      complaintId: "CTS-2026-0004",
      title: "Major water pipe burst flooding lane",
      location: "Green Park Lane, Sector 18",
      startedAt: "09:00 AM",
      eta: "12:30 PM",
    },
    pendingBacklog: 12,
    workloadPrediction: { nextWeekPct: 97, trend: "rising", recommendation: "Critical: workload approaching capacity. Reassign 4 cases to available officers immediately." },
    departmentEfficiency: 78,
  },
}

export function getOfficerDetail(id: string): OfficerDetail {
  return officerDetails[id] || {
    weeklyPerformance: [
      { week: "W1", resolved: 15, assigned: 18, efficiency: 83 },
      { week: "W2", resolved: 17, assigned: 20, efficiency: 85 },
      { week: "W3", resolved: 16, assigned: 19, efficiency: 84 },
      { week: "W4", resolved: 18, assigned: 21, efficiency: 86 },
    ],
    monthlyPerformance: [
      { month: "Jan", resolved: 60, assigned: 72, avgResolutionHours: 50 },
      { month: "Feb", resolved: 65, assigned: 75, avgResolutionHours: 48 },
      { month: "Mar", resolved: 70, assigned: 80, avgResolutionHours: 46 },
      { month: "Apr", resolved: 68, assigned: 78, avgResolutionHours: 47 },
      { month: "May", resolved: 72, assigned: 82, avgResolutionHours: 45 },
      { month: "Jun", resolved: 75, assigned: 85, avgResolutionHours: 44 },
    ],
    completionTrend: [
      { day: "Mon", completed: 4, pending: 6 },
      { day: "Tue", completed: 5, pending: 5 },
      { day: "Wed", completed: 3, pending: 7 },
      { day: "Thu", completed: 6, pending: 4 },
      { day: "Fri", completed: 4, pending: 6 },
      { day: "Sat", completed: 2, pending: 3 },
      { day: "Sun", completed: 1, pending: 2 },
    ],
    currentRoute: [
      { name: "Sector 22", time: "10:00", status: "completed" },
      { name: "Sector 5", time: "13:00", status: "current" },
      { name: "Sector 31", time: "16:00", status: "upcoming" },
    ],
    currentAssignment: null,
    pendingBacklog: 5,
    workloadPrediction: { nextWeekPct: 75, trend: "stable", recommendation: "Workload is manageable. Monitor for any sudden spikes." },
    departmentEfficiency: 85,
  }
}
