"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, Rectangle, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import type { Complaint, Priority, CategoryKey } from "@/lib/data"
import { priorityMeta, categories, complaints as allComplaints } from "@/lib/data"
import {
  facilities,
  wards,
  tileLayerUrls,
  type TileLayerKey,
  type OverlayKey,
  type FacilityType,
  getNearbyComplaints,
  getNearbyFacilities,
} from "@/lib/map-data"

function getMarkerColor(priority: Priority): string {
  return priorityMeta[priority].mapColor
}

const categoryIcons: Record<string, string> = {
  Pothole: "M12 2L4 14h7l-1 8 8-12h-7l1-8z",
  Garbage: "M6 2v6h12V2H6zm0 8v12h12V10H6z",
  "Broken Streetlight": "M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z",
  "Water Leakage": "M12 2C8 6 6 9 6 13a6 6 0 0012 0c0-4-2-7-6-11z",
  "Drainage Issue": "M3 12h18M3 6h18M3 18h18",
  "Illegal Dumping": "M3 6l9-4 9 4-9 4-9-4zm0 6l9 4 9-4M3 18l9 4 9-4",
  "Public Safety": "M12 1L3 5v6c0 5 4 9 9 10 5-1 9-5 9-10V5l-9-4z",
  Other: "M12 2a10 10 0 100 20 10 10 0 000-20z",
}

const facilityIcons: Record<FacilityType, string> = {
  hospital: "M9 3v6H3v6h6v6h6v-6h6V9h-6V3z",
  school: "M12 3L1 9l11 6 9-4.9V17h2V9L12 3zm0 8.7L5.5 8 12 5.3 18.5 8 12 11.7z",
  police: "M12 1L3 5v6c0 5 3 9 9 10 6-1 9-5 9-10V5l-9-4z",
}

const facilityColors: Record<FacilityType, string> = {
  hospital: "#dc2626",
  school: "#2563eb",
  police: "#16a34a",
}

