import {
  AlertTriangle,
  Construction,
  Droplets,
  Lightbulb,
  ShieldAlert,
  Trash2,
  Truck,
  Waves,
  type LucideIcon,
} from "lucide-react"

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

export interface IssueCategory {
  key: CategoryKey
  label: string
  icon: LucideIcon
  description: string
}

export const categories: IssueCategory[] = [
  { key: "Pothole", label: "Pothole", icon: Construction, description: "Road surface damage and craters" },
  { key: "Garbage", label: "Garbage", icon: Trash2, description: "Uncollected waste and overflow" },
  { key: "Broken Streetlight", label: "Broken Streetlight", icon: Lightbulb, description: "Non-functional public lighting" },
  { key: "Water Leakage", label: "Water Leakage", icon: Droplets, description: "Pipe bursts and water waste" },
  { key: "Drainage Issue", label: "Drainage Issue", icon: Waves, description: "Blocked or overflowing drains" },
  { key: "Illegal Dumping", label: "Illegal Dumping", icon: Truck, description: "Unauthorized waste disposal" },
  { key: "Public Safety", label: "Public Safety", icon: ShieldAlert, description: "Hazards endangering citizens" },
  { key: "Other", label: "Other", icon: AlertTriangle, description: "Any other civic concern" },
]

export const priorityMeta: Record<
  Priority,
  { label: string; color: string; mapColor: string; badge: string }
> = {
  Critical: { label: "Critical", color: "var(--chart-5)", mapColor: "#ef4444", badge: "bg-destructive/10 text-destructive border-destructive/20" },
  High: { label: "High", color: "var(--chart-4)", mapColor: "#f59e0b", badge: "bg-warning/15 text-warning-foreground border-warning/30" },
  Medium: { label: "Medium", color: "var(--chart-1)", mapColor: "#3b82f6", badge: "bg-primary/10 text-primary border-primary/20" },
  Low: { label: "Low", color: "var(--chart-3)", mapColor: "#22c55e", badge: "bg-success/10 text-success border-success/20" },
}

export const statusMeta: Record<Status, { label: string; tone: string }> = {
  Submitted: { label: "Submitted", tone: "bg-muted text-muted-foreground border-border" },
  "Under Review": { label: "Under Review", tone: "bg-primary/10 text-primary border-primary/20" },
  Approved: { label: "Approved", tone: "bg-primary/10 text-primary border-primary/20" },
  Assigned: { label: "Assigned", tone: "bg-warning/15 text-warning-foreground border-warning/30" },
  "In Progress": { label: "In Progress", tone: "bg-warning/15 text-warning-foreground border-warning/30" },
  Resolved: { label: "Resolved", tone: "bg-success/10 text-success border-success/20" },
  Rejected: { label: "Rejected", tone: "bg-destructive/10 text-destructive border-destructive/20" },
}

export const timelineSteps: Status[] = [
  "Submitted",
  "Under Review",
  "Approved",
  "Assigned",
  "In Progress",
  "Resolved",
]

export interface Complaint {
  id: string
  category: CategoryKey
  title: string
  description: string
  priority: Priority
  status: Status
  location: string
  lat: number
  lng: number
  date: string
  citizen: string
  officer: string | null
  image: string
  severity: number
  coins: number
}

