"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Coins, Trophy, Award, Gift, History, TrendingUp, Lock, CircleCheck as CheckCircle2, ArrowRight, Star } from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { currentUser, rewardBadges, achievements, complaints } from "@/lib/data"

const tierColors = {
  bronze: "bg-amber-700/10 text-amber-700 border-amber-700/30",
  silver: "bg-gray-400/10 text-gray-600 border-gray-400/30",
  gold: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  platinum: "bg-purple-500/10 text-purple-700 border-purple-500/30",
}

const tierGradients = {
  bronze: "from-amber-700/20 to-amber-900/20",
  silver: "from-gray-400/20 to-gray-600/20",
  gold: "from-yellow-400/20 to-yellow-600/20",
  platinum: "from-purple-400/20 to-purple-600/20",
}

const rewardHistory = [
  { id: 1, action: "Complaint Submitted", coins: 10, date: "2026-06-23", ticket: "CTS-2026-0006" },
  { id: 2, action: "Complaint Approved", coins: 50, date: "2026-06-22", ticket: "CTS-2026-0004" },
  { id: 3, action: "Complaint Resolved", coins: 100, date: "2026-06-21", ticket: "CTS-2026-0005" },
  { id: 4, action: "Complaint Submitted", coins: 10, date: "2026-06-20", ticket: "CTS-2026-0003" },
  { id: 5, action: "Complaint Resolved", coins: 100, date: "2026-06-19", ticket: "CTS-2026-0007" },
  { id: 6, action: "Critical Priority Bonus", coins: 40, date: "2026-06-19", ticket: "CTS-2026-0001" },
  { id: 7, action: "Complaint Approved", coins: 50, date: "2026-06-18", ticket: "CTS-2026-0001" },
  { id: 8, action: "Complaint Submitted", coins: 10, date: "2026-06-17", ticket: "CTS-2026-0001" },
]

export default function RewardsPage() {
  const totalAchievements = achievements.length
  const completedAchievements = achievements.filter(a => a.progress >= a.total).length

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Rewards"
      description="Earn coins and badges for improving your city"
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="size-4 text-primary" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {currentUser.coinBalance.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground">coins available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="size-4 text-success" />
                Lifetime Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currentUser.coinsEarned.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground">total coins earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gift className="size-4 text-warning" />
                Redeemed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currentUser.coinsRedeemed.toLocaleString("in-IN")}
              </div>
              <p className="text-xs text-muted-foreground">coins redeemed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="size-4" />
                Current Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base">
                  {currentUser.rank}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Top 2% of citizens</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress & Achievements</CardTitle>
                <CardDescription>
                  Complete tasks to unlock badges and earn bonus coins
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                {achievements.map((achievement) => {
                  const isComplete = achievement.progress >= achievement.total
                  const percentage = Math.min((achievement.progress / achievement.total) * 100, 100)

                  return (
                    <div key={achievement.name} className="flex gap-4">
                      <div className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-xl",
                        isComplete ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {isComplete ? (
                          <CheckCircle2 className="size-6" />
                        ) : (
                          <Award className="size-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{achievement.name}</h4>
                          <Badge variant={isComplete ? "default" : "secondary"}>
                            {achievement.progress}/{achievement.total}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <Progress value={percentage} className="mt-2 h-2" />
                      </div>
                    </div>
                  )
                })}

                <Separator />

                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm font-medium">
                    {completedAchievements} of {totalAchievements} achievements completed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete all achievements to earn the City Champion badge
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {rewardBadges.map((badge) => (
                <Card
                  key={badge.name}
                  className={cn(
                    "relative overflow-hidden transition-all",
                    badge.unlocked && "ring-2 ring-primary/30",
                    !badge.unlocked && "opacity-70"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-50",
                    tierGradients[badge.tier]
                  )} />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex size-14 items-center justify-center rounded-xl border-2",
                          tierColors[badge.tier],
                          !badge.unlocked && "grayscale"
                        )}>
                          {badge.unlocked ? (
                            <Star className="size-7" />
                          ) : (
                            <Lock className="size-7" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {badge.name}
                            {badge.unlocked && <CheckCircle2 className="size-4 text-success" />}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {badge.tier} Tier
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Coins className="size-4 text-warning" />
                        <span className="font-semibold">{badge.cost.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">coins</span>
                      </div>
                      {badge.unlocked ? (
                        <Button size="sm" variant="secondary">
                          Redeem
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {currentUser.coinBalance >= badge.cost ? "Unlock" : "Not enough coins"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="size-5" />
                  Reward History
                </CardTitle>
                <CardDescription>Your recent coin transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewardHistory.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex size-10 items-center justify-center rounded-full",
                          item.coins > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {item.coins > 0 ? (
                            <TrendingUp className="size-5" />
                          ) : (
                            <ArrowRight className="size-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.action}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{item.date}</span>
                            {item.ticket && (
                              <>
                                <span>·</span>
                                <span className="font-mono">{item.ticket}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-semibold",
                        item.coins > 0 ? "text-success" : "text-destructive"
                      )}>
                        {item.coins > 0 ? "+" : ""}{item.coins}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:text-left">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Gift className="size-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">How to Earn More Coins</h3>
              <p className="text-sm text-muted-foreground">
                Submit complaints (+10), Get approved (+50), Get resolved (+100), Critical priority bonuses (+40)
              </p>
            </div>
            <Button render={<Link href="/report" />}>
              Report an Issue
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
