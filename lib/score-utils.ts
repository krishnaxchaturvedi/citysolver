export function scoreBgColor(score: number): string {
  if (score >= 85) return "bg-success"
  if (score >= 65) return "bg-primary"
  if (score >= 45) return "bg-warning"
  return "bg-destructive"
}

export function scoreTextColor(score: number): string {
  if (score >= 85) return "text-success"
  if (score >= 65) return "text-primary"
  if (score >= 45) return "text-warning-foreground"
  return "text-destructive"
}

export function scoreChartColor(score: number): string {
  if (score >= 85) return "var(--chart-3)"
  if (score >= 65) return "var(--chart-1)"
  if (score >= 45) return "var(--chart-4)"
  return "var(--chart-5)"
}

export interface TierStyle {
  color: string
  bg: string
  border: string
  icon: string
}

export function getTierBg(tier: string): string {
  switch (tier) {
    case "bronze": return "bg-orange-500/10"
    case "silver": return "bg-muted/20"
    case "gold": return "bg-warning/10"
    case "platinum": return "bg-primary/10"
    default: return "bg-muted/20"
  }
}

export function getTierBorder(tier: string): string {
  switch (tier) {
    case "bronze": return "border-orange-500/20"
    case "silver": return "border-muted-foreground/20"
    case "gold": return "border-warning/30"
    case "platinum": return "border-primary/20"
    default: return "border-border"
  }
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case "bronze": return "text-orange-600"
    case "silver": return "text-muted-foreground"
    case "gold": return "text-warning-foreground"
    case "platinum": return "text-primary"
    default: return "text-muted-foreground"
  }
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-IN")
}
