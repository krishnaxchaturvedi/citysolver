"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Calendar, Download, ChartBar as BarChart3, ChartPie as PieChartIcon, Activity, Users, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { adminNav } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { currentUser, categoryBreakdown, priorityDistribution, hotspots, resolutionTrend } from "@/lib/data"

export const dynamic = 'force-dynamic'

const chartConfig = {
  complaints: { label: "Complaints", color: "var(--chart-1)" },
  resolved: { label: "Resolved", color: "var(--chart-3)" },
} satisfies ChartConfig

const pieChartConfig = {
  Critical: { label: "Critical", color: "var(--chart-5)" },
  High: { label: "High", color: "var(--chart-4)" },
  Medium: { label: "Medium", color: "var(--chart-1)" },
  Low: { label: "Low", color: "var(--chart-3)" },
} satisfies ChartConfig

const officerPerformance = [
  { name: "R. Mehta", department: "Roads", resolved: 45, avgTime: 3.2, rating: 4.8 },
  { name: "T. Rao", department: "Sanitation", resolved: 38, avgTime: 2.8, rating: 4.6 },
  { name: "K. Singh", department: "Water", resolved: 42, avgTime: 4.1, rating: 4.4 },
  { name: "P. Verma", department: "Electrical", resolved: 35, avgTime: 3.5, rating: 4.7 },
  { name: "S. Kumar", department: "Safety", resolved: 28, avgTime: 2.2, rating: 4.9 },
]

const dailyComplaints = [
  { day: "Mon", complaints: 42, resolved: 38 },
  { day: "Tue", complaints: 38, resolved: 35 },
  { day: "Wed", complaints: 55, resolved: 48 },
  { day: "Thu", complaints: 47, resolved: 42 },
  { day: "Fri", complaints: 63, resolved: 58 },
  { day: "Sat", complaints: 28, resolved: 25 },
  { day: "Sun", complaints: 22, resolved: 20 },
]

const radarData = [
  { category: "Roads", score: 85 },
  { category: "Sanitation", score: 78 },
  { category: "Water", score: 72 },
  { category: "Electricity", score: 88 },
  { category: "Safety", score: 92 },
  { category: "Parking", score: 65 },
]

const satisfactionData = [
  { month: "Jan", score: 72 },
  { month: "Feb", score: 74 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 82 },
  { month: "May", score: 85 },
  { month: "Jun", score: 87 },
]

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("6m")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DashboardShell
      items={adminNav}
      label="Municipal Admin"
      title="Analytics"
      description="Comprehensive civic issue analytics and insights"
      user={{
        name: "Commissioner R. Sharma",
        detail: "Municipal Admin",
        avatar: currentUser.avatar,
      }}
      actions={
        <Button variant="outline" size="sm">
          <Download className="mr-2 size-4" />
          Export Report
        </Button>
      }
    >
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v ?? "6m")}>
              <SelectTrigger className="w-32">
                <Calendar className="mr-2 size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1w">Last Week</SelectItem>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,264</div>
              <p className="mt-1 flex items-center gap-1 text-xs">
                <TrendingUp className="size-3 text-success" />
                <span className="text-success">+12%</span>
                <span className="text-muted-foreground">vs last period</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">84%</div>
              <p className="mt-1 flex items-center gap-1 text-xs">
                <TrendingUp className="size-3 text-success" />
                <span className="text-success">+5%</span>
                <span className="text-muted-foreground">improvement</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.2d</div>
              <p className="mt-1 flex items-center gap-1 text-xs">
                <TrendingDown className="size-3 text-success" />
                <span className="text-success">-0.8d</span>
                <span className="text-muted-foreground">faster</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Satisfaction Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87%</div>
              <p className="mt-1 flex items-center gap-1 text-xs">
                <TrendingUp className="size-3 text-success" />
                <span className="text-success">+5%</span>
                <span className="text-muted-foreground">this month</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {mounted && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5" />
                    Daily Complaints
                  </CardTitle>
                  <CardDescription>Complaints received vs resolved this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyComplaints} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="complaints" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Received</span>
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
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="size-5" />
                    Priority Distribution
                  </CardTitle>
                  <CardDescription>Complaints by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-64 items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={priorityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                          {priorityDistribution.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill.includes('var') ? 'var(--chart-1)' : entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
                    {priorityDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="size-3 rounded-full" style={{ backgroundColor: item.fill.includes('var') ? 'var(--chart-1)' : item.fill }} />
                        <span className="text-muted-foreground">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="size-5" />
                    Category Breakdown
                  </CardTitle>
                  <CardDescription>Complaints by issue category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryBreakdown.map((item) => (
                      <div key={item.category} className="flex items-center gap-3">
                        <span className="w-20 text-sm text-muted-foreground">{item.category}</span>
                        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(item.count / Math.max(...categoryBreakdown.map(c => c.count))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ward Hotspots</CardTitle>
                  <CardDescription>Areas with most complaints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hotspots.map((ward, i) => (
                      <div key={ward.zone} className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{ward.zone}</span>
                            <span className="text-sm text-muted-foreground">{ward.reports}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(ward.resolved / ward.reports) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5" />
                    Resolution Trend
                  </CardTitle>
                  <CardDescription>Monthly resolution rate improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resolutionTrend.map((item) => (
                      <div key={item.month} className="flex items-center gap-3">
                        <span className="w-12 text-sm text-muted-foreground">{item.month}</span>
                        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full"
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.rate}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Citizen Satisfaction
                  </CardTitle>
                  <CardDescription>Satisfaction score trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {satisfactionData.map((item) => (
                      <div key={item.month} className="flex items-center gap-3">
                        <span className="w-12 text-sm text-muted-foreground">{item.month}</span>
                        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-chart-2 rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.score}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5" />
                    Officer Performance
                  </CardTitle>
                  <CardDescription>Top performing field officers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {officerPerformance.map((officer, i) => (
                      <div key={officer.name} className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{officer.name}</span>
                            <Badge variant="secondary">{officer.resolved} resolved</Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{officer.department}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {officer.avgTime}d avg
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Performance across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {radarData.map((item) => (
                      <div key={item.category} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-muted-foreground">{item.category}</span>
                        <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-chart-1 rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
