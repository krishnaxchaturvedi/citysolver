"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Timer,
  Smile,
  ArrowRight,
  BarChart3,
} from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badges"
import { PriorityBadge } from "@/components/status-badges"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts"
import { complaints, monthlyReports, priorityDistribution, categoryBreakdown, hotspots, currentUser } from "@/lib/data"

const stats = [
  {
    title: "Total Complaints",
    value: 1264,
    icon: FileText,
    trend: "+12%",
    trendUp: true,
    change: "vs last month",
  },
  {
    title: "Pending Review",
    value: 48,
    icon: Clock,
    trend: "-8%",
    trendUp: true,
    change: "awaiting action",
  },
  {
    title: "Assigned",
    value: 156,
    icon: Users,
    trend: "+5%",
    trendUp: true,
    change: "in queue",
  },
  {
    title: "In Progress",
    value: 89,
    icon: Timer,
    trend: "+2%",
    trendUp: true,
    change: "being resolved",
  },
  {
    title: "Resolved Today",
    value: 34,
    icon: CheckCircle2,
    trend: "+18%",
    trendUp: true,
    change: "completions",
  },
  {
    title: "Critical",
    value: 12,
    icon: AlertTriangle,
    trend: "-3",
    trendUp: false,
    change: "require attention",
    variant: "destructive" as const,
  },
]

const avgResolutionTime = "4.2 days"
const satisfactionScore = 87

const chartConfig = {
  complaints: {
    label: "Complaints",
    color: "var(--chart-1)",
  },
  resolved: {
    label: "Resolved",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const wardData = [
  { ward: "Sector 14", complaints: 64, resolved: 51 },
  { ward: "Sector 9", complaints: 58, resolved: 49 },
  { ward: "Sector 22", complaints: 47, resolved: 38 },
  { ward: "Sector 18", complaints: 41, resolved: 35 },
  { ward: "Sector 7", complaints: 36, resolved: 31 },
  { ward: "Sector 5", complaints: 32, resolved: 28 },
  { ward: "Sector 12", complaints: 28, resolved: 24 },
  { ward: "Sector 31", complaints: 24, resolved: 20 },
]

const recentComplaints = complaints.slice(0, 6)

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      items={adminNav}
      label="Municipal Admin"
      title="Overview"
      description="Municipal Corporation Dashboard - Real-time civic issue management"
      user={{
        name: "Commissioner R. Sharma",
        detail: "Municipal Admin",
        avatar: currentUser.avatar,
      }}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.title} className={stat.variant === "destructive" ? "border-destructive/30" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <stat.icon className={`size-5 ${stat.variant === "destructive" ? "text-destructive" : "text-muted-foreground"}`} />
                  <span className={`text-2xl font-bold ${stat.variant === "destructive" ? "text-destructive" : ""}`}>
                    {stat.value}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs">
                  {stat.trendUp ? (
                    <TrendingUp className="size-3 text-success" />
                  ) : (
                    <TrendingDown className="size-3 text-destructive" />
                  )}
                  <span className={stat.trendUp ? "text-success" : "text-destructive"}>
                    {stat.trend}
                  </span>
                  <span className="text-muted-foreground">{stat.change}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg. Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgResolutionTime}</div>
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <TrendingUp className="size-3" />
                <span>-0.8 days</span>
                <span className="text-muted-foreground">improvement</span>
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Citizen Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{satisfactionScore}%</div>
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <TrendingUp className="size-3" />
                <span>+5%</span>
                <span className="text-muted-foreground">this month</span>
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button variant="outline" size="sm" className="w-full" render={<Link href="/admin/complaints" />}>
                  Review Pending
                  <Badge variant="destructive" className="ml-2">48</Badge>
                </Button>
                <Button variant="outline" size="sm" className="w-full" render={<Link href="/admin/complaints?status=critical" />}>
                  Critical Issues
                  <Badge variant="destructive" className="ml-2">12</Badge>
                </Button>
                <Button variant="outline" size="sm" className="w-full" render={<Link href="/admin/analytics" />}>
                  Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full" render={<Link href="/map" />}>
                  City Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
              <CardDescription>Complaints vs Resolutions over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyReports}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                    <Area type="monotone" dataKey="reports" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="resolved" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Resolved</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ward Distribution</CardTitle>
              <CardDescription>Top 8 complaint hotspots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wardData.slice(0, 5).map((ward) => {
                  const percentage = Math.round((ward.resolved / ward.complaints) * 100)
                  return (
                    <div key={ward.ward} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{ward.ward}</span>
                          <span className="text-muted-foreground">{ward.complaints}</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full" render={<Link href="/admin/analytics" />}>
                View All Wards
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>Latest civic issues requiring attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/admin/complaints" />}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Officer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentComplaints.map((complaint) => (
                  <TableRow key={complaint.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                    <TableCell className="font-medium">{complaint.citizen}</TableCell>
                    <TableCell>{complaint.category}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={complaint.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={complaint.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{complaint.location.split(",")[0]}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {complaint.officer || <span className="text-warning">Unassigned</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
