import {
  LayoutDashboard,
  Map,
  FilePlus,
  ListChecks,
  Trophy,
  Gift,
  Bell,
  User,
  Settings,
} from "lucide-react"
import type { NavItem } from "./dashboard-shell"

export const citizenNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Smart City Map", href: "/map", icon: Map },
  { title: "Report Issue", href: "/report", icon: FilePlus },
  { title: "My Complaints", href: "/complaints", icon: ListChecks },
  { title: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { title: "Rewards", href: "/rewards", icon: Gift },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
]

export const adminNav: NavItem[] = [
  { title: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Officer Intelligence", href: "/admin/officers", icon: LayoutDashboard },
  { title: "Complaints", href: "/admin/complaints", icon: ListChecks },
  { title: "Analytics", href: "/admin/analytics", icon: LayoutDashboard },
]