export const complaints: Complaint[] = [
  {
    id: "CTS-2026-0001",
    category: "Pothole",
    title: "Large pothole near MG Road junction",
    description:
      "A deep pothole has formed at the MG Road junction causing two-wheelers to swerve dangerously into oncoming traffic. Multiple near-misses reported during peak hours.",
    priority: "Critical",
    status: "In Progress",
    location: "MG Road Junction, Sector 14",
    lat: 28.62,
    lng: 77.22,
    date: "2026-06-21",
    citizen: "Aarav Sharma",
    officer: "Eng. R. Mehta",
    image: "/pothole-on-a-city-road.png",
    severity: 92,
    coins: 150,
  },
  {
    id: "CTS-2026-0002",
    category: "Garbage",
    title: "Overflowing garbage bins at market",
    description:
      "Garbage bins outside the central market have not been cleared for four days. Stray animals are scattering waste across the footpath.",
    priority: "High",
    status: "Assigned",
    location: "Central Market, Sector 9",
    lat: 28.63,
    lng: 77.23,
    date: "2026-06-20",
    citizen: "Priya Nair",
    officer: "San. T. Rao",
    image: "/overflowing-garbage-bins-on-a-street.png",
    severity: 74,
    coins: 90,
  },
  {
    id: "CTS-2026-0003",
    category: "Broken Streetlight",
    title: "Streetlights out on Park Avenue",
    description:
      "An entire stretch of streetlights on Park Avenue has been dark for over a week, making the area unsafe for pedestrians at night.",
    priority: "Medium",
    status: "Under Review",
    location: "Park Avenue, Sector 22",
    lat: 28.61,
    lng: 77.21,
    date: "2026-06-22",
    citizen: "Rohan Verma",
    officer: null,
    image: "/dark-broken-streetlight-at-night.png",
    severity: 58,
    coins: 60,
  },
  {
    id: "CTS-2026-0004",
    category: "Water Leakage",
    title: "Major water pipe burst flooding lane",
    description:
      "A water main has burst and is flooding the residential lane, wasting thousands of litres and eroding the road base.",
    priority: "Critical",
    status: "Approved",
    location: "Green Park Lane, Sector 18",
    lat: 28.64,
    lng: 77.2,
    date: "2026-06-19",
    citizen: "Sneha Iyer",
    officer: "Eng. K. Singh",
    image: "/burst-water-pipe-flooding-a-street.png",
    severity: 88,
    coins: 150,
  },
  {
    id: "CTS-2026-0005",
    category: "Drainage Issue",
    title: "Blocked drain causing waterlogging",
    description:
      "The storm drain is completely blocked, leading to ankle-deep waterlogging after every rain near the school gate.",
    priority: "High",
    status: "Resolved",
    location: "School Road, Sector 7",
    lat: 28.6,
    lng: 77.24,
    date: "2026-06-12",
    citizen: "Aarav Sharma",
    officer: "San. T. Rao",
    image: "/blocked-drain-with-stagnant-water.png",
    severity: 70,
    coins: 90,
  },
  {
    id: "CTS-2026-0006",
    category: "Illegal Dumping",
    title: "Construction debris dumped on empty plot",
    description:
      "A contractor has illegally dumped construction debris on the vacant public plot, blocking the walkway and attracting pests.",
    priority: "Medium",
    status: "Submitted",
    location: "Plot 44, Sector 31",
    lat: 28.65,
    lng: 77.25,
    date: "2026-06-23",
    citizen: "Kabir Khan",
    officer: null,
    image: "/construction-debris-dumped-on-empty-lot.png",
    severity: 52,
    coins: 60,
  },
  {
    id: "CTS-2026-0007",
    category: "Public Safety",
    title: "Exposed electrical wires on footpath",
    description:
      "Live electrical wires are hanging dangerously low over the footpath near the bus stop, posing a serious electrocution risk.",
    priority: "Critical",
    status: "Resolved",
    location: "Bus Depot Road, Sector 5",
    lat: 28.59,
    lng: 77.19,
    date: "2026-06-10",
    citizen: "Priya Nair",
    officer: "Eng. R. Mehta",
    image: "/exposed-electrical-wires-hazard.png",
    severity: 95,
    coins: 150,
  },
  {
    id: "CTS-2026-0008",
    category: "Pothole",
    title: "Cracked road surface near flyover",
    description:
      "The approach road to the flyover has developed severe cracks and minor potholes that worsen with each passing truck.",
    priority: "Low",
    status: "Resolved",
    location: "Flyover Approach, Sector 12",
    lat: 28.66,
    lng: 77.18,
    date: "2026-06-08",
    citizen: "Rohan Verma",
    officer: "Eng. K. Singh",
    image: "/cracked-road-surface.png",
    severity: 34,
    coins: 30,
  },
]

export interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string
  reports: number
  coins: number
  successRate: number
  badge: string
}

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Priya Nair", avatar: "/indian-woman-portrait.png", reports: 148, coins: 12450, successRate: 96, badge: "City Champion" },
  { rank: 2, name: "Aarav Sharma", avatar: "/indian-man-portrait.png", reports: 132, coins: 10980, successRate: 93, badge: "Community Hero" },
  { rank: 3, name: "Sneha Iyer", avatar: "/young-indian-woman.png", reports: 119, coins: 9640, successRate: 94, badge: "Community Hero" },
  { rank: 4, name: "Rohan Verma", avatar: "/indian-young-man.png", reports: 101, coins: 8120, successRate: 89, badge: "Verified Reporter" },
  { rank: 5, name: "Kabir Khan", avatar: "/bearded-indian-man.png", reports: 94, coins: 7350, successRate: 88, badge: "Verified Reporter" },
  { rank: 6, name: "Ananya Reddy", avatar: "/smiling-indian-woman.png", reports: 87, coins: 6890, successRate: 91, badge: "Verified Reporter" },
  { rank: 7, name: "Vikram Patel", avatar: "/indian-man-glasses.png", reports: 76, coins: 5980, successRate: 85, badge: "Active Citizen" },
  { rank: 8, name: "Meera Joshi", avatar: "/indian-woman-smiling-headshot.png", reports: 68, coins: 5240, successRate: 87, badge: "Active Citizen" },
]

export interface NotificationItem {
  id: string
  type: "approved" | "assigned" | "resolved" | "coins" | "review"
  title: string
  message: string
  time: string
  read: boolean
  ticket?: string
}