function createComplaintIcon(priority: Priority, category: CategoryKey, highlighted: boolean) {
  const color = getMarkerColor(priority)
  const iconPath = categoryIcons[category] || categoryIcons.Other
  const scale = highlighted ? 1.35 : 1
  const glow = highlighted ? `box-shadow: 0 0 0 6px ${color}40, 0 0 0 12px ${color}20;` : `box-shadow: 0 2px 6px rgba(0,0,0,0.35);`
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="position:relative;transform:scale(${scale});transition:transform 0.3s ease;">
        ${priority === "Critical" ? `
        <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};opacity:0.5;animation:pulse-ring 1.8s ease-out infinite;"></div>
        ` : ""}
        <div style="background-color:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;border:3px solid white;${glow}transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white" style="transform:rotate(45deg);">
            <path d="${iconPath}"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

function createFacilityIcon(type: FacilityType) {
  const color = facilityColors[type]
  const iconPath = facilityIcons[type]
  return L.divIcon({
    className: "facility-marker",
    html: `
      <div style="background-color:${color};width:22px;height:22px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
          <path d="${iconPath}"/>
        </svg>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

function createClusterIcon(count: number, maxCount: number) {
  const ratio = count / maxCount
  const size = 36 + ratio * 20
  let color = "#3b82f6"
  if (ratio > 0.66) color = "#ef4444"
  else if (ratio > 0.33) color = "#f59e0b"
  return L.divIcon({
    className: "cluster-marker",
    html: `
      <div style="width:${size}px;height:${size}px;background-color:${color}cc;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:transform 0.2s;">
        <span style="color:white;font-weight:700;font-size:${size > 44 ? 15 : 13}px;font-family:system-ui;">${count}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

interface Cluster {
  lat: number
  lng: number
  complaints: Complaint[]
  count: number
}

function simpleCluster(items: Complaint[], threshold: number): Cluster[] {
  const clusters: Cluster[] = []
  const assigned = new Set<string>()
  for (const c of items) {
    if (assigned.has(c.id)) continue
    const nearby = items.filter(x => {
      if (assigned.has(x.id)) return false
      const dLat = (x.lat - c.lat) * 111
      const dLng = (x.lng - c.lng) * 111 * Math.cos(c.lat * Math.PI / 180)
      return Math.sqrt(dLat * dLat + dLng * dLng) * 1000 <= threshold
    })
    const group = [c, ...nearby]
    group.forEach(g => assigned.add(g.id))
    const lat = group.reduce((s, g) => s + g.lat, 0) / group.length
    const lng = group.reduce((s, g) => s + g.lng, 0) / group.length
    clusters.push({ lat, lng, complaints: group, count: group.length })
  }
  return clusters
}

function FlyTo({ complaint }: { complaint: Complaint | null }) {
  const map = useMap()
  React.useEffect(() => {
    if (complaint) {
      map.flyTo([complaint.lat, complaint.lng], 16, { duration: 0.6 })
    }
  }, [complaint, map])
  return null
}

function HeatmapLayer({ complaints }: { complaints: Complaint[] }) {
  const intensity = (p: Priority) => p === "Critical" ? 0.95 : p === "High" ? 0.7 : p === "Medium" ? 0.45 : 0.25
  const radius = 280
  return (
    <>
      {complaints.map(c => (
        <Circle
          key={`heat-${c.id}`}
          center={[c.lat, c.lng]}
          radius={radius}
          pathOptions={{
            color: getMarkerColor(c.priority),
            fillColor: getMarkerColor(c.priority),
            fillOpacity: intensity(c.priority) * 0.35,
            stroke: false,
          }}
        />
      ))}
    </>
  )
}

function WardHeatmapLayer() {
  return (
    <>
      {wards.map(w => {
        const count = allComplaints.filter(c => {
          const dLat = (c.lat - w.center[0]) * 111
          const dLng = (c.lng - w.center[1]) * 111 * Math.cos(w.center[0] * Math.PI / 180)
          return Math.sqrt(dLat * dLat + dLng * dLng) * 1000 <= 800
        }).length
        const opacity = Math.min(0.35, 0.08 + count * 0.05)
        return (
          <Rectangle
            key={w.id}
            bounds={w.bounds}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: opacity,
              weight: 1,
              dashArray: "6 4",
            }}
          >
            <Popup>
              <div className="p-1">
                <p className="font-semibold text-sm">{w.name}</p>
                <p className="text-xs text-muted-foreground">{count} complaints in ward</p>
              </div>
            </Popup>
          </Rectangle>
        )
      })}
    </>
  )
}

function DensityHeatmapLayer({ complaints }: { complaints: Complaint[] }) {
  return (
    <>
      {complaints.map(c => (
        <Circle
          key={`density-${c.id}`}
          center={[c.lat, c.lng]}
          radius={400}
          pathOptions={{
            color: "#8b5cf6",
            fillColor: "#8b5cf6",
            fillOpacity: 0.2,
            stroke: false,
          }}
        />
      ))}
    </>
  )
}

function NearbyLayer({ complaint }: { complaint: Complaint | null }) {
  if (!complaint) return null
  const nearby = getNearbyComplaints(complaint.lat, complaint.lng, 500).filter(n => n.complaint.id !== complaint.id)
  const facilities = getNearbyFacilities(complaint.lat, complaint.lng, 1000)
  return (
    <>
      <Circle
        center={[complaint.lat, complaint.lng]}
        radius={500}
        pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.05, weight: 1, dashArray: "4 4" }}
      />
      {nearby.map(n => (
        <Circle
          key={`near-${n.complaint.id}`}
          center={[n.complaint.lat, n.complaint.lng]}
          radius={60}
          pathOptions={{ color: getMarkerColor(n.complaint.priority), fillColor: getMarkerColor(n.complaint.priority), fillOpacity: 0.3, weight: 2 }}
        />
      ))}
      {facilities.map(f => (
        <Circle
          key={`fac-${f.facility.id}`}
          center={[f.facility.lat, f.facility.lng]}
          radius={50}
          pathOptions={{ color: facilityColors[f.facility.type], fillColor: facilityColors[f.facility.type], fillOpacity: 0.4, weight: 2 }}
        />
      ))}
    </>
  )
}

export interface MapComponentProps {
  complaints: Complaint[]
  selectedComplaint: Complaint | null
  setSelectedComplaint: (c: Complaint | null) => void
  tileLayer: TileLayerKey
  overlays: Record<OverlayKey, boolean>
  showFacilities: Record<FacilityType, boolean>
  heatmapMode: "priority" | "density" | "ward"
  showNearby: boolean
}

