"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Search, ListFilter as Filter, X, TriangleAlert as AlertTriangle, Eye, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { currentUser, complaints, type Status, type Priority, type CategoryKey, categories, priorityMeta, type Complaint } from "@/lib/data"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badges"
import { PriorityBadge } from "@/components/status-badges"
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
import { Separator } from "@/components/ui/separator"

import "leaflet/dist/leaflet.css"

const statusOptions: Status[] = ["Submitted", "Under Review", "Approved", "Assigned", "In Progress", "Resolved", "Rejected"]
const priorityOptions: Priority[] = ["Critical", "High", "Medium", "Low"]

const center: [number, number] = [28.62, 77.22]
const zoom = 13

function getMarkerColor(priority: Priority): string {
  return priorityMeta[priority].mapColor
}

export default function MapPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<Status[]>([])
  const [priorityFilter, setPriorityFilter] = React.useState<Priority[]>([])
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryKey[]>([])
  const [showHeatmap, setShowHeatmap] = React.useState(false)
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null)
  const [MapComponents, setMapComponents] = React.useState<React.ComponentType<{
    complaints: Complaint[]
    selectedComplaint: Complaint | null
    setSelectedComplaint: (c: Complaint | null) => void
  }> | null>(null)

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
        setMapComponents(() => mod.MapComponent)
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

    if (statusFilter.length > 0) {
      result = result.filter(c => statusFilter.includes(c.status))
    }

    if (priorityFilter.length > 0) {
      result = result.filter(c => priorityFilter.includes(c.priority))
    }

    if (categoryFilter.length > 0) {
      result = result.filter(c => categoryFilter.includes(c.category))
    }

    return result
  }, [search, statusFilter, priorityFilter, categoryFilter])

  const hasActiveFilters = search || statusFilter.length > 0 || priorityFilter.length > 0 || categoryFilter.length > 0

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80 shrink-0 overflow-y-auto border-r border-border bg-background p-4">
        <div className="space-y-4">
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

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="size-3.5" />
                  Status
                  {statusFilter.length > 0 && <span className="text-xs">({statusFilter.length})</span>}
                </Button>
              } />
              <DropdownMenuContent align="start" className="w-48">
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
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="size-3.5" />
                  Priority
                  {priorityFilter.length > 0 && <span className="text-xs">({priorityFilter.length})</span>}
                </Button>
              } />
              <DropdownMenuContent align="start" className="w-48">
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
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="size-3.5" />
                  Category
                  {categoryFilter.length > 0 && <span className="text-xs">({categoryFilter.length})</span>}
                </Button>
              } />
              <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
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
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => {
              setSearch("")
              setStatusFilter([])
              setPriorityFilter([])
              setCategoryFilter([])
            }} className="w-full gap-2">
              <X className="size-4" />
              Clear All Filters
            </Button>
          )}

          <div className="grid gap-2">
            <Button
              variant={showHeatmap ? "default" : "outline"}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Layers className="size-4" />
              Show Hotspots
            </Button>
          </div>

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

          <Separator className="my-2" />

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

      <div className="relative flex-1">
        {MapComponents ? (
          <MapComponents
            complaints={filteredComplaints}
            selectedComplaint={selectedComplaint}
            setSelectedComplaint={setSelectedComplaint}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-4">
              <div className="size-16 animate-pulse rounded-full bg-primary/20" />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}

        {selectedComplaint && (
          <Card className="absolute bottom-4 right-4 top-4 w-80 overflow-y-auto shadow-lg">
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

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" render={<Link href={`/tracking/${selectedComplaint.id}`} />}>
                  <Eye className="mr-1.5 size-4" />
                  Track Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
