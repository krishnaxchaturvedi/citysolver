"use client"

import * as React from "react"

export function AnimatedCounter({
  value,
  suffix = "",
  duration = 1800,
  className,
}: {
  value: number
  suffix?: string
  duration?: number
  className?: string
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
            setDisplay(Math.floor(eased * value))
            if (progress < 1) requestAnimationFrame(tick)
            else setDisplay(value)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  )
}
