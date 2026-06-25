import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--accent)_0%,transparent_70%)] opacity-60" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24 lg:px-8">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            National Smart City Initiative
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Building Better Cities Together
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
            Report civic issues, track resolutions, and earn rewards for helping
            improve your city. One platform connecting citizens with their
            municipal corporation.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/report" />}>
              Report Issue
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/dashboard" />}>
              Explore Dashboard
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Live across 28 city wards
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              AI-verified reporting
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <Image
              src="/hero-city.png"
              alt="Citizens reporting civic issues in a smart city"
              width={720}
              height={560}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
            <p className="text-2xl font-bold text-primary">84%</p>
            <p className="text-xs text-muted-foreground">Resolution rate</p>
          </div>
        </div>
      </div>
    </section>
  )
}
