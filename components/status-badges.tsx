import { cn } from "@/lib/utils"
import { priorityMeta, statusMeta, type Priority, type Status } from "@/lib/data"

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = priorityMeta[priority]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", meta.badge, className)}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.mapColor }} />
      {meta.label}
    </span>
  )
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const meta = statusMeta[status]
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", meta.tone, className)}>
      {meta.label}
    </span>
  )
}
