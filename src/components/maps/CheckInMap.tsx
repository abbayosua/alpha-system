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
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)

interface CheckInMapProps {
  tpsLatitude: number
  tpsLongitude: number
  tpsName: string
  tpsCode?: string
  userLatitude?: number | null
  userLongitude?: number | null
  isWithinRange?: boolean
  radiusMeters?: number
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

// TPS marker - red/orange colored
const tpsIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="position: relative; width: 32px; height: 42px;">
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#f97316" stroke="#fff" stroke-width="1.5"/>
        <circle cx="16" cy="15" r="5" fill="white" opacity="0.9"/>
        <path d="M14 15l1.5 1.5L18.5 13" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
})

function createUserIcon(withinRange: boolean | undefined) {
  const color = withinRange === true ? '#22c55e' : withinRange === false ? '#ef4444' : '#3b82f6'
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 24px; height: 34px;">
        <svg width="24" height="34" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22C24 5.373 18.627 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
          <circle cx="12" cy="11" r="3.5" fill="white" opacity="0.9"/>
        </svg>
      </div>
    `,
    iconSize: [24, 34],
    iconAnchor: [12, 34],
    popupAnchor: [0, -34],
  })
}

function MapContent({
  tpsLatitude,
  tpsLongitude,
  tpsName,
  tpsCode,
  userLatitude,
  userLongitude,
  isWithinRange,
  radiusMeters = 100,
}: Omit<CheckInMapProps, 'height' | 'className'>) {
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon
  }, [])

  return (
    <MapContainer
      center={[tpsLatitude, tpsLongitude]}
      zoom={16}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* TPS verification radius circle */}
      <Circle
        center={[tpsLatitude, tpsLongitude]}
        radius={radiusMeters}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '8, 4',
        }}
      />

      {/* TPS marker */}
      <Marker position={[tpsLatitude, tpsLongitude]} icon={tpsIcon}>
        <Popup>
          <div className="text-sm">
            <p className="font-bold">{tpsCode ? `${tpsCode} - ` : ''}{tpsName}</p>
            <p className="text-gray-500 text-xs mt-1">Lokasi TPS</p>
            <p className="text-gray-400 text-xs mt-1">
              Radius verifikasi: {radiusMeters}m
            </p>
          </div>
        </Popup>
      </Marker>

      {/* User location marker */}
      {userLatitude !== null && userLatitude !== undefined && userLongitude !== null && userLongitude !== undefined && (
        <Marker
          position={[userLatitude, userLongitude]}
          icon={createUserIcon(isWithinRange)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">Lokasi Anda</p>
              <p className="text-gray-500 text-xs mt-1">
                {userLatitude.toFixed(6)}, {userLongitude.toFixed(6)}
              </p>
              <p className={`text-xs mt-1 font-medium ${
                isWithinRange ? 'text-green-600' : isWithinRange === false ? 'text-red-600' : ''
              }`}>
                {isWithinRange === true ? '✓ Dalam radius TPS' : isWithinRange === false ? '✗ Di luar radius TPS' : 'Menunggu verifikasi...'}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function CheckInMap({
  tpsLatitude,
  tpsLongitude,
  tpsName,
  tpsCode,
  userLatitude,
  userLongitude,
  isWithinRange,
  radiusMeters = 100,
  height = '300px',
  className = '',
}: CheckInMapProps) {
  const mounted = useIsMounted()

  if (!mounted || isNaN(tpsLatitude) || isNaN(tpsLongitude)) {
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
    <div className={`relative rounded-lg border shadow-sm overflow-hidden ${className}`}>
      <div style={{ height }}>
        <MapContent
          tpsLatitude={tpsLatitude}
          tpsLongitude={tpsLongitude}
          tpsName={tpsName}
          tpsCode={tpsCode}
          userLatitude={userLatitude}
          userLongitude={userLongitude}
          isWithinRange={isWithinRange}
          radiusMeters={radiusMeters}
        />
      </div>
      {/* Status indicator */}
      {userLatitude !== null && userLatitude !== undefined && (
        <div className="absolute top-3 right-3 z-[1000]">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-md ${
            isWithinRange === true
              ? 'bg-green-500 text-white'
              : isWithinRange === false
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            {isWithinRange === true
              ? '✓ Dalam Radius'
              : isWithinRange === false
              ? '✗ Di Luar Radius'
              : 'Lokasi Terdeteksi'
            }
          </div>
        </div>
      )}
    </div>
  )
}
