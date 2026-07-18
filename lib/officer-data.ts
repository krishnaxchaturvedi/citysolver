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
