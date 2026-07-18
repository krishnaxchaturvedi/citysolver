"use client"

import * as React from "react"
import { Gift, Star, Crown, Award, Medal, Trophy, Sparkles, CircleCheck as CheckCircle2, Lock, Coins, TrendingUp } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { ProfileSkeleton } from "@/components/loading-skeletons"
import { rewardBadges, achievements, currentUser } from "@/lib/data"
import { getTierBg, getTierBorder, getTierColor } from "@/lib/score-utils"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const tierIcons: Record<string, React.ElementType> = {
  bronze: Medal, silver: Award, gold: Trophy, platinum: Crown,
}

const RewardCard = React.memo(function RewardCard({ badge, index, canAfford, onRedeem }: {
  badge: typeof rewardBadges[number]
  index: number
  canAfford: boolean
  onRedeem: (badge: typeof rewardBadges[number]) => void
}) {
  const TierIcon = tierIcons[badge.tier] || Award
  return (
    <AnimatedCard key={badge.name} delay={index * 100}>
      <Card className={cn("relative overflow-hidden transition-all hover:shadow-md", badge.unlocked && "border-success/30")}>
        <CardContent className="p-4">
          <div className={cn("mb-3 flex size-12 items-center justify-center rounded-xl", getTierBg(badge.tier))}>
            <TierIcon className={cn("size-6", getTierColor(badge.tier))} aria-hidden="true" />
          </div>
          <p className="font-semibold text-sm">{badge.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm font-bold text-warning-foreground">
              <Coins className="size-3.5" aria-hidden="true" />
              {badge.cost.toLocaleString("en-IN")}
            </span>
            {badge.unlocked ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="size-3" aria-hidden="true" /> Unlocked
              </Badge>
            ) : (
              <Button
                size="sm"
                disabled={!canAfford}
                onClick={() => onRedeem(badge)}
                aria-label={`Redeem ${badge.name} for ${badge.cost} coins`}
              >
                {canAfford ? "Redeem" : <><Lock className="mr-1 size-3" aria-hidden="true" /> Locked</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
})

const AchievementCard = React.memo(function AchievementCard({ ach, index }: {
  ach: typeof achievements[number]
  index: number
}) {
  const pct = Math.round((ach.progress / ach.total) * 100)
  const completed = ach.progress >= ach.total
  return (
    <AnimatedCard key={ach.name} delay={index * 100}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              completed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            )}>
              {completed ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <Trophy className="size-5" aria-hidden="true" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{ach.name}</p>
              <p className="text-xs text-muted-foreground">{ach.description}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{ach.progress} / {ach.total}</span>
              <span className={cn("font-semibold", completed && "text-success")} aria-label={`${pct}% complete`}>{pct}%</span>
            </div>
            <AnimatedProgress value={pct} barClassName={completed ? "bg-success" : "bg-primary"} delay={index * 100} />
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
})

const earningGuide = [
  { action: "Submit a report", coins: "30-150", icon: Star },
  { action: "Report verified", coins: "+50", icon: CheckCircle2 },
  { action: "Issue resolved", coins: "+90", icon: Trophy },
  { action: "Daily streak", coins: "+10/day", icon: Sparkles },
] as const

export default function RewardsPage() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const handleRedeem = React.useCallback((badge: typeof rewardBadges[number]) => {
    toast.success("Reward redeemed!", {
      description: `You have unlocked the ${badge.name}.`,
    })
  }, [])

  if (loading) {
    return (
      <DashboardShell items={citizenNav} label="Citizen Portal" title="Rewards" description="Redeem your contribution coins" user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}>
        <ProfileSkeleton />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Rewards"
      description="Redeem your contribution coins"
      user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}
    >
      <AnimatedCard>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-xl bg-warning/15">
                  <Coins className="size-7 text-warning-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Coin Balance</p>
                  <p className="text-3xl font-bold"><AnimatedCounter value={currentUser.coinBalance} /></p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-xl font-bold text-success"><AnimatedCounter value={currentUser.coinsEarned} /></p>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-destructive"><AnimatedCounter value={currentUser.coinsRedeemed} /></p>
                  <p className="text-xs text-muted-foreground">Redeemed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary"><AnimatedCounter value={currentUser.coinBalance} /></p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Gift className="size-5 text-primary" aria-hidden="true" />Redeem Rewards</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rewardBadges.map((badge, i) => (
            <RewardCard
              key={badge.name}
              badge={badge}
              index={i}
              canAfford={currentUser.coinBalance >= badge.cost}
              onRedeem={handleRedeem}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5 text-primary" aria-hidden="true" />Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((ach, i) => <AchievementCard key={ach.name} ach={ach} index={i} />)}
        </div>
      </div>

      <AnimatedCard delay={500}>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-primary" aria-hidden="true" />How to Earn Coins</CardTitle>
            <CardDescription>Contribute to your city and earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {earningGuide.map(item => {
                const Icon = item.icon
                return (
                  <div key={item.action} className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/50">
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.coins} coins</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </DashboardShell>
  )
}