export function MapComponent({
  complaints,
  selectedComplaint,
  setSelectedComplaint,
  tileLayer,
  overlays,
  showFacilities,
  heatmapMode,
  showNearby,
}: MapComponentProps) {
  const mapRef = React.useRef<L.Map | null>(null)
  const showMarkers = overlays.markers
  const showCluster = overlays.cluster
  const showHeatmap = overlays.heatmap

  const clusters = React.useMemo(() => {
    if (!showCluster) return []
    const c = simpleCluster(complaints, 300)
    const maxCount = Math.max(...c.map(cl => cl.count), 1)
    return c.map(cl => ({ ...cl, maxCount }))
  }, [complaints, showCluster])

  const visibleFacilities = facilities.filter(f => showFacilities[f.type])
  const tileConfig = tileLayerUrls[tileLayer]

  return (
    <MapContainer
      ref={mapRef as any}
      center={[28.62, 77.22]}
      zoom={13}
      className="size-full"
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-popup-content-wrapper { border-radius: 12px; overflow: hidden; }
        .leaflet-popup-content { margin: 0; }
      `}</style>
      <ZoomControl position="bottomright" />
      <TileLayer key={tileLayer} url={tileConfig.url} attribution={tileConfig.attribution} maxZoom={tileConfig.maxZoom} />
      <FlyTo complaint={selectedComplaint} />

      {showHeatmap && heatmapMode === "priority" && <HeatmapLayer complaints={complaints} />}
      {showHeatmap && heatmapMode === "density" && <DensityHeatmapLayer complaints={complaints} />}
      {showHeatmap && heatmapMode === "ward" && <WardHeatmapLayer />}

      {showNearby && <NearbyLayer complaint={selectedComplaint} />}

      {visibleFacilities.map(f => (
        <Marker
          key={f.id}
          position={[f.lat, f.lng]}
          icon={createFacilityIcon(f.type)}
          zIndexOffset={100}
        >
          <Popup>
            <div className="min-w-44 p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: facilityColors[f.type] }}>
                  {f.type.toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-sm">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {showMarkers && !showCluster && complaints.map(complaint => (
        <Marker
          key={complaint.id}
          position={[complaint.lat, complaint.lng]}
          icon={createComplaintIcon(complaint.priority, complaint.category, selectedComplaint?.id === complaint.id)}
          eventHandlers={{ click: () => setSelectedComplaint(complaint) }}
        >
          <Popup maxWidth={280} minWidth={220}>
            <div className="p-1">
              <div className="relative mb-2 aspect-video overflow-hidden rounded-md bg-muted">
                <img src={complaint.image} alt={complaint.category} className="size-full object-cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div className="space-y-1.5 px-1 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold">{complaint.id}</span>
                  <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: getMarkerColor(complaint.priority), color: "white", borderRadius: "9999px", fontWeight: 600 }}>
                    {complaint.priority}
                  </span>
                </div>
                <p className="font-semibold text-sm">{complaint.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{complaint.category}</span>
                  <span>·</span>
                  <span>{complaint.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{complaint.citizen}</span>
                  <span>·</span>
                  <span>{complaint.date}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs font-medium" style={{ color: getMarkerColor(complaint.priority) }}>
                    Severity: {complaint.severity}/100
                  </span>
                </div>
                <a
                  href={`/tracking/${complaint.id}`}
                  className="mt-1 block rounded-md bg-primary px-2 py-1.5 text-center text-xs font-medium text-white hover:bg-primary/90"
                >
                  Track Issue
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {showCluster && clusters.map((cl, i) => (
        cl.count === 1 ? (
          <Marker
            key={`solo-${i}`}
            position={[cl.lat, cl.lng]}
            icon={createComplaintIcon(cl.complaints[0].priority, cl.complaints[0].category, selectedComplaint?.id === cl.complaints[0].id)}
            eventHandlers={{ click: () => setSelectedComplaint(cl.complaints[0]) }}
          >
            <Popup maxWidth={280} minWidth={220}>
              <div className="p-1">
                <div className="relative mb-2 aspect-video overflow-hidden rounded-md bg-muted">
                  <img src={cl.complaints[0].image} alt={cl.complaints[0].category} className="size-full object-cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="space-y-1.5 px-1 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold">{cl.complaints[0].id}</span>
                    <span style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: getMarkerColor(cl.complaints[0].priority), color: "white", borderRadius: "9999px", fontWeight: 600 }}>
                      {cl.complaints[0].priority}
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{cl.complaints[0].title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{cl.complaints[0].category}</span><span>·</span><span>{cl.complaints[0].location}</span>
                  </div>
                  <a href={`/tracking/${cl.complaints[0].id}`} className="mt-1 block rounded-md bg-primary px-2 py-1.5 text-center text-xs font-medium text-white hover:bg-primary/90">
                    Track Issue
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ) : (
          <Marker
            key={`cluster-${i}`}
            position={[cl.lat, cl.lng]}
            icon={createClusterIcon(cl.count, cl.maxCount)}
          >
            <Popup maxWidth={260}>
              <div className="p-1">
                <p className="font-semibold text-sm mb-1">{cl.count} complaints in this area</p>
                <div className="space-y-1">
                  {cl.complaints.slice(0, 5).map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedComplaint(c)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "4px 6px", borderRadius: "4px", border: "none", background: "transparent", cursor: "pointer", fontSize: "12px" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{c.id}</span> — {c.title.slice(0, 30)}...
                    </button>
                  ))}
                  {cl.complaints.length > 5 && (
                    <p className="text-xs text-muted-foreground px-1.5">+{cl.complaints.length - 5} more</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}
