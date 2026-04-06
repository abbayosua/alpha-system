'use client'

import { useEffect, useSyncExternalStore } from 'react'
import L from 'leaflet'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

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

interface SingleTPSMapProps {
  latitude: number
  longitude: number
  name: string
  code?: string
  address?: string
  height?: string
  className?: string
}

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// TPS marker - blue colored
const tpsIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="position: relative; width: 32px; height: 42px;">
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#3b82f6" stroke="#fff" stroke-width="1.5"/>
        <path d="M10 13l3 3-3 3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 19h7" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
})

function MapContent({ latitude, longitude, name, code, address }: Omit<SingleTPSMapProps, 'height' | 'className'>) {
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon
  }, [])

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={tpsIcon}>
        <Popup>
          <div className="text-sm">
            <p className="font-bold text-base">{code ? `${code} - ` : ''}{name}</p>
            {address && <p className="text-gray-600 mt-1">{address}</p>}
            <p className="text-gray-400 mt-1 text-xs">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function SingleTPSMap({
  latitude,
  longitude,
  name,
  code,
  address,
  height = '300px',
  className = '',
}: SingleTPSMapProps) {
  const mounted = useIsMounted()

  if (!mounted || isNaN(latitude) || isNaN(longitude)) {
    return (
      <div
        className={`rounded-lg border shadow-sm overflow-hidden ${className}`}
        style={{ height }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <div className={`rounded-lg border shadow-sm overflow-hidden ${className}`}>
      <div style={{ height }}>
        <MapContent
          latitude={latitude}
          longitude={longitude}
          name={name}
          code={code}
          address={address}
        />
      </div>
    </div>
  )
}
