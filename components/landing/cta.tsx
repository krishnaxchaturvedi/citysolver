import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Ready to help build a better city?
          </h2>
          <p className="max-w-xl text-primary-foreground/80 text-pretty">
            Join thousands of active citizens making a measurable difference.
            Report your first issue in under a minute.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              render={<Link href="/register" />}
            >
              Create free account
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/report" />}
            >
              Report an issue
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
