"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin, Search, X, TriangleAlert as AlertTriangle, Eye, Layers,
  Hospital, GraduationCap, Shield, Map as MapIcon, Satellite, Mountain,
  Flame, Crosshair, Loader as Loader2, Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { currentUser, complaints, type Status, type Priority, type CategoryKey, categories, priorityMeta, type Complaint } from "@/lib/data"
import { wards, computeHotspotAnalysis, type TileLayerKey, type OverlayKey, type FacilityType } from "@/lib/map-data"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HotspotPanel } from "@/components/map/hotspot-panel"
import { AnimatedCard } from "@/components/ai/animated"

import "leaflet/dist/leaflet.css"

const statusOptions: Status[] = ["Submitted", "Under Review", "Approved", "Assigned", "In Progress", "Resolved", "Rejected"]
const priorityOptions: Priority[] = ["Critical", "High", "Medium", "Low"]

function getMarkerColor(priority: Priority): string {
  return priorityMeta[priority].mapColor
}

type HeatmapMode = "priority" | "density" | "ward"

interface MapComponentType extends React.ComponentType<{
  complaints: Complaint[]
  selectedComplaint: Complaint | null
  setSelectedComplaint: (c: Complaint | null) => void
  tileLayer: TileLayerKey
  overlays: Record<OverlayKey, boolean>
  showFacilities: Record<FacilityType, boolean>
  heatmapMode: HeatmapMode
  showNearby: boolean
}> {}

