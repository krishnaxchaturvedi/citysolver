import { Building2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string
  href?: string
  showText?: boolean
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Building2 className="size-5" />
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          City<span className="text-primary">Solver</span>
        </span>
      )}
    </Link>
  )
}
