"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import type { Complaint, Priority } from "@/lib/data"
import { priorityMeta } from "@/lib/data"

function getMarkerColor(priority: Priority): string {
  return priorityMeta[priority].mapColor
}

function createCustomIcon(priority: Priority) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="background-color: ${getMarkerColor(priority)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="6" />
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

const center: [number, number] = [28.62, 77.22]
const zoom = 13

export function MapComponent({
  complaints,
  selectedComplaint,
  setSelectedComplaint,
}: {
  complaints: Complaint[]
  selectedComplaint: Complaint | null
  setSelectedComplaint: (c: Complaint | null) => void
}) {
  const mapRef = React.useRef<L.Map | null>(null)

  React.useEffect(() => {
    if (selectedComplaint && mapRef.current) {
      mapRef.current.setView([selectedComplaint.lat, selectedComplaint.lng], 16, {
        animate: true,
        duration: 0.5,
      })
    }
  }, [selectedComplaint])

  return (
    <MapContainer
      ref={mapRef as any}
      center={center}
      zoom={zoom}
      className="size-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {complaints.map((complaint) => (
        <Marker
          key={complaint.id}
          position={[complaint.lat, complaint.lng]}
          icon={createCustomIcon(complaint.priority)}
          eventHandlers={{
            click: () => setSelectedComplaint(complaint),
          }}
        >
          <Popup>
            <div className="min-w-48 p-1">
              <div className="relative mb-2 aspect-video overflow-hidden rounded-md bg-muted">
                <img
                  src={complaint.image}
                  alt={complaint.category}
                  className="size-full object-cover"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-medium">{complaint.id}</span>
                  <span style={{ fontSize: "10px", padding: "2px 6px", backgroundColor: getMarkerColor(complaint.priority), color: "white", borderRadius: "4px" }}>
                    {complaint.priority}
                  </span>
                </div>
                <p className="font-medium text-sm">{complaint.category}</p>
                <p className="text-xs text-gray-600">{complaint.title}</p>
                <p className="text-xs text-gray-500">{complaint.citizen}</p>
                <p className="text-xs text-gray-500">{complaint.date}</p>
                <div className="flex gap-2 pt-2">
                  <a
                    href={`/tracking/${complaint.id}`}
                    className="flex-1 rounded bg-primary px-2 py-1 text-center text-xs text-white hover:bg-primary/90"
                    style={{ display: 'inline-block', textAlign: 'center' }}
                  >
                    Track
                  </a>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
