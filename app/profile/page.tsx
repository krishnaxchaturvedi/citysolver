"use client"

import * as React from "react"
import { Shield, Star, Award, Trophy, Crown, Medal, Target, TrendingUp, CircleCheck as CheckCircle2, Zap, Mail, Phone, MapPin, Sparkles, Activity, Users, Heart, Clock, Building2 } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { AnimatedCard, AnimatedCounter, AnimatedProgress } from "@/components/ai/animated"
import { ProfileSkeleton } from "@/components/loading-skeletons"
import { currentUser } from "@/lib/data"
import { currentCitizen, reputationBadges, citizenAchievements, currentVolunteerLevel, currentCommunityImpact, reputationTrend, contributionBreakdown } from "@/lib/citizen-data"
import { CitizenAIPanel } from "@/components/ai/citizen-ai-panel"
import { useAuth } from "@/lib/supabase/auth-context"
import { scoreBgColor } from "@/lib/score-utils"
import { cn } from "@/lib/utils"

const tierIcons: Record<string, React.ElementType> = {
  bronze: Medal, silver: Award, gold: Trophy, platinum: Crown,
}

const LazyResponsiveContainer = React.lazy(async () => ({ default: (await import("recharts")).ResponsiveContainer }))
const LazyLineChart = React.lazy(async () => ({ default: (await import("recharts")).LineChart }))
const LazyLine = React.lazy(async () => ({ default: (await import("recharts")).Line }))
const LazyAreaChart = React.lazy(async () => ({ default: (await import("recharts")).AreaChart }))
const LazyArea = React.lazy(async () => ({ default: (await import("recharts")).Area }))
const LazyBarChart = React.lazy(async () => ({ default: (await import("recharts")).BarChart }))
const LazyBar = React.lazy(async () => ({ default: (await import("recharts")).Bar }))
const LazyXAxis = React.lazy(async () => ({ default: (await import("recharts")).XAxis }))
const LazyYAxis = React.lazy(async () => ({ default: (await import("recharts")).YAxis }))
const LazyCartesianGrid = React.lazy(async () => ({ default: (await import("recharts")).CartesianGrid }))
const LazyTooltip = React.lazy(async () => ({ default: (await import("recharts")).Tooltip }))
const LazyLegend = React.lazy(async () => ({ default: (await import("recharts")).Legend }))

function ChartFallback({ height = 200 }: { height?: number }) {
  return <div className="flex items-center justify-center" style={{ height }} aria-busy="true"><div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
}

const ReputationStatCard = React.memo(function ReputationStatCard({ label, value, suffix, icon: Icon, color, delay }: {
  label: string
  value: number
  suffix?: string
  icon: React.ElementType
  color: string
  delay: number
}) {
  return (
    <AnimatedCard key={label} delay={delay}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-10 items-center justify-center rounded-lg bg-muted/50", color)}>
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold"><AnimatedCounter value={value} suffix={suffix || ""} /></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>
  )
})

const ContributionBar = React.memo(function ContributionBar({ label, value, total, danger, delay }: {
  label: string
  value: number
  total: number
  danger?: boolean
  delay: number
}) {
  const pct = (value / total) * 100
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", danger && value > 0 && "text-destructive")}>{value}</span>
      </div>
      <AnimatedProgress value={pct} barClassName={danger ? "bg-destructive" : scoreBgColor(pct)} delay={delay} />
    </div>
  )
})

const AchievementItem = React.memo(function AchievementItem({ ach, delay }: {
  ach: typeof citizenAchievements[number]
  delay: number
}) {
  const pct = Math.round((ach.progress / ach.total) * 100)
  return (
    <div key={ach.name}>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          {ach.completed ? <CheckCircle2 className="size-3 text-success" aria-hidden="true" /> : <Target className="size-3 text-muted-foreground" aria-hidden="true" />}
          {ach.name}
        </span>
        <span className={cn("font-semibold", ach.completed && "text-success")}>{ach.progress}/{ach.total}</span>
      </div>
      <AnimatedProgress value={pct} barClassName={ach.completed ? "bg-success" : "bg-primary"} delay={delay} />
    </div>
  )
})

