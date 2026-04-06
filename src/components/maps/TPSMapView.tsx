'use client'

import { useEffect, useSyncExternalStore } from 'react'
import L from 'leaflet'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamic imports to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

export interface TPSMapItem {
  id: string
  name: string
  code: string
  latitude: number
  longitude: number
  address: string
  activeAssignmentCount?: number
  status?: 'active' | 'inactive' | 'issue'
}

interface TPSMapViewProps {
  tpsData: TPSMapItem[]
  height?: string
  zoom?: number
  showLegend?: boolean
  className?: string
}

// Fix default marker icon for webpack/Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom colored marker icons using L.divIcon
function createColorIcon(color: string, label?: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 42px;
      ">
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
          ${label ? `<text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${label}</text>` : ''}
        </svg>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  })
}

const greenIcon = createColorIcon('#22c55e')
const yellowIcon = createColorIcon('#eab308')
const redIcon = createColorIcon('#ef4444')

function getMarkerIcon(item: TPSMapItem) {
  if (item.status === 'issue') return redIcon
  if (item.activeAssignmentCount && item.activeAssignmentCount > 0) return greenIcon
  return yellowIcon
}

function MapContent({ tpsData }: { tpsData: TPSMapItem[] }) {
  // Fix the default icon issue globally
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon
  }, [])

  const validItems = tpsData.filter(
    (t) => t.latitude && t.longitude && !isNaN(t.latitude) && !isNaN(t.longitude)
  )

  if (validItems.length === 0) return null

  // Calculate center from all TPS coordinates
  const avgLat = validItems.reduce((sum, t) => sum + t.latitude, 0) / validItems.length
  const avgLng = validItems.reduce((sum, t) => sum + t.longitude, 0) / validItems.length

  // Calculate appropriate zoom based on spread
  const maxLat = Math.max(...validItems.map((t) => t.latitude))
  const minLat = Math.min(...validItems.map((t) => t.latitude))
  const maxLng = Math.max(...validItems.map((t) => t.longitude))
  const minLng = Math.min(...validItems.map((t) => t.longitude))

  const latDiff = maxLat - minLat
  const lngDiff = maxLng - minLng

  let zoom = 12
  if (validItems.length === 1) {
    zoom = 15
  } else if (latDiff > 0.1 || lngDiff > 0.1) {
    zoom = 10
  } else if (latDiff > 0.05 || lngDiff > 0.05) {
    zoom = 11
  } else {
    zoom = 13
  }

  return (
    <MapContainer
      center={[avgLat, avgLng]}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validItems.map((tps) => (
        <Marker
          key={tps.id}
          position={[tps.latitude, tps.longitude]}
          icon={getMarkerIcon(tps)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-base">{tps.code} - {tps.name}</p>
              <p className="text-gray-600 mt-1">{tps.address}</p>
              {tps.activeAssignmentCount !== undefined && (
                <p className="mt-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    tps.activeAssignmentCount > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tps.activeAssignmentCount > 0
                      ? `${tps.activeAssignmentCount} saksi aktif`
                      : 'Belum ada saksi'
                    }
                  </span>
                </p>
              )}
              <p className="text-gray-400 mt-1 text-xs">
                {tps.latitude.toFixed(6)}, {tps.longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function TPSMapView({
  tpsData,
  height = '400px',
  showLegend = true,
  className = '',
}: TPSMapViewProps) {
  const mounted = useIsMounted()

  if (!mounted) {
    return (
      <div
        className={`rounded-lg border shadow-sm overflow-hidden ${className}`}
        style={{ height }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  const validItems = tpsData.filter(
    (t) => t.latitude && t.longitude && !isNaN(t.latitude) && !isNaN(t.longitude)
  )

  return (
    <div className={`relative rounded-lg border shadow-sm overflow-hidden ${className}`}>
      <div style={{ height }}>
        {validItems.length > 0 ? (
          <MapContent tpsData={tpsData} />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
            <p>Tidak ada data TPS dengan koordinat valid</p>
          </div>
        )}
      </div>
      {showLegend && validItems.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg border p-2 shadow-sm z-[1000]">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Legenda</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">Saksi aktif</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Belum ada saksi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs">Ada masalah</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
