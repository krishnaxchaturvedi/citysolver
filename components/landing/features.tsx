import {
  BrainCircuit,
  Coins,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Radar,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: Megaphone,
    title: "Civic Issue Reporting",
    description:
      "Report potholes, garbage, broken streetlights and more in seconds with photos, video and voice.",
  },
  {
    icon: BrainCircuit,
    title: "AI Priority Detection",
    description:
      "Our AI engine scores severity, risk and impact to fast-track the most urgent issues automatically.",
  },
  {
    icon: Radar,
    title: "Real-Time Tracking",
    description:
      "Follow every complaint through a transparent timeline from submission to resolution.",
  },
  {
    icon: Coins,
    title: "Rewards & Coins",
    description:
      "Earn reward coins for verified reports and redeem them for badges and certificates.",
  },
  {
    icon: MapPin,
    title: "Interactive Maps",
    description:
      "Visualize issues across your city on a live map with priority-coded markers and filters.",
  },
  {
    icon: LayoutDashboard,
    title: "Municipal Dashboard",
    description:
      "Give municipal staff enterprise tools to assign, manage and resolve complaints at scale.",
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Platform
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Everything a smart city needs in one place
          </h2>
          <p className="text-muted-foreground text-pretty">
            From the first report to the final resolution, CitySolver connects
            citizens, AI and municipal teams seamlessly.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <CardHeader>
                <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-5" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
