import {
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Map,
  Medal,
  PlusCircle,
  Settings,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export const citizenNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Report Issue", href: "/report", icon: PlusCircle },
  { title: "My Complaints", href: "/complaints", icon: ClipboardList },
  { title: "Map", href: "/map", icon: Map },
  { title: "Rewards", href: "/rewards", icon: Medal },
  { title: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { title: "Notifications", href: "/notifications", icon: Bell, badge: "3" },
  { title: "Profile", href: "/profile", icon: User },
]

export const adminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: Gauge },
  { title: "Complaints", href: "/admin/complaints", icon: FileText },
  { title: "Assignments", href: "/admin/assignments", icon: ListChecks },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]
