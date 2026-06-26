"use client"

import * as React from "react"
import Image from "next/image"
import { Trophy, Medal, Crown, Coins, FileText, TrendingUp, ArrowUp } from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"

export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { currentUser, leaderboard } from "@/lib/data"

const weeklyLeaderboard = [...leaderboard].map((entry, i) => ({
  ...entry,
  weeklyChange: i < 3 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2)
}))

const monthlyLeaderboard = [...leaderboard].map((entry, i) => ({
  ...entry,
  monthlyChange: i < 2 ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3)
}))

const podiumStyles = [
  {
    rank: 1,
    size: "h-40",
    order: "order-2",
    bg: "bg-gradient-to-b from-yellow-400/20 to-yellow-500/10 border-yellow-500/30",
    trophy: "text-yellow-500",
  },
  {
    rank: 2,
    size: "h-32",
    order: "order-1",
    bg: "bg-gradient-to-b from-gray-400/20 to-gray-500/10 border-gray-500/30",
    trophy: "text-gray-400",
  },
  {
    rank: 3,
    size: "h-28",
    order: "order-3",
    bg: "bg-gradient-to-b from-amber-600/20 to-amber-700/10 border-amber-700/30",
    trophy: "text-amber-700",
  },
]

function PodiumCard({ entry, rank }: { entry: typeof leaderboard[0]; rank: number }) {
  const style = podiumStyles[rank - 1]

  return (
    <div className={cn("flex flex-col items-center gap-3", style.order)}>
      <div className="relative">
        <div className="relative size-20 overflow-hidden rounded-full border-4 border-background shadow-lg">
          <Image
            src={entry.avatar}
            alt={entry.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className={cn(
          "absolute -bottom-1 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background shadow-sm",
          style.bg
        )}>
          <span className="font-bold">{rank}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold">{entry.name}</p>
        <p className="text-xs text-muted-foreground">{entry.badge}</p>
      </div>
      <div className={cn("w-full rounded-xl border-2 p-3", style.bg, style.size)}>
        <div className="flex items-center justify-center gap-1.5 text-lg font-bold">
          <Coins className={cn("size-5", style.trophy)} />
          {entry.coins.toLocaleString("en-IN")}
        </div>
        <p className="text-center text-xs text-muted-foreground">{entry.reports} reports</p>
      </div>
    </div>
  )
}

function LeaderboardList({ data }: { data: typeof leaderboard }) {
  const currentUserRank = leaderboard.findIndex(e => e.name === currentUser.name) + 1

  return (
    <div className="space-y-2">
      {data.map((entry) => {
        const isCurrentUser = entry.name === currentUser.name

        return (
          <div
            key={entry.rank}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/30 hover:shadow-sm",
              isCurrentUser && "border-primary bg-primary/5"
            )}
          >
            <div className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full font-bold",
              entry.rank === 1 && "bg-yellow-500/20 text-yellow-700",
              entry.rank === 2 && "bg-gray-400/20 text-gray-600",
              entry.rank === 3 && "bg-amber-600/20 text-amber-700",
              entry.rank > 3 && "bg-muted"
            )}>
              {entry.rank}
            </div>

            <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
              <Image
                src={entry.avatar}
                alt={entry.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{entry.name}</p>
                {isCurrentUser && <Badge variant="secondary">You</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{entry.badge}</p>
            </div>

            <div className="hidden items-center gap-4 sm:flex">
              <div className="text-center">
                <p className="font-semibold">{entry.reports}</p>
                <p className="text-xs text-muted-foreground">Reports</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-success">{entry.successRate}%</p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-lg font-bold">
              <Coins className="size-5 text-warning" />
              {entry.coins.toLocaleString("en-IN")}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Leaderboard"
      description="Top civic contributors making a difference"
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
    >
      <div className="grid gap-6">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="size-8 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold">Your Rank: #{leaderboard.findIndex(e => e.name === currentUser.name) + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  You&apos;re in the top 2% of all citizens with {currentUser.coinBalance.toLocaleString("en-IN")} coins
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{currentUser.totalReports}</p>
                  <p className="text-xs text-muted-foreground">Reports</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {Math.round((currentUser.resolved / currentUser.totalReports) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Success</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="size-5 text-yellow-500" />
              Top Contributors
            </CardTitle>
            <CardDescription>This week&apos;s champions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-6">
              {leaderboard.slice(0, 3).map((entry, i) => (
                <PodiumCard key={entry.name} entry={entry} rank={i + 1} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-4">
            <LeaderboardList data={weeklyLeaderboard} />
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <LeaderboardList data={monthlyLeaderboard} />
          </TabsContent>

          <TabsContent value="alltime" className="mt-4">
            <LeaderboardList data={leaderboard} />
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 py-6">
              <FileText className="size-10 text-primary" />
              <div>
                <p className="text-2xl font-bold">{leaderboard.reduce((acc, e) => acc + e.reports, 0).toLocaleString("en-IN")}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 py-6">
              <Coins className="size-10 text-warning" />
              <div>
                <p className="text-2xl font-bold">{leaderboard.reduce((acc, e) => acc + e.coins, 0).toLocaleString("en-IN")}</p>
                <p className="text-sm text-muted-foreground">Coins Distributed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 py-6">
              <TrendingUp className="size-10 text-success" />
              <div>
                <p className="text-2xl font-bold">{Math.round(leaderboard.reduce((acc, e) => acc + e.successRate, 0) / leaderboard.length)}%</p>
                <p className="text-sm text-muted-foreground">Avg Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
