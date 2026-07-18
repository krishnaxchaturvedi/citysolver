import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Map, FilePlus, Trophy, Brain } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-primary/5 via-background to-background p-8">
      <div className="text-center space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
          <Brain className="size-4" aria-hidden="true" />
          AI-Powered Civic Platform
        </div>
        <h1 className="text-5xl font-bold tracking-tight">CitySolver</h1>
        <p className="text-lg text-muted-foreground">
          Smart civic issue resolution platform connecting citizens and municipal officers with AI-driven analysis.
        </p>
      </div>
      <div className="flex gap-4">
        <Button render={<Link href="/dashboard" />}>Citizen Portal <ArrowRight className="size-4" aria-hidden="true" /></Button>
        <Button variant="outline" render={<Link href="/admin" />}>Admin Dashboard</Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-8">
        {[
          { icon: Map, title: "Smart City Map", desc: "Real-time complaint mapping with heatmaps" },
          { icon: FilePlus, title: "AI Report Filing", desc: "Intelligent complaint analysis and routing" },
          { icon: Trophy, title: "Citizen Rewards", desc: "Earn coins and badges for contributions" },
        ].map((f) => (
          <Card key={f.title} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6 text-center">
              <f.icon className="mx-auto mb-3 size-8 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