export default function MapPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<Status[]>([])
  const [priorityFilter, setPriorityFilter] = React.useState<Priority[]>([])
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryKey[]>([])
  const [wardFilter, setWardFilter] = React.useState<string[]>([])
  const [dateFilter, setDateFilter] = React.useState<string>("")
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false)
  const [MapComponent, setMapComponent] = React.useState<MapComponentType | null>(null)
  const [mapLoading, setMapLoading] = React.useState(true)

  const [tileLayer, setTileLayer] = React.useState<TileLayerKey>("road")
  const [overlays, setOverlays] = React.useState<Record<OverlayKey, boolean>>({
    heatmap: false,
    cluster: false,
    markers: true,
  })
  const [heatmapMode, setHeatmapMode] = React.useState<HeatmapMode>("priority")
  const [showFacilities, setShowFacilities] = React.useState<Record<FacilityType, boolean>>({
    hospital: false,
    school: false,
    police: false,
  })
  const [showNearby, setShowNearby] = React.useState(false)

  const hotspotAnalysis = React.useMemo(() => computeHotspotAnalysis(), [])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })
      })

      import("@/components/map-component").then((mod) => {
        setMapComponent(() => mod.MapComponent as MapComponentType)
        setTimeout(() => setMapLoading(false), 400)
      })
    }
  }, [])

  const filteredComplaints = React.useMemo(() => {
    let result = [...complaints]

    if (search) {
      const query = search.toLowerCase()
      result = result.filter(c =>
        c.id.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
      )
    }
    if (statusFilter.length > 0) result = result.filter(c => statusFilter.includes(c.status))
    if (priorityFilter.length > 0) result = result.filter(c => priorityFilter.includes(c.priority))
    if (categoryFilter.length > 0) result = result.filter(c => categoryFilter.includes(c.category))
    if (wardFilter.length > 0) {
      result = result.filter(c => {
        const ward = wards.find(w => {
          const dLat = (c.lat - w.center[0]) * 111
          const dLng = (c.lng - w.center[1]) * 111 * Math.cos(w.center[0] * Math.PI / 180)
          return Math.sqrt(dLat * dLat + dLng * dLng) * 1000 <= 800
        })
        return ward && wardFilter.includes(ward.id)
      })
    }
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      result = result.filter(c => {
        const cDate = new Date(c.date)
        return cDate >= filterDate
      })
    }

    return result
  }, [search, statusFilter, priorityFilter, categoryFilter, wardFilter, dateFilter])

  const hasActiveFilters = search || statusFilter.length > 0 || priorityFilter.length > 0 || categoryFilter.length > 0 || wardFilter.length > 0 || dateFilter

  const toggleOverlay = (key: OverlayKey) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleFacility = (type: FacilityType) => {
    setShowFacilities(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const tileLayerOptions: { key: TileLayerKey; label: string; icon: React.ElementType }[] = [
    { key: "road", label: "Road", icon: MapIcon },
    { key: "satellite", label: "Satellite", icon: Satellite },
    { key: "terrain", label: "Terrain", icon: Mountain },
  ]

  const facilityOptions: { key: FacilityType; label: string; icon: React.ElementType }[] = [
    { key: "hospital", label: "Hospitals", icon: Hospital },
    { key: "school", label: "Schools", icon: GraduationCap },
    { key: "police", label: "Police", icon: Shield },
  ]

  return (
    <div className="flex h-[calc(100vh-64px)] relative">
      {/* Mobile filter toggle */}
      <Button
        variant="outline"
        size="sm"
        className="absolute left-4 top-4 z-[1000] md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Layers className="mr-1.5 size-4" />
        {sidebarOpen ? <X className="size-4" /> : "Filters"}
      </Button>

      {/* Mobile hotspot toggle */}
      <Button
        variant="outline"
        size="sm"
        className="absolute right-4 top-4 z-[1000] lg:hidden"
        onClick={() => setRightPanelOpen(!rightPanelOpen)}
      >
        <Flame className="mr-1.5 size-4" />
        Hotspots
      </Button>

      {/* Left Sidebar - Filters */}
      <div className={cn(
        "w-80 shrink-0 overflow-y-auto border-r border-border bg-background absolute inset-y-0 left-0 z-[999] transition-transform duration-300 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">City Map</h2>
            <Badge variant="secondary">{filteredComplaints.length} issues</Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Layers className="size-3.5" />
                  Status
                  {statusFilter.length > 0 && <Badge variant="secondary" className="ml-auto text-xs">{statusFilter.length}</Badge>}
                </Button>
              } />
              <DropdownMenuContent align="start" className="w-56">
                {statusOptions.map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={() => setStatusFilter(prev =>
                      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
                    )}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <AlertTriangle className="size-3.5" />
                  Priority
                  {priorityFilter.length > 0 && <Badge variant="secondary" className="ml-auto text-xs">{priorityFilter.length}</Badge>}
                </Button>
              } />
              <DropdownMenuContent align="start" className="w-56">
                {priorityOptions.map(priority => (
                  <DropdownMenuCheckboxItem
                    key={priority}
                    checked={priorityFilter.includes(priority)}
                    onCheckedChange={() => setPriorityFilter(prev =>
                      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
                    )}
                  >
                    <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: getMarkerColor(priority) }} />
                    {priority}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Layers className="size-3.5" />
                  Category
                  {categoryFilter.length > 0 && <Badge variant="secondary" className="ml-auto text-xs">{categoryFilter.length}</Badge>}
                </Button>
              } />
              <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                {categories.map(cat => (
                  <DropdownMenuCheckboxItem
                    key={cat.key}
                    checked={categoryFilter.includes(cat.key)}
                    onCheckedChange={() => setCategoryFilter(prev =>
                      prev.includes(cat.key) ? prev.filter(c => c !== cat.key) : [...prev, cat.key]
                    )}
                  >
                    {cat.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Building2 className="size-3.5" />
                  Ward
                  {wardFilter.length > 0 && <Badge variant="secondary" className="ml-auto text-xs">{wardFilter.length}</Badge>}
                </Button>
              } />
              <DropdownMenuContent align="start" className="w-56 max-h-64 overflow-y-auto">
                {wards.map(w => (
                  <DropdownMenuCheckboxItem
                    key={w.id}
                    checked={wardFilter.includes(w.id)}
                    onCheckedChange={() => setWardFilter(prev =>
                      prev.includes(w.id) ? prev.filter(x => x !== w.id) : [...prev, w.id]
                    )}
                  >
                    {w.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Date from</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              {dateFilter && (
                <Button variant="ghost" size="sm" className="mt-5" onClick={() => setDateFilter("")}>
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => {
              setSearch("")
              setStatusFilter([])
              setPriorityFilter([])
              setCategoryFilter([])
              setWardFilter([])
              setDateFilter("")
            }} className="w-full gap-2">
              <X className="size-4" />
              Clear All Filters
            </Button>
          )}

          <Separator />

          {/* Map Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Map Controls</h3>

            {/* Tile layer */}
            <div className="grid grid-cols-3 gap-1.5">
              {tileLayerOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.key}
                    onClick={() => setTileLayer(opt.key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border-2 p-2 text-xs transition-all",
                      tileLayer === opt.key ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="size-4" />
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Overlay toggles */}
            <div className="space-y-2 rounded-lg border border-border p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Markers</span>
                <Switch size="sm" checked={overlays.markers} onCheckedChange={() => toggleOverlay("markers")} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Cluster</span>
                <Switch size="sm" checked={overlays.cluster} onCheckedChange={() => toggleOverlay("cluster")} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Heatmap</span>
                <Switch size="sm" checked={overlays.heatmap} onCheckedChange={() => toggleOverlay("heatmap")} />
              </div>
              {overlays.heatmap && (
                <div className="flex gap-1 pt-1">
                  {(["priority", "density", "ward"] as HeatmapMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setHeatmapMode(mode)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors",
                        heatmapMode === mode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nearby facilities */}
            <div className="space-y-2 rounded-lg border border-border p-2.5">
              <p className="text-xs font-medium">Nearby Facilities</p>
              {facilityOptions.map(opt => {
                const Icon = opt.icon
                return (
                  <div key={opt.key} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs">
                      <Icon className="size-3.5" />
                      {opt.label}
                    </span>
                    <Switch size="sm" checked={showFacilities[opt.key]} onCheckedChange={() => toggleFacility(opt.key)} />
                  </div>
                )
              })}
            </div>

            {/* Nearby complaints toggle */}
            <div className="space-y-2 rounded-lg border border-border p-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium">
                  <Crosshair className="size-3.5" />
                  Nearby Complaints
                </span>
                <Switch size="sm" checked={showNearby} onCheckedChange={() => setShowNearby(!showNearby)} />
              </div>
              <p className="text-xs text-muted-foreground">Show 500m radius around selected complaint</p>
            </div>
          </div>

          <Separator />

          {/* Priority Legend */}
          <div className="rounded-lg bg-muted/50 p-3">
            <h3 className="mb-2 text-sm font-medium">Priority Legend</h3>
            <div className="grid gap-1.5 text-xs">
              {priorityOptions.map(priority => (
                <div key={priority} className="flex items-center gap-2">
                  <span className="size-3 rounded-full" style={{ backgroundColor: getMarkerColor(priority) }} />
                  <span>{priority}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Recent Complaints */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Recent Complaints</h3>
            <div className="grid gap-2">
              {filteredComplaints.slice(0, 8).map(complaint => (
                <button
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={cn(
                    "w-full rounded-lg border bg-card p-2.5 text-left transition-all hover:border-primary/40 hover:shadow-sm",
                    selectedComplaint?.id === complaint.id && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={complaint.image}
                        alt={complaint.category}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{complaint.id}</span>
                        <PriorityBadge priority={complaint.priority} className="text-[10px]" />
                      </div>
                      <p className="truncate text-sm font-medium">
                        {complaint.title.split(" ").slice(0, 5).join(" ")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{complaint.location}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1">
        {/* Mobile overlay */}
        <div className={cn("absolute inset-0 z-[998] bg-black/30 md:hidden lg:hidden", (sidebarOpen || rightPanelOpen) ? "block" : "hidden")} onClick={() => { setSidebarOpen(false); setRightPanelOpen(false) }} />

        <div className="relative h-full w-full">
          {MapComponent ? (
            <MapComponent
              complaints={filteredComplaints}
              selectedComplaint={selectedComplaint}
              setSelectedComplaint={setSelectedComplaint}
              tileLayer={tileLayer}
              overlays={overlays}
              showFacilities={showFacilities}
              heatmapMode={heatmapMode}
              showNearby={showNearby}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="size-16 animate-pulse rounded-full bg-primary/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="size-8 text-primary/60" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm">Loading smart city map...</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Complaint Detail Card */}
          {selectedComplaint && (
            <AnimatedCard className="absolute bottom-4 right-4 top-4 z-[500] w-80 overflow-y-auto shadow-xl">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedComplaint.id}</Badge>
                      <PriorityBadge priority={selectedComplaint.priority} />
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => setSelectedComplaint(null)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={selectedComplaint.image}
                      alt={selectedComplaint.category}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>

                  <div>
                    <h3 className="font-medium">{selectedComplaint.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedComplaint.category}</p>
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>{selectedComplaint.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-muted-foreground" />
                      <StatusBadge status={selectedComplaint.status} />
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm">{selectedComplaint.description}</p>
                  </div>

                  <div className="grid gap-2 text-xs text-muted-foreground">
                    <p><span className="font-medium">Citizen:</span> {selectedComplaint.citizen}</p>
                    <p><span className="font-medium">Date:</span> {selectedComplaint.date}</p>
                    {selectedComplaint.officer && (
                      <p><span className="font-medium">Officer:</span> {selectedComplaint.officer}</p>
                    )}
                    <p><span className="font-medium">Coordinates:</span> {selectedComplaint.lat}, {selectedComplaint.lng}</p>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" render={<Link href={`/tracking/${selectedComplaint.id}`} />}>
                    <Eye className="mr-1.5 size-4" />
                    Track Issue
                  </Button>
                </CardContent>
              </Card>
            </AnimatedCard>
          )}
        </div>

        {/* Right Panel - Hotspot Analysis */}
        <div className={cn(
          "w-80 shrink-0 overflow-y-auto border-l border-border bg-background absolute inset-y-0 right-0 z-[999] transition-transform duration-300 lg:relative lg:translate-x-0",
          rightPanelOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          <div className="p-4">
            <HotspotPanel analysis={hotspotAnalysis} />
          </div>
        </div>
      </div>
    </div>
  )
}
