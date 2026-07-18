'use client'

import { useMemo, useEffect, useRef } from 'react'
import { Report, FoodShare } from '@/lib/types'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  reports: Report[]
  foodShares: FoodShare[]
  onClick?: (lat: number, lng: number, address?: string) => void
  height?: string
  flyToTarget?: { lat: number; lng: number } | null
  userLocation?: { lat: number; lng: number } | null
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number, address?: string) => void }) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      if (onClick) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`
          )
          const data = await res.json()
          onClick(lat, lng, data.display_name || '')
        } catch {
          onClick(lat, lng)
        }
      }
    },
  })
  return null
}

function MapController({ flyToTarget }: { flyToTarget?: { lat: number; lng: number } | null }) {
  const map = useMap()
  const prev = useRef<number>(0)
  useEffect(() => {
    if (!flyToTarget) return
    const key = flyToTarget.lat + flyToTarget.lng
    if (key === prev.current) return
    prev.current = key
    map.flyTo([flyToTarget.lat, flyToTarget.lng], 15, { duration: 1.5 })
  }, [flyToTarget, map])
  return null
}

function UserLocationMarker({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap()
  const markerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    if (!location) {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng])
      return
    }
    const marker = L.circleMarker([location.lat, location.lng], {
      radius: 10,
      fillColor: '#3b82f6',
      color: '#fff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.6,
    })
    marker.bindPopup('📍 내 위치')
    marker.addTo(map)
    markerRef.current = marker
  }, [location, map])

  return null
}

function makeIcon(bgColor: string, label: string) {
  return L.divIcon({
    html: `<div style="background:${bgColor};color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.3);border:2px solid #fff">${label}</div>`,
    className: 'bg-transparent border-none',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

const BRAND_ICONS: Record<string, L.DivIcon> = {
  GS25: makeIcon('#2563eb', 'GS'),
  CU: makeIcon('#7c3aed', 'CU'),
  '7-Eleven': makeIcon('#16a34a', '7E'),
  Emart24: makeIcon('#ea580c', 'E24'),
  Ministop: makeIcon('#dc2626', 'MS'),
}

const DEFAULT_FOOD_ICON = makeIcon('#6b7280', '🏪')

const ICONS = {
  trash: makeIcon('#6b7280', '🗑️'),
  blindspot: makeIcon('#f59e0b', '⚠️'),
}

type PopupItem = {
  id: string; lat: number; lng: number; icon: L.DivIcon
  title: string; address: string
  description: string; photoUrl?: string; nickname: string; meta?: string
  brand?: string; dDays?: string | null; originalPrice?: number; price?: number
}

function dDays(dateStr: string): string | null {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return '만료'
  if (diff === 0) return 'D-Day'
  return `D-${diff}`
}

export default function Map({ reports, foodShares, onClick, height = '100%', flyToTarget, userLocation }: Props) {
  const items = useMemo(() => {
    const result: PopupItem[] = []
    for (const r of reports) {
      if (r.status !== 'open') continue
      result.push({
        id: `r-${r.id}`, lat: r.lat, lng: r.lng,
        icon: r.type === 'blindspot' ? ICONS.blindspot : ICONS.trash,
        title: r.type === 'trash' ? '🗑️ 쓰레기 무단투기' : '⚠️ 사각지대',
        address: r.address, description: r.description || '',
        photoUrl: r.photoUrl, nickname: r.nickname,
      })
    }
    for (const f of foodShares) {
      if (f.status !== 'available') continue
      result.push({
        id: `f-${f.id}`, lat: f.lat, lng: f.lng,
        icon: BRAND_ICONS[f.storeBrand || ''] || DEFAULT_FOOD_ICON,
        title: f.productName,
        address: f.address,
        description: f.description || '',
        photoUrl: f.photoUrl,
        nickname: f.nickname,
        meta: `${f.price}P`,
        brand: f.storeBrand,
        dDays: dDays(f.expirationDate),
        originalPrice: f.originalPrice,
        price: f.price,
      })
    }
    return result
  }, [reports, foodShares])

  return (
    <div style={{ width: '100%', height }} className="rounded-xl overflow-hidden">
      <MapContainer center={[35.87, 128.6]} zoom={13} className="w-full h-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onClick={onClick} />
        <MapController flyToTarget={flyToTarget} />
        <UserLocationMarker location={userLocation ?? null} />
        {items.map(item => (
          <Marker key={item.id} position={[item.lat, item.lng]} icon={item.icon}>
            <Popup>
              <div style={{ minWidth: 200, maxWidth: 260 }}>
                {item.brand && (
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                    🏪 {item.brand}
                  </div>
                )}
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                {item.address && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>📍 {item.address}</div>
                )}
                {item.dDays && (
                  <div style={{
                    fontSize: 11, fontWeight: 600, marginBottom: 4,
                    color: item.dDays === '만료' ? '#dc2626' : '#059669',
                  }}>
                    {item.dDays === '만료' ? '❌ 유통기한 만료' : `⏰ ${item.dDays}`}
                  </div>
                )}
                {item.originalPrice && item.originalPrice > 0 && (
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 2, textDecoration: 'line-through' }}>
                    정가 {item.originalPrice.toLocaleString()}원
                  </div>
                )}
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt=""
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 4 }}
                  />
                )}
                {item.description && (
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4, marginBottom: 4 }}>
                    {item.description}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#999', borderTop: '1px solid #eee', paddingTop: 4 }}>
                  👤 {item.nickname}{item.meta ? ` · ${item.meta}` : ''}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
