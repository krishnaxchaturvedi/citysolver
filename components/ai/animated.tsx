"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function AnimatedCounter({
  value,
  suffix = "",
  duration = 1400,
  className,
  decimals = 0,
}: {
  value: number
  suffix?: string
  duration?: number
  className?: string
  decimals?: number
}) {
  const [display, setDisplay] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)
  const started = React.useRef(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(eased * value)
            if (progress < 1) requestAnimationFrame(tick)
            else setDisplay(value)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [value, duration])

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.floor(display).toLocaleString("en-IN")

  return (
    <span ref={ref} className={className}>
      {formatted}{suffix}
    </span>
  )
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  barClassName,
  delay = 0,
  duration = 1200,
}: {
  value: number
  max?: number
  className?: string
  barClassName?: string
  delay?: number
  duration?: number
}) {
  const [width, setWidth] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)
  const started = React.useRef(false)
  const pct = Math.min((value / max) * 100, 100)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          setTimeout(() => {
            const start = performance.now()
            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setWidth(eased * pct)
              if (progress < 1) requestAnimationFrame(tick)
              else setWidth(pct)
            }
            requestAnimationFrame(tick)
          }, delay)
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [pct, delay, duration])

  return (
    <div ref={ref} className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-none", barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const [visible, setVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
    >
      {children}
    </div>
  )
}
