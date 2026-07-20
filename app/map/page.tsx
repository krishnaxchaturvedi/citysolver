"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { currentUser, complaints, priorityMeta } from "@/lib/data"
import { PriorityBadge, StatusBadge } from "@/components/status-badges"
import { HotspotIntelligencePanel } from "@/components/map/hotspot-intelligence-panel"
import { HotspotPredictionPanel } from "@/components/ai/hotspot-prediction-panel"
import { intensityColors, type IntensityLevel, type OverlayKey, overlayLabels } from "@/lib/map-data"
import { MapPin, Layers, Flame, Grid3x3, Building2, CircleDot, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const MapComponent = dynamic(() => import("@/components/map-component").then(m => m.MapComponent), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-xl bg-muted/30">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
})

const overlayIcons: Record<OverlayKey, React.ElementType> = {
  markers: MapPin,
  cluster: CircleDot,
  heatmap: Flame,
  density: Grid3x3,
  ward: Building2,
}

function AnimatedLegend() {
  const levels = Object.entries(intensityColors) as [IntensityLevel, typeof intensityColors[IntensityLevel]][]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Info className="size-3.5" aria-hidden="true" />
        Intensity:
      </div>
      {levels.map(([key, val], i) => (
        <div
          key={key}
          className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span
            className="size-3 rounded-full transition-transform hover:scale-125"
            style={{ backgroundColor: val.hex, boxShadow: `0 0 8px ${val.hex}40` }}
            aria-hidden="true"
          />
          <span className="text-xs font-medium" style={{ color: val.hex }}>{val.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function MapPage() {
  const [selectedComplaint, setSelectedComplaint] = React.useState<typeof complaints[number] | null>(null)
  const [tileLayer, setTileLayer] = React.useState<"road" | "satellite" | "terrain">("road")
  const [overlays, setOverlays] = React.useState<Record<OverlayKey, boolean>>({
    markers: true,
    cluster: false,
    heatmap: false,
    density: false,
    ward: false,
  })
  const [heatmapMode, setHeatmapMode] = React.useState<"priority" | "density" | "ward">("priority")
  const [showNearby, setShowNearby] = React.useState(false)

  const toggleOverlay = React.useCallback((key: OverlayKey) => {
    setOverlays(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (next[key] && (key === "heatmap" || key === "density" || key === "ward")) {
        next.heatmap = key === "heatmap" ? true : false
        next.density = key === "density" ? true : false
        next.ward = key === "ward" ? true : false
        if (key === "density") setHeatmapMode("density")
        else if (key === "ward") setHeatmapMode("ward")
        else setHeatmapMode("priority")
      }
      return next
    })
  }, [])

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Smart City Map"
      description="Real-time complaint mapping with intelligence"
      user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="size-4 text-primary" aria-hidden="true" />
                    Map Layers
                  </CardTitle>
                  <CardDescription className="text-xs">Toggle visualization modes</CardDescription>
                </div>
                <div className="flex gap-1.5" role="group" aria-label="Base map style">
                  {(["road", "satellite", "terrain"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTileLayer(t)}
                      aria-pressed={tileLayer === t}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition-all focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                        tileLayer === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Map overlays">
                {(Object.keys(overlayLabels) as OverlayKey[]).map(key => {
                  const Icon = overlayIcons[key]
                  const active = overlays[key]
                  return (
                    <button
                      key={key}
                      onClick={() => toggleOverlay(key)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                        active ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {overlayLabels[key]}
                    </button>
                  )
                })}
                <button
                  onClick={() => setShowNearby(!showNearby)}
                  aria-pressed={showNearby}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                    showNearby ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  <MapPin className="size-3.5" aria-hidden="true" />
                  Nearby
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="h-[500px] w-full overflow-hidden rounded-xl">
                <MapComponent
                  complaints={complaints}
                  selectedComplaint={selectedComplaint}
                  setSelectedComplaint={setSelectedComplaint}
                  tileLayer={tileLayer}
                  overlays={overlays}
                  showFacilities={{ hospital: false, school: false, police: false }}
                  heatmapMode={heatmapMode}
                  showNearby={showNearby}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
                <AnimatedLegend />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {(["Critical", "High", "Medium", "Low"] as const).map(p => (
                    <div key={p} className="flex items-center gap-1">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: priorityMeta[p].mapColor }} aria-hidden="true" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Active Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {complaints.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedComplaint(c)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                      selectedComplaint?.id === c.id && "border-primary bg-primary/5"
                    )}
                    aria-label={`Select complaint ${c.id}: ${c.title}`}
                  >
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <HotspotPredictionPanel />
          <HotspotIntelligencePanel />
        </div>
      </div>
    </DashboardShell>
  )
}
