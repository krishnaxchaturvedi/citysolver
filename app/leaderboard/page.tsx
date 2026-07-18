"use client"

import * as React from "react"
import {
  Trophy, Medal, Award, Crown, Star, TrendingUp,
  Shield, Zap, Target, Flame,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCard, AnimatedCounter } from "@/components/ai/animated"
import { LeaderboardSkeleton } from "@/components/loading-skeletons"
import { leaderboard, currentUser } from "@/lib/data"
import { cn } from "@/lib/utils"

const rankIcon = React.memo(function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="size-5 text-warning-foreground" aria-label="First place" />
  if (rank === 2) return <Medal className="size-5 text-muted-foreground" aria-label="Second place" />
  if (rank === 3) return <Award className="size-5 text-orange-500" aria-label="Third place" />
  return <span className="text-sm font-bold text-muted-foreground">{rank}</span>
})

const PodiumCard = React.memo(function PodiumCard({ entry, delay }: { entry: typeof leaderboard[number]; delay: number }) {
  return (
    <AnimatedCard key={entry.name} delay={delay}>
      <Card className={cn(
        "relative overflow-hidden text-center",
        entry.rank === 1 && "border-warning/30 bg-gradient-to-b from-warning/10 to-transparent",
        entry.rank === 2 && "border-muted-foreground/20",
        entry.rank === 3 && "border-orange-500/20",
      )}>
        <CardContent className="p-6">
          <div className="mb-3 flex justify-center">{rankIcon(entry.rank)}</div>
          <Avatar src={entry.avatar} alt={`${entry.name} avatar`} className={cn("mx-auto size-16", entry.rank === 1 && "ring-4 ring-warning/30")} />
          <p className="mt-3 font-semibold">{entry.name}</p>
          <Badge variant="outline" className="mt-1 text-xs">{entry.badge}</Badge>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold">{entry.reports}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning-foreground">{entry.coins.toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground">Coins</p>
            </div>
            <div>
              <p className="text-lg font-bold text-success">{entry.successRate}%</p>
              <p className="text-xs text-muted-foreground">Success</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
})

const LeaderRow = React.memo(function LeaderRow({ entry, isCurrentUser }: { entry: typeof leaderboard[number]; isCurrentUser: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 focus-within:outline-2 focus-within:outline-ring",
        isCurrentUser && "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex w-8 items-center justify-center">{rankIcon(entry.rank)}</div>
      <Avatar src={entry.avatar} alt={`${entry.name} avatar`} className="size-10" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{entry.name}</p>
        <p className="text-xs text-muted-foreground">{entry.badge}</p>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-semibold">{entry.reports}</p>
          <p className="text-xs text-muted-foreground">Reports</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-success">{entry.successRate}%</p>
          <p className="text-xs text-muted-foreground">Success</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-right">
        <span className="font-bold text-warning-foreground">{entry.coins.toLocaleString("en-IN")}</span>
        <Star className="size-3.5 fill-warning text-warning-foreground" aria-hidden="true" />
      </div>
    </div>
  )
})

const categoryLeaders = [
  { icon: Flame, label: "Most Active Reporter", name: "Priya Nair", value: "148 reports", color: "text-destructive" },
  { icon: Shield, label: "Highest Accuracy", name: "Priya Nair", value: "96% verified", color: "text-success" },
  { icon: Zap, label: "Fastest Responder", name: "Sneha Iyer", value: "94% response", color: "text-primary" },
] as const

export default function LeaderboardPage() {
  const [period, setPeriod] = React.useState<"month" | "all">("month")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const top3 = React.useMemo(() => leaderboard.slice(0, 3), [])
  const fullList = React.useMemo(() => leaderboard, [])

  if (loading) {
    return (
      <DashboardShell items={citizenNav} label="Citizen Portal" title="Leaderboard" description="Top civic contributors in your city" user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}>
        <LeaderboardSkeleton />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Leaderboard"
      description="Top civic contributors in your city"
      user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}
    >
      <AnimatedCard>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Avatar src={currentUser.avatar} alt={currentUser.name} className="size-16 ring-4 ring-primary/20" />
                <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground" aria-label="Your rank: 2">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{currentUser.name}</h2>
                  <Badge variant="secondary" className="gap-1"><Trophy className="size-3" aria-hidden="true" /> {currentUser.rank}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">You are ranked #2 this month — 132 reports, 118 resolved</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary"><AnimatedCounter value={currentUser.totalReports} /></p>
                  <p className="text-xs text-muted-foreground">Reports</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-success"><AnimatedCounter value={currentUser.resolved} /></p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning-foreground"><AnimatedCounter value={currentUser.coinBalance} /></p>
                  <p className="text-xs text-muted-foreground">Coins</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="mt-6 flex gap-2" role="group" aria-label="Select leaderboard period">
        {(["month", "all"] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              period === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            {p === "month" ? "This Month" : "All Time"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {top3.map((entry, i) => <PodiumCard key={entry.name} entry={entry} delay={i * 120} />)}
      </div>

      <AnimatedCard delay={400}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-primary" aria-hidden="true" />Full Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fullList.map(entry => <LeaderRow key={entry.name} entry={entry} isCurrentUser={entry.name === currentUser.name} />)}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {categoryLeaders.map((cat, i) => {
          const Icon = cat.icon
          return (
            <AnimatedCard key={cat.label} delay={i * 100}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex size-10 items-center justify-center rounded-lg bg-muted/50", cat.color)}>
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{cat.label}</p>
                      <p className="text-sm font-semibold">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )
        })}
      </div>
    </DashboardShell>
  )
}
