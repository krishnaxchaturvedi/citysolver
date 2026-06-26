"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  CheckCircle2,
  Coins,
  Trophy,
  Percent,
  PlusCircle,
  Search,
  Map,
  ClipboardList,
} from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid, Tooltip } from "recharts"
import { currentUser, complaints, monthlyReports, categoryBreakdown, priorityDistribution } from "@/lib/data"

const stats = [
  {
    title: "Total Complaints",
    value: currentUser.totalReports,
    icon: FileText,
    trend: "+12%",
    trendUp: true,
  },
  {
    title: "Pending",
    value: currentUser.pending,
    icon: Clock,
    trend: "-8%",
    trendUp: true,
  },
  {
    title: "Resolved",
    value: currentUser.resolved,
    icon: CheckCircle2,
    trend: "+24%",
    trendUp: true,
  },
  {
    title: "Coins Earned",
    value: currentUser.coinsEarned,
    icon: Coins,
    trend: "+18%",
    trendUp: true,
    suffix: " coins",
  },
]

const resolutionRate = Math.round((currentUser.resolved / currentUser.totalReports) * 100)

const chartConfig = {
  reports: {
    label: "Reports",
    color: "var(--chart-1)",
  },
  resolved: {
    label: "Resolved",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const pieChartConfig = {
  Critical: { label: "Critical", color: "var(--chart-5)" },
  High: { label: "High", color: "var(--chart-4)" },
  Medium: { label: "Medium", color: "var(--chart-1)" },
  Low: { label: "Low", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function DashboardPage() {
  const recentComplaints = complaints.slice(0, 5)

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Dashboard"
      description="Track your civic complaints and community impact"
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString("en-IN")}
                  {stat.suffix}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {stat.trendUp ? (
                    <TrendingUp className="size-3 text-success" />
                  ) : (
                    <TrendingDown className="size-3 text-destructive" />
                  )}
                  <span className={stat.trendUp ? "text-success" : "text-destructive"}>
                    {stat.trend}
                  </span>
                  <span>from last month</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-5 text-primary" />
                Community Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-xl bg-primary/10 text-3xl font-bold text-primary">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">{currentUser.rank}</p>
                  <p className="text-sm text-muted-foreground">
                    {132} verified reports this month
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="secondary">Top 1%</Badge>
                    <span className="text-xs text-muted-foreground">
                      of {12000} active citizens
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="size-5 text-success" />
                Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={resolutionRate} className="h-4 w-full">
                <div className="flex items-center justify-between pt-2">
                  <ProgressLabel>{resolutionRate}% resolved</ProgressLabel>
                  <ProgressValue>{currentUser.resolved}/{currentUser.totalReports}</ProgressValue>
                </div>
              </Progress>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">City average: 84%</span>
                <span className="flex items-center gap-1 font-medium text-success">
                  <TrendingUp className="size-3.5" />
                  9% above average
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-auto flex-col gap-2 py-4">
                <Link href="/report">
                  <PlusCircle className="size-5" />
                  Report New Issue
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link href="/tracking/CTS-2026-0001">
                  <Search className="size-5" />
                  Track Complaint
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link href="/map">
                  <Map className="size-5" />
                  City Map
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
                <Link href="/complaints">
                  <ClipboardList className="size-5" />
                  My Complaints
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Reports</CardTitle>
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
              <CardTitle>Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieChartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Complaints</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/complaints">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{complaint.category}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {complaint.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={complaint.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={complaint.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{complaint.date}</TableCell>
                    <TableCell className="text-muted-foreground">{complaint.location}</TableCell>
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
