export type Priority = "Critical" | "High" | "Medium" | "Low"

export type CategoryKey =
  | "Pothole"
  | "Garbage"
  | "Broken Streetlight"
  | "Water Leakage"
  | "Drainage Issue"
  | "Illegal Dumping"
  | "Public Safety"
  | "Other"

export interface IssueCategory {
  key: CategoryKey
  label: string
  description: string
}

export const categories: IssueCategory[] = [
  { key: "Pothole", label: "Pothole", description: "Road surface damage and craters" },
  { key: "Garbage", label: "Garbage", description: "Uncollected waste and overflow" },
  { key: "Broken Streetlight", label: "Broken Streetlight", description: "Non-functional public lighting" },
  { key: "Water Leakage", label: "Water Leakage", description: "Pipe bursts and water waste" },
  { key: "Drainage Issue", label: "Drainage Issue", description: "Blocked or overflowing drains" },
  { key: "Illegal Dumping", label: "Illegal Dumping", description: "Unauthorized waste disposal" },
  { key: "Public Safety", label: "Public Safety", description: "Hazards endangering citizens" },
  { key: "Other", label: "Other", description: "Any other civic concern" },
]

export const priorityMeta: Record<Priority, { label: string; badge: string }> = {
  Critical: { label: "Critical", badge: "bg-destructive/10 text-destructive border-destructive/20" },
  High: { label: "High", badge: "bg-warning/15 text-warning-foreground border-warning/30" },
  Medium: { label: "Medium", badge: "bg-primary/10 text-primary border-primary/20" },
  Low: { label: "Low", badge: "bg-success/10 text-success border-success/20" },
}
