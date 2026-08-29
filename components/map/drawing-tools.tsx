"use client"

import { useEffect, useState, useCallback } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

export type DrawnShape =
  | { id: string; type: "polygon"; latlngs: [number, number][]; label: string }
  | { id: string; type: "circle"; center: [number, number]; radius: number; label: string }

export type DrawnShapes = DrawnShape[]

export type DrawingToolProps = {
  active: boolean
  mode: "polygon" | "circle" | "select" | "none"
  shapes: DrawnShapes
  onShapesChange: (shapes: DrawnShapes) => void
  zoneType: "restricted" | "incident" | "buffer"
}

export function DrawingTools({ active, mode, shapes, onShapesChange, zoneType }: DrawingToolProps) {
  const map = useMap()
  const [tempPoints, setTempPoints] = useState<[number, number][]>([])
  const [tempPolyline, setTempPolyline] = useState<L.Polyline | null>(null)
  const [circleStart, setCircleStart] = useState<[number, number] | null>(null)
  const [tempCircle, setTempCircle] = useState<L.Circle | null>(null)

  const zoneColors: Record<typeof zoneType, string> = {
    restricted: "#dc2626",
    incident: "#f59e0b",
    buffer: "#3b82f6",
  }
  const color = zoneColors[zoneType]

  const finishPolygon = useCallback(() => {
    if (tempPoints.length < 3) {
      setTempPoints([])
      if (tempPolyline) {
        map.removeLayer(tempPolyline)
        setTempPolyline(null)
      }
      return
    }
    const id = `zone-${Date.now()}`
    const newShape: DrawnShape = {
      id,
      type: "polygon",
      latlngs: [...tempPoints],
      label: `${zoneType} zone`,
    }
    onShapesChange([...shapes, newShape])
    setTempPoints([])
    if (tempPolyline) {
      map.removeLayer(tempPolyline)
      setTempPolyline(null)
    }
  }, [tempPoints, shapes, onShapesChange, zoneType, tempPolyline, map])

  useEffect(() => {
    if (!active || mode === "none" || mode === "select") return

    const handleClick = (e: L.LeafletMouseEvent) => {
      const latlng: [number, number] = [e.latlng.lat, e.latlng.lng]

      if (mode === "polygon") {
        const newPoints = [...tempPoints, latlng]
        setTempPoints(newPoints)
        if (tempPolyline) map.removeLayer(tempPolyline)
        const line = L.polyline(newPoints, { color, weight: 2, dashArray: "6 4", opacity: 0.7 })
        line.addTo(map)
        setTempPolyline(line)
      } else if (mode === "circle") {
        if (!circleStart) {
          setCircleStart(latlng)
          const c = L.circle(latlng, { radius: 0, color, fillColor: color, fillOpacity: 0.2, weight: 2, dashArray: "4 4" })
          c.addTo(map)
          setTempCircle(c)
        } else {
          const radius = map.distance(circleStart, latlng)
          const id = `zone-${Date.now()}`
          const newShape: DrawnShape = {
            id,
            type: "circle",
            center: circleStart,
            radius,
            label: `${zoneType} zone`,
          }
          onShapesChange([...shapes, newShape])
          setCircleStart(null)
          if (tempCircle) {
            map.removeLayer(tempCircle)
            setTempCircle(null)
          }
        }
      }
    }

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      if (mode === "circle" && circleStart && tempCircle) {
        const r = map.distance(circleStart, [e.latlng.lat, e.latlng.lng])
        tempCircle.setRadius(r)
      }
    }

    const handleDblClick = () => {
      if (mode === "polygon") finishPolygon()
    }

    map.on("click", handleClick)
    map.on("mousemove", handleMouseMove)
    map.on("dblclick", handleDblClick)

    return () => {
      map.off("click", handleClick)
      map.off("mousemove", handleMouseMove)
      map.off("dblclick", handleDblClick)
    }
  }, [active, mode, tempPoints, circleStart, tempCircle, tempPolyline, shapes, onShapesChange, zoneType, color, map, finishPolygon])

  useEffect(() => {
    return () => {
      if (tempPolyline) map.removeLayer(tempPolyline)
      if (tempCircle) map.removeLayer(tempCircle)
    }
  }, [tempPolyline, tempCircle, map])

  return null
}

export function DrawnShapesLayer({ shapes, onRemove }: { shapes: DrawnShapes; onRemove: (id: string) => void }) {
  const map = useMap()
  const [rendered, setRendered] = useState<{ id: string; layer: L.Layer }[]>([])

  useEffect(() => {
    rendered.forEach(({ layer }) => map.removeLayer(layer))
    const newRendered: { id: string; layer: L.Layer }[] = []

    for (const shape of shapes) {
      if (shape.type === "polygon") {
        const color = shape.label.includes("restricted") ? "#dc2626" : shape.label.includes("incident") ? "#f59e0b" : "#3b82f6"
        const poly = L.polygon(shape.latlngs, {
          color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "8 4",
        })
        poly.bindPopup(
          `<div style="font-family:system-ui;font-size:13px;"><strong>${shape.label}</strong><br/>${shape.latlngs.length} vertices<br/><button onclick="" data-remove="${shape.id}" style="margin-top:6px;color:#dc2626;background:none;border:none;cursor:pointer;font-size:12px;">Remove zone</button></div>`
        )
        poly.addTo(map)
        newRendered.push({ id: shape.id, layer: poly })
      } else if (shape.type === "circle") {
        const color = shape.label.includes("restricted") ? "#dc2626" : shape.label.includes("incident") ? "#f59e0b" : "#3b82f6"
        const circle = L.circle(shape.center, {
          radius: shape.radius,
          color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "8 4",
        })
        circle.bindPopup(
          `<div style="font-family:system-ui;font-size:13px;"><strong>${shape.label}</strong><br/>Radius: ${Math.round(shape.radius)} m<br/><button data-remove="${shape.id}" style="margin-top:6px;color:#dc2626;background:none;border:none;cursor:pointer;font-size:12px;">Remove zone</button></div>`
        )
        circle.addTo(map)
        newRendered.push({ id: shape.id, layer: circle })
      }
    }

    setRendered(newRendered)

    const handlePopupRemove = (e: L.PopupEvent) => {
      const popup = e.popup as L.Popup
      const el = popup.getElement()
      if (!el) return
      const btn = el.querySelector("[data-remove]") as HTMLButtonElement | null
      if (btn) {
        btn.onclick = () => {
          const id = btn.getAttribute("data-remove")
          if (id) onRemove(id)
        }
      }
    }

    map.on("popupopen", handlePopupRemove)

    return () => {
      newRendered.forEach(({ layer }) => map.removeLayer(layer))
      map.off("popupopen", handlePopupRemove)
    }
  }, [shapes, map, onRemove])

  return null
}
