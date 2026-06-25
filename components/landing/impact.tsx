import { AnimatedCounter } from "@/components/animated-counter"
import { impactStats } from "@/lib/data"

export function Impact() {
  return (
    <section id="impact" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our Impact
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Real change, measured in numbers
          </h2>
          <p className="text-muted-foreground text-pretty">
            Citizens and municipal teams are transforming cities every day on
            CitySolver.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-8 text-center"
            >
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                className="text-3xl font-bold tracking-tight text-primary sm:text-4xl"
              />
              <p className="text-sm text-muted-foreground text-balance">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
