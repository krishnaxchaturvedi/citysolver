"use client"

import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"

export type RoutingControlProps = {
  waypoints: [number, number][]
  active?: boolean
  color?: string
  fitBounds?: boolean
}

export function RoutingControl({ waypoints, active = true, color = "#3b82f6", fitBounds = true }: RoutingControlProps) {
  const map = useMap()
  const controlRef = useRef<L.RoutingControl | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!active || waypoints.length < 2) return
    const control = L.routingControl({
      waypoints: waypoints.map(([lat, lng]) => L.latLng(lat, lng)),
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false,
      autoRoute: true,
    })
    control.addTo(map)
    controlRef.current = control

    control.on("routesfound", (e: L.LeafletEvent & { routes: { coordinates: { lat: number; lng: number }[] }[] }) => {
      const route = e.routes[0]
      if (!route) return
      const latlngs = route.coordinates.map(c => [c.lat, c.lng] as [number, number])
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current)
      }
      const line = L.polyline(latlngs, { color, weight: 5, opacity: 0.8, dashArray: "10 6" })
      line.addTo(map)
      polylineRef.current = line
      if (fitBounds) {
        map.fitBounds(line.getBounds(), { padding: [60, 60] })
      }
    })

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current)
        controlRef.current = null
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current)
        polylineRef.current = null
      }
    }
  }, [map, waypoints, active, color, fitBounds])

  return null
}

export type AnimatedRouteProps = {
  waypoints: [number, number][]
  active?: boolean
  color?: string
}

export function AnimatedRoute({ waypoints, active = true, color = "#22c55e" }: AnimatedRouteProps) {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active || waypoints.length < 2) return
    const fullRoute: [number, number][] = []
    for (let i = 0; i < waypoints.length - 1; i++) {
      const [lat1, lng1] = waypoints[i]
      const [lat2, lng2] = waypoints[i + 1]
      const steps = 50
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        fullRoute.push([lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t])
      }
    }

    const animatedIcon = L.divIcon({
      className: "route-animated-marker",
      html: `<div style="width:18px;height:18px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px ${color}40,0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })
    const marker = L.marker(fullRoute[0], { icon: animatedIcon }).addTo(map)
    markerRef.current = marker

    let idx = 0
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % fullRoute.length
      marker.setLatLng(fullRoute[idx])
    }, 80)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
        markerRef.current = null
      }
    }
  }, [map, waypoints, active, color])

  return null
}
