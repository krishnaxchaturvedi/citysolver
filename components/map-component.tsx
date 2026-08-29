"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Rectangle, Tooltip, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import type { Complaint, Priority, CategoryKey } from "@/lib/data"
import { priorityMeta, complaints as allComplaints } from "@/lib/data"
import {
  facilities,
  wards,
  tileLayerUrls,
  weatherTileUrl,
  trafficTileUrl,
  restrictedZones,
  type TileLayerKey,
  type OverlayKey,
  type FacilityType,
  getNearbyComplaints,
  getNearbyFacilities,
  intensityColor,
  intensityForCount,
  intensityColors,
} from "@/lib/map-data"
import { MarkerClusterGroup } from "@/components/map/marker-cluster-group"
import { HeatLayer } from "@/components/map/heat-layer"
import { RoutingControl, AnimatedRoute } from "@/components/map/routing-control"
import { DrawingTools, DrawnShapesLayer, type DrawnShapes } from "@/components/map/drawing-tools"

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

function complaintEta(priority: Priority): string {
  return priority === "Critical" ? "1-2 days" : priority === "High" ? "3-5 days" : priority === "Medium" ? "5-10 days" : "10-15 days"
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

function createClusterIconFn(maxCount: number) {
  return (cluster: L.MarkerCluster): L.DivIcon => {
    const count = cluster.getChildCount()
    const ratio = maxCount > 0 ? count / maxCount : 0
    const size = 38 + ratio * 18
    let color = "#3b82f6"
    if (ratio > 0.66) color = "#ef4444"
    else if (ratio > 0.33) color = "#f59e0b"
    return L.divIcon({
      className: "cluster-marker",
      html: `
        <div style="width:${size}px;height:${size}px;background-color:${color}cc;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:transform 0.2s;position:relative;">
          <span style="color:white;font-weight:700;font-size:${size > 46 ? 15 : 13}px;font-family:system-ui;z-index:1;">${count}</span>
          <div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};opacity:0.3;animation:cluster-pulse 2s ease-out infinite;"></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }
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

function PriorityHeatmapLayer({ complaints }: { complaints: Complaint[] }) {
  const intensity = (p: Priority) => (p === "Critical" ? 0.95 : p === "High" ? 0.7 : p === "Medium" ? 0.45 : 0.25)
  return (
    <>
      {complaints.map((c) => (
        <Circle
          key={`heat-${c.id}`}
          center={[c.lat, c.lng]}
          radius={280}
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

function WardLayer() {
  return (
    <>
      {wards.map((w) => {
        const count = allComplaints.filter((c) => {
          const dLat = (c.lat - w.center[0]) * 111
          const dLng = (c.lng - w.center[1]) * 111 * Math.cos((w.center[0] * Math.PI) / 180)
          return Math.sqrt(dLat * dLat + dLng * dLng) * 1000 <= 800
        }).length
        const level = intensityForCount(count * 3)
        const color = intensityColors[level].hex
        const opacity = Math.min(0.4, 0.08 + count * 0.04)
        return (
          <React.Fragment key={w.id}>
            <Polygon
              positions={w.polygon}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: opacity,
                weight: 2,
                dashArray: "6 4",
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-semibold text-sm">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{count} complaints in ward</p>
                </div>
              </Popup>
              <Tooltip direction="center" permanent>
                <div style={{ fontSize: "11px", fontWeight: 600, color }}>
                  {w.name.replace("Sector ", "S")} · {count}
                </div>
              </Tooltip>
            </Polygon>
          </React.Fragment>
        )
      })}
    </>
  )
}

function WardHeatmapLayer() {
  return (
    <>
      {wards.map((w) => {
        const count = allComplaints.filter((c) => {
          const dLat = (c.lat - w.center[0]) * 111
          const dLng = (c.lng - w.center[1]) * 111 * Math.cos((w.center[0] * Math.PI) / 180)
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
      {complaints.map((c) => {
        const color = intensityColor(c.severity)
        const radius = 250 + c.severity * 2
        const opacity = 0.12 + (c.severity / 100) * 0.28
        return (
          <Circle
            key={`density-${c.id}`}
            center={[c.lat, c.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: opacity, stroke: false }}
          />
        )
      })}
    </>
  )
}

function NearbyLayer({ complaint }: { complaint: Complaint | null }) {
  if (!complaint) return null
  const nearby = getNearbyComplaints(complaint.lat, complaint.lng, 500).filter((n) => n.complaint.id !== complaint.id)
  const nearbyFacilities = getNearbyFacilities(complaint.lat, complaint.lng, 1000)
  return (
    <>
      <Circle
        center={[complaint.lat, complaint.lng]}
        radius={500}
        pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.05, weight: 1, dashArray: "4 4" }}
      />
      {nearby.map((n) => (
        <Circle
          key={`near-${n.complaint.id}`}
          center={[n.complaint.lat, n.complaint.lng]}
          radius={60}
          pathOptions={{ color: getMarkerColor(n.complaint.priority), fillColor: getMarkerColor(n.complaint.priority), fillOpacity: 0.3, weight: 2 }}
        />
      ))}
      {nearbyFacilities.map((f) => (
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

function RestrictedZonesLayer() {
  const zoneColors: Record<string, string> = {
    restricted: "#dc2626",
    incident: "#f59e0b",
    buffer: "#3b82f6",
  }
  return (
    <>
      {restrictedZones.map((z) => {
        const color = zoneColors[z.type]
        return (
          <Circle
            key={z.id}
            center={z.center}
            radius={z.radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 2, dashArray: "8 4" }}
          >
            <Popup>
              <div className="p-1">
                <p className="font-semibold text-sm">{z.name}</p>
                <p className="text-xs text-muted-foreground">Radius: {z.radius} m</p>
              </div>
            </Popup>
          </Circle>
        )
      })}
    </>
  )
}

function AnimatedPopup({ complaint, onClose }: { complaint: Complaint; onClose?: () => void }) {
  const color = getMarkerColor(complaint.priority)
  const statusMeta: Record<string, string> = {
    Submitted: "#94a3b8",
    "Under Review": "#3b82f6",
    Approved: "#3b82f6",
    Assigned: "#f59e0b",
    "In Progress": "#8b5cf6",
    Resolved: "#22c55e",
    Rejected: "#94a3b8",
  }
  const statusColor = statusMeta[complaint.status] || "#94a3b8"
  const aiRisk = complaint.severity
  const aiRiskColor = aiRisk >= 75 ? "#ef4444" : aiRisk >= 50 ? "#f59e0b" : "#22c55e"
  return (
    <div className="popup-card" style={{ width: 260, fontFamily: "system-ui", animation: "popup-fade-in 0.3s ease-out" }}>
      <div className="popup-image-wrap" style={{ position: "relative", height: 120, overflow: "hidden", borderRadius: "8px 8px 0 0", background: "#f1f5f9" }}>
        <img
          src={complaint.image}
          alt={complaint.category}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <span style={{ position: "absolute", top: 8, left: 8, fontSize: "10px", padding: "2px 8px", backgroundColor: color, color: "white", borderRadius: "9999px", fontWeight: 700 }}>
          {complaint.priority}
        </span>
        <span style={{ position: "absolute", top: 8, right: 8, fontSize: "10px", padding: "2px 8px", backgroundColor: statusColor, color: "white", borderRadius: "9999px", fontWeight: 600 }}>
          {complaint.status}
        </span>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "#475569" }}>{complaint.id}</span>
          <span style={{ fontSize: "10px", color: "#94a3b8" }}>{complaint.category}</span>
        </div>
        <p style={{ fontWeight: 600, fontSize: "13px", lineHeight: "1.3", marginBottom: 8, color: "#1e293b" }}>{complaint.title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: "11px", color: "#64748b" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>AI Risk</span>
            <span style={{ fontWeight: 700, color: aiRiskColor }}>
              {aiRisk >= 75 ? "High" : aiRisk >= 50 ? "Medium" : "Low"} ({aiRisk})
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Officer</span>
            <span style={{ fontWeight: 600, color: "#334155" }}>{complaint.officer || "Unassigned"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>ETA</span>
            <span style={{ fontWeight: 600, color: "#334155" }}>{complaintEta(complaint.priority)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Severity</span>
            <span style={{ fontWeight: 600, color }}>{complaint.severity}/100</span>
          </div>
        </div>
        <a
          href={`/tracking/${complaint.id}`}
          onClick={onClose}
          style={{
            display: "block",
            marginTop: 10,
            padding: "7px 0",
            textAlign: "center",
            borderRadius: 6,
            backgroundColor: "#4f46e5",
            color: "white",
            fontSize: "12px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Track Issue
        </a>
      </div>
    </div>
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
  showWeather?: boolean
  showTraffic?: boolean
  showRestrictedZones?: boolean
  officerRoute?: [number, number][]
  animatedRoute?: [number, number][]
  drawing?: {
    active: boolean
    mode: "polygon" | "circle" | "select" | "none"
    shapes: DrawnShapes
    onShapesChange: (shapes: DrawnShapes) => void
    zoneType: "restricted" | "incident" | "buffer"
  }
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
  showWeather = false,
  showTraffic = false,
  showRestrictedZones = false,
  officerRoute = [],
  animatedRoute = [],
  drawing,
}: MapComponentProps) {
  const mapRef = React.useRef<L.Map | null>(null)
  const showMarkers = overlays.markers
  const showCluster = overlays.cluster
  const showHeatmap = overlays.heatmap

  const clusterIconFn = React.useMemo(() => {
    return createClusterIconFn(Math.max(complaints.length, 1))
  }, [complaints.length])

  const heatPoints = React.useMemo(() => {
    return complaints.map((c) => {
      const intensity = c.priority === "Critical" ? 1.0 : c.priority === "High" ? 0.7 : c.priority === "Medium" ? 0.4 : 0.2
      return [c.lat, c.lng, intensity] as [number, number, number]
    })
  }, [complaints])

  const visibleFacilities = facilities.filter((f) => showFacilities[f.type])
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
        @keyframes cluster-pulse {
          0% { transform: scale(0.9); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes popup-fade-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .leaflet-popup-content-wrapper { border-radius: 12px; overflow: hidden; }
        .leaflet-popup-content { margin: 0; }
        .leaflet-tooltip.ward-label { background: transparent; border: none; box-shadow: none; }
      `}</style>
      <ZoomControl position="bottomright" />
      <TileLayer
        key={tileLayer}
        url={tileConfig.url}
        attribution={tileConfig.attribution}
        maxZoom={tileConfig.maxZoom}
      />

      {showTraffic && (
        <TileLayer
          key="traffic"
          url={trafficTileUrl}
          attribution="&copy; Thunderforest"
          maxZoom={19}
          subdomains={["a", "b", "c"]}
          opacity={0.6}
        />
      )}
      {showWeather && (
        <TileLayer
          key="weather"
          url={weatherTileUrl}
          attribution="&copy; OpenWeatherMap"
          maxZoom={19}
          opacity={0.7}
        />
      )}

      <FlyTo complaint={selectedComplaint} />

      {overlays.ward && <WardLayer />}

      {showHeatmap && heatmapMode === "priority" && (
        <>
          <HeatLayer points={heatPoints} radius={40} blur={30} />
          <PriorityHeatmapLayer complaints={complaints} />
        </>
      )}
      {showHeatmap && heatmapMode === "density" && <DensityHeatmapLayer complaints={complaints} />}
      {showHeatmap && heatmapMode === "ward" && <WardHeatmapLayer />}

      {showNearby && <NearbyLayer complaint={selectedComplaint} />}

      {showRestrictedZones && <RestrictedZonesLayer />}

      {officerRoute.length >= 2 && <RoutingControl waypoints={officerRoute} color="#4f46e5" />}
      {animatedRoute.length >= 2 && <AnimatedRoute waypoints={animatedRoute} color="#22c55e" />}

      {drawing && (
        <>
          <DrawingTools
            active={drawing.active}
            mode={drawing.mode}
            shapes={drawing.shapes}
            onShapesChange={drawing.onShapesChange}
            zoneType={drawing.zoneType}
          />
          <DrawnShapesLayer
            shapes={drawing.shapes}
            onRemove={(id) => drawing.onShapesChange(drawing.shapes.filter((s) => s.id !== id))}
          />
        </>
      )}

      {visibleFacilities.map((f) => (
        <Marker key={f.id} position={[f.lat, f.lng]} icon={createFacilityIcon(f.type)} zIndexOffset={100}>
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

      {showMarkers && !showCluster && complaints.map((complaint) => (
        <Marker
          key={complaint.id}
          position={[complaint.lat, complaint.lng]}
          icon={createComplaintIcon(complaint.priority, complaint.category, selectedComplaint?.id === complaint.id)}
          eventHandlers={{ click: () => setSelectedComplaint(complaint) }}
        >
          <Popup maxWidth={280} minWidth={260}>
            <AnimatedPopup complaint={complaint} />
          </Popup>
        </Marker>
      ))}

      {showMarkers && showCluster && (
        <MarkerClusterGroup
          iconCreateFunction={clusterIconFn}
          showCoverageOnHover
          spiderfyOnMaxZoom
          zoomToBoundsOnClick
          maxClusterRadius={50}
          chunkedLoading
          spiderfyDistanceMultiplier={1.5}
          polygonOptions={{ color: "#4f46e5", fillColor: "#4f46e5", fillOpacity: 0.1, weight: 2, dashArray: "4 4" }}
        >
          {complaints.map((complaint) => (
            <Marker
              key={complaint.id}
              position={[complaint.lat, complaint.lng]}
              icon={createComplaintIcon(complaint.priority, complaint.category, selectedComplaint?.id === complaint.id)}
              eventHandlers={{ click: () => setSelectedComplaint(complaint) }}
            >
              <Popup maxWidth={280} minWidth={260}>
                <AnimatedPopup complaint={complaint} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  )
}