export const notifications: NotificationItem[] = [
  { id: "n1", type: "resolved", title: "Issue Resolved", message: "Your report CTS-2026-0005 (Blocked drain) has been resolved by the municipal team.", time: "2 hours ago", read: false, ticket: "CTS-2026-0005" },
  { id: "n2", type: "coins", title: "Coins Awarded", message: "You earned 90 reward coins for a verified high-priority report.", time: "2 hours ago", read: false },
  { id: "n3", type: "assigned", title: "Issue Assigned", message: "CTS-2026-0002 has been assigned to Sanitation Officer T. Rao.", time: "6 hours ago", read: false, ticket: "CTS-2026-0002" },
  { id: "n4", type: "approved", title: "Complaint Approved", message: "Your report CTS-2026-0004 (Water pipe burst) was approved and marked Critical.", time: "1 day ago", read: true, ticket: "CTS-2026-0004" },
  { id: "n5", type: "review", title: "Under Review", message: "CTS-2026-0003 (Streetlights out) is now under review by the ward office.", time: "1 day ago", read: true, ticket: "CTS-2026-0003" },
  { id: "n6", type: "coins", title: "Coins Awarded", message: "You earned 150 reward coins for a resolved critical safety issue.", time: "3 days ago", read: true },
]

export const monthlyReports = [
  { month: "Jan", reports: 18, resolved: 12 },
  { month: "Feb", reports: 24, resolved: 19 },
  { month: "Mar", reports: 31, resolved: 25 },
  { month: "Apr", reports: 27, resolved: 22 },
  { month: "May", reports: 38, resolved: 30 },
  { month: "Jun", reports: 44, resolved: 36 },
]

export const categoryBreakdown = [
  { category: "Pothole", count: 320 },
  { category: "Garbage", count: 280 },
  { category: "Streetlight", count: 190 },
  { category: "Water", count: 160 },
  { category: "Drainage", count: 145 },
  { category: "Dumping", count: 98 },
  { category: "Safety", count: 72 },
]

export const priorityDistribution = [
  { name: "Critical", value: 18, fill: "var(--chart-5)" },
  { name: "High", value: 27, fill: "var(--chart-4)" },
  { name: "Medium", value: 34, fill: "var(--chart-1)" },
  { name: "Low", value: 21, fill: "var(--chart-3)" },
]

export const resolutionTrend = [
  { month: "Jan", rate: 67 },
  { month: "Feb", rate: 71 },
  { month: "Mar", rate: 74 },
  { month: "Apr", rate: 78 },
  { month: "May", rate: 81 },
  { month: "Jun", rate: 84 },
]

export const hotspots = [
  { zone: "Sector 14", reports: 64, resolved: 51 },
  { zone: "Sector 9", reports: 58, resolved: 49 },
  { zone: "Sector 22", reports: 47, resolved: 38 },
  { zone: "Sector 18", reports: 41, resolved: 35 },
  { zone: "Sector 7", reports: 36, resolved: 31 },
]

export const impactStats = [
  { label: "Reports Submitted", value: 25000, suffix: "+" },
  { label: "Issues Resolved", value: 18000, suffix: "+" },
  { label: "Active Citizens", value: 12000, suffix: "+" },
  { label: "Reward Coins Distributed", value: 500000, suffix: "+" },
]

export interface RewardBadge {
  name: string
  description: string
  cost: number
  unlocked: boolean
  tier: "bronze" | "silver" | "gold" | "platinum"
}

export const rewardBadges: RewardBadge[] = [
  { name: "E-Certificate", description: "Official digital certificate of civic contribution", cost: 500, unlocked: true, tier: "bronze" },
  { name: "Verified Reporter Badge", description: "Recognized for consistent, accurate reporting", cost: 1500, unlocked: true, tier: "silver" },
  { name: "Community Hero Badge", description: "Awarded for outstanding community impact", cost: 4000, unlocked: false, tier: "gold" },
  { name: "City Champion Badge", description: "The highest honor for top civic contributors", cost: 10000, unlocked: false, tier: "platinum" },
]

export interface Achievement {
  name: string
  description: string
  progress: number
  total: number
}

export const achievements: Achievement[] = [
  { name: "First Responder", description: "Submit your first 10 reports", progress: 10, total: 10 },
  { name: "Eagle Eye", description: "Report 50 verified issues", progress: 32, total: 50 },
  { name: "Streak Keeper", description: "Report on 30 consecutive days", progress: 18, total: 30 },
  { name: "Neighborhood Guardian", description: "Get 25 issues resolved", progress: 14, total: 25 },
]

export const currentUser = {
  name: "Aarav Sharma",
  email: "aarav.sharma@email.com",
  phone: "+91 98765 43210",
  city: "New Delhi",
  state: "Delhi",
  avatar: "/indian-man-portrait.png",
  rank: "Community Hero",
  coinBalance: 4280,
  coinsEarned: 10980,
  coinsRedeemed: 6700,
  totalReports: 132,
  resolved: 118,
  pending: 14,
}
