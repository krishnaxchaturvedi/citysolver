"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet.heat"

export type HeatLayerProps = {
  points: [number, number, number?][]
  radius?: number
  blur?: number
  maxZoom?: number
  minOpacity?: number
  max?: number
  gradient?: Record<number, string>
  fitBounds?: boolean
}

export function HeatLayer({
  points,
  radius = 35,
  blur = 25,
  maxZoom = 17,
  minOpacity = 0.15,
  max = 1.0,
  gradient = { 0.2: "#22c55e", 0.4: "#eab308", 0.6: "#f59e0b", 0.8: "#f97316", 1.0: "#ef4444" },
}: HeatLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return
    const layer = L.heat(points, { radius, blur, maxZoom, minOpacity, max, gradient })
    map.addLayer(layer)
    return () => {
      map.removeLayer(layer)
    }
  }, [map, points, radius, blur, maxZoom, minOpacity, max, gradient])

  return null
}
