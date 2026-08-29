import "leaflet"

declare module "leaflet" {
  interface HeatLayerOptions {
    minOpacity?: number
    maxZoom?: number
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
  }
  interface HeatLayer extends Layer {
    setLatLngs: (latlngs: LatLngExpression[]) => HeatLayer
    setOptions: (options: HeatLayerOptions) => HeatLayer
    addLatLng: (latlng: LatLngExpression) => HeatLayer
  }
  let heat: (latlngs: [number, number, number?][], options?: HeatLayerOptions) => HeatLayer

  interface MarkerClusterGroup extends LayerGroup {
    spiderfy: (latlng: LatLng) => void
    unspiderfy: () => void
    zoomToShowLayer: (layer: Layer, cb?: () => void) => void
  }
  interface MarkerCluster {
    getAllChildMarkers: () => Marker[]
    getChildCount: () => number
    getLatLng: () => LatLng
  }
  interface MarkerClusterGroupOptions extends LayerOptions {
    showCoverageOnHover?: boolean
    spiderfyOnMaxZoom?: boolean
    zoomToBoundsOnClick?: boolean
    maxClusterRadius?: number
    disableClusteringAtZoom?: number
    removeOutsideVisibleBounds?: boolean
    animate?: boolean
    animateAddingMarkers?: boolean
    spiderfyDistanceMultiplier?: number
    chunkedLoading?: boolean
    polygonOptions?: PathOptions
    iconCreateFunction?: (cluster: MarkerCluster) => DivIcon
  }
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup

  interface RoutingControlOptions {
    waypoints?: LatLngExpression[]
    routeWhileDragging?: boolean
    show?: boolean
    collapsible?: boolean
    lineOptions?: { styles?: PathOptions[]; addWaypoints?: boolean }
    createMarker?: (i: number, wp: { latLng: LatLng }, n: number) => Marker
    addWaypoints?: boolean
    fitSelectedRoutes?: boolean
    autoRoute?: boolean
  }
  interface RoutingControl extends L.Control {
    setWaypoints: (wps: LatLngExpression[]) => RoutingControl
    getWaypoints: () => { latLng: LatLng }[]
    spliceWaypoints: (i: number, count: number, ...wps: LatLngExpression[]) => void
    hide: () => void
    show: () => void
  }
  function routingControl(options: RoutingControlOptions): RoutingControl
}

declare module "leaflet.heat" {
  // side-effect import — types are augmented onto L via the module above
  export {}
}

declare module "leaflet.markercluster" {
  // side-effect import — types are augmented onto L via the module above
  export {}
}

declare module "leaflet-routing-machine" {
  // side-effect import — types are augmented onto L via the module above
  export {}
}