const impactStats: { icon: React.ElementType; label: string; key: keyof typeof currentCommunityImpact; color: string; suffix?: string }[] = [
  { icon: Users, label: "People Helped", key: "peopleHelped", color: "text-success" },
  { icon: Building2, label: "Areas Improved", key: "areasImproved", color: "text-primary" },
  { icon: CheckCircle2, label: "Issues Resolved", key: "issuesResolved", color: "text-success" },
  { icon: Clock, label: "Response Time Saved (hrs)", key: "responseTimeSaved", color: "text-warning-foreground" },
  { icon: Heart, label: "Citizen Trust Built", key: "citizenTrustBuilt", suffix: "%", color: "text-primary" },
  { icon: Trophy, label: "Ward Rank", key: "wardRank", color: "text-warning-foreground" },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const citizen = currentCitizen
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const reputationStats = React.useMemo(() => [
    { label: "Trust Score", value: citizen.trustScore, icon: Shield, color: "text-success" },
    { label: "Contribution Score", value: citizen.contributionScore, icon: TrendingUp, color: "text-primary" },
    { label: "Response Rate", value: citizen.responseRate, suffix: "%", icon: Zap, color: "text-warning-foreground" },
    { label: "Coins", value: citizen.coins, icon: Star, color: "text-warning-foreground" },
  ], [citizen])

  const contributionStats = React.useMemo(() => [
    { label: "Monthly Contribution", value: citizen.monthlyContribution, total: 30 },
    { label: "Lifetime Contribution", value: citizen.lifetimeContribution, total: 150 },
    { label: "Verified Complaints", value: citizen.verifiedComplaints, total: citizen.lifetimeContribution },
    { label: "False Reports", value: citizen.falseReports, total: 10, danger: true },
  ], [citizen])

  const verifiedRate = React.useMemo(
    () => Math.round((citizen.verifiedComplaints / citizen.lifetimeContribution) * 100),
    [citizen]
  )

  if (loading) {
    return (
      <DashboardShell items={citizenNav} label="Citizen Portal" title="Profile" description="Your reputation and contribution overview" user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}>
        <ProfileSkeleton />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Profile"
      description="Your reputation and contribution overview"
      user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}
    >
      <AnimatedCard>
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" aria-hidden="true" />
          <CardContent className="-mt-12 p-6">
            <div className="flex flex-wrap items-end gap-4">
              <Avatar src={citizen.avatar} alt={`${citizen.name} profile photo`} className="size-24 ring-4 ring-background" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{citizen.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1"><Crown className="size-3 text-warning-foreground" aria-hidden="true" /> {citizen.communityRank}</Badge>
                  <Badge variant="outline" className="gap-1"><Sparkles className="size-3 text-primary" aria-hidden="true" /> {citizen.volunteerRank}</Badge>
                  <Badge variant="outline" className="font-mono text-xs">{citizen.id}</Badge>
                  {citizen.badges.includes("Verified Reporter") && (
                    <Badge variant="success" className="gap-1"><CheckCircle2 className="size-3" aria-hidden="true" /> Verified Reporter</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-right">
                <Star className="size-5 fill-warning text-warning-foreground" aria-hidden="true" />
                <span className="text-2xl font-bold">{citizen.trustScore}</span>
                <span className="text-sm text-muted-foreground">/100 Trust</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" aria-hidden="true" /> {currentUser.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" aria-hidden="true" /> {currentUser.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" aria-hidden="true" /> {currentUser.city}, {currentUser.state}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Trophy className="size-4" aria-hidden="true" /> {citizen.achievements} achievements</div>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reputationStats.map((s, i) => (
          <ReputationStatCard key={s.label} label={s.label} value={s.value} suffix={s.suffix} icon={s.icon} color={s.color} delay={i * 80} />
        ))}
      </div>

      <div className="mt-6">
        {user && <CitizenAIPanel userId={user.id} />}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimatedCard delay={160}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="size-4 text-primary" aria-hidden="true" /> Reputation Trend</CardTitle>
              <CardDescription className="text-xs">Trust & contribution scores over 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={<ChartFallback />}>
                <LazyResponsiveContainer width="100%" height={220}>
                  <LazyLineChart data={reputationTrend}>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <LazyXAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <LazyYAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" domain={[60, 100]} />
                    <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                    <LazyLegend wrapperStyle={{ fontSize: 11 }} />
                    <LazyLine type="monotone" dataKey="trustScore" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} name="Trust Score" />
                    <LazyLine type="monotone" dataKey="contributionScore" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} name="Contribution Score" />
                  </LazyLineChart>
                </LazyResponsiveContainer>
              </React.Suspense>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={240}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Activity className="size-4 text-primary" aria-hidden="true" /> Monthly Reports vs Resolved</CardTitle>
              <CardDescription className="text-xs">Your complaint activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <React.Suspense fallback={<ChartFallback />}>
                <LazyResponsiveContainer width="100%" height={220}>
                  <LazyAreaChart data={reputationTrend}>
                    <defs>
                      <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <LazyXAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <LazyYAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <LazyTooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                    <LazyLegend wrapperStyle={{ fontSize: 11 }} />
                    <LazyArea type="monotone" dataKey="reports" stroke="var(--chart-1)" fill="url(#repGrad)" strokeWidth={2} name="Reports" />
                    <LazyLine type="monotone" dataKey="resolved" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
                  </LazyAreaChart>
                </LazyResponsiveContainer>
              </React.Suspense>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AnimatedCard delay={320}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="size-4 text-primary" aria-hidden="true" /> Volunteer Level</CardTitle>
              <CardDescription className="text-xs">Your community volunteer tier and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15">
                  <Crown className="size-6 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold">{currentVolunteerLevel.level}</p>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{currentVolunteerLevel.tier} Tier</Badge>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress to {currentVolunteerLevel.nextLevel}</span>
                  <span className="font-semibold text-primary">{currentVolunteerLevel.progress}%</span>
                </div>
                <AnimatedProgress value={currentVolunteerLevel.progress} barClassName="bg-primary" delay={400} />
                <p className="mt-1 text-xs text-muted-foreground">{currentVolunteerLevel.pointsToNext} points to next level</p>
              </div>
              <Separator className="my-3" />
              <div className="space-y-1.5">
                {currentVolunteerLevel.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3 text-success shrink-0" aria-hidden="true" />
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={400}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Heart className="size-4 text-primary" aria-hidden="true" /> Community Impact</CardTitle>
              <CardDescription className="text-xs">Your contribution's real-world effect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {impactStats.map((stat, i) => {
                  const Icon = stat.icon
                  const value = currentCommunityImpact[stat.key]
                  return (
                    <div key={stat.label} className="rounded-lg border border-border p-3 transition-colors hover:bg-accent/50">
                      <div className={cn("mb-1 flex size-8 items-center justify-center rounded-lg bg-muted/50", stat.color)}>
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                      <p className="text-xl font-bold">
                        <AnimatedCounter value={value} suffix={stat.suffix || ""} />
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <AnimatedCard delay={480}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Activity className="size-4 text-primary" aria-hidden="true" /> Contribution Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contributionStats.map((stat, i) => (
                <ContributionBar key={stat.label} label={stat.label} value={stat.value} total={stat.total} danger={stat.danger} delay={i * 100} />
              ))}
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={560}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Award className="size-4 text-primary" aria-hidden="true" /> Earned Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {citizen.badges.map(badge => (
                  <Badge key={badge} variant="secondary" className="gap-1"><Trophy className="size-3 text-warning-foreground" aria-hidden="true" />{badge}</Badge>
                ))}
              </div>
              <Separator className="my-3" />
              <p className="mb-2 text-xs text-muted-foreground">All available badges</p>
              <div className="grid grid-cols-2 gap-2">
                {reputationBadges.map(badge => {
                  const TierIcon = tierIcons[badge.tier] || Award
                  const unlocked = citizen.badges.includes(badge.name)
                  return (
                    <div
                      key={badge.name}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2 transition-colors",
                        unlocked ? (badge.tier === "bronze" ? "bg-orange-500/10 border-orange-500/20" : badge.tier === "silver" ? "bg-muted/20 border-muted-foreground/20" : badge.tier === "gold" ? "bg-warning/10 border-warning/30" : "bg-primary/10 border-primary/20") : "border-border opacity-50"
                      )}
                    >
                      <TierIcon className={cn("size-4", unlocked ? (badge.tier === "bronze" ? "text-orange-600" : badge.tier === "silver" ? "text-muted-foreground" : badge.tier === "gold" ? "text-warning-foreground" : "text-primary") : "text-muted-foreground")} aria-hidden="true" />
                      <span className="text-xs font-medium">{badge.name}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard delay={640}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Target className="size-4 text-primary" aria-hidden="true" /> Achievements Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {citizenAchievements.slice(0, 5).map((ach, i) => <AchievementItem key={ach.name} ach={ach} delay={i * 80} />)}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={720}>
        <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Shield className="size-4 text-primary" aria-hidden="true" />Trust & Reputation Analysis</CardTitle>
            <CardDescription>AI-powered assessment of your civic contribution quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-success"><AnimatedCounter value={citizen.trustScore} suffix="/100" /></p>
                <p className="text-sm text-muted-foreground">Trust Score</p>
                <AnimatedProgress value={citizen.trustScore} barClassName="bg-success" delay={780} className="mt-2" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary"><AnimatedCounter value={citizen.contributionScore} suffix="/100" /></p>
                <p className="text-sm text-muted-foreground">Contribution Score</p>
                <AnimatedProgress value={citizen.contributionScore} barClassName="bg-primary" delay={840} className="mt-2" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning-foreground"><AnimatedCounter value={citizen.responseRate} suffix="%" /></p>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <AnimatedProgress value={citizen.responseRate} barClassName="bg-warning" delay={900} className="mt-2" />
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                Your trust score is <span className="font-semibold text-success">Excellent</span> — you are in the top 5% of citizens.
                Your verified complaint rate is {verifiedRate}% with only {citizen.falseReports} false report{citizen.falseReports === 1 ? "" : "s"}.
                Keep contributing to maintain your {citizen.communityRank} status!
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedCard>
    </DashboardShell>
  )
}
