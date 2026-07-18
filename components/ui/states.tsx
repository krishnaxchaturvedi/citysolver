"use client"

import * as React from "react"
import { RefreshCw, TriangleAlert as AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from "@/components/ui/empty"

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while loading this content.",
  onRetry,
  retryLabel = "Retry",
}: {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-6 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-destructive">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} aria-label={retryLabel}>
            <RefreshCw className="mr-2 size-4" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: React.ElementType
  title: string
  description?: string
  action?: () => void
  actionLabel?: string
}) {
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && actionLabel && (
        <EmptyContent>
          <Button variant="outline" onClick={action} aria-label={actionLabel}>
            {actionLabel}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const refetch = React.useCallback(() => setRetryCount(c => c + 1), [])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then(result => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        }
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, ...deps])

  return { data, loading, error, refetch }
}

export function useDelayedLoading(delay = 300): boolean {
  const [showLoading, setShowLoading] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return showLoading
}
