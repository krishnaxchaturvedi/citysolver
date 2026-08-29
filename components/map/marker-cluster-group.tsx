"use client"

import { createPathComponent } from "@react-leaflet/core"
import L from "leaflet"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

export type MarkerClusterGroupProps = {
  children?: React.ReactNode
  iconCreateFunction?: (cluster: L.MarkerCluster) => L.DivIcon
  showCoverageOnHover?: boolean
  spiderfyOnMaxZoom?: boolean
  zoomToBoundsOnClick?: boolean
  maxClusterRadius?: number
  disableClusteringAtZoom?: number
  removeOutsideVisibleBounds?: boolean
  animate?: boolean
  spiderfyDistanceMultiplier?: number
  chunkedLoading?: boolean
  polygonOptions?: L.PathOptions
}

function splitProps(props: Record<string, unknown>) {
  const clusterProps: Record<string, unknown> = {}
  const clusterEvents: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(props)) {
    if (name === "children") continue
    if (name.startsWith("on") && typeof value === "function") {
      clusterEvents[name] = value
    } else {
      clusterProps[name] = value
    }
  }
  return { clusterProps, clusterEvents }
}

export const MarkerClusterGroup = createPathComponent<
  L.MarkerClusterGroup,
  MarkerClusterGroupProps
>((props, ctx) => {
  const { clusterProps, clusterEvents } = splitProps(props as unknown as Record<string, unknown>)
  const instance = L.markerClusterGroup(clusterProps as L.MarkerClusterGroupOptions)

  for (const [eventProp, callback] of Object.entries(clusterEvents)) {
    const eventName = "cluster" + eventProp.substring(2).toLowerCase()
    instance.on(eventName, callback as L.LeafletEventHandlerFn)
  }

  return {
    instance,
    context: { ...ctx, layerContainer: instance },
  }
})
