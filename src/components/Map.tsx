'use client'

import { useMemo } from 'react'
import { Report, FoodShare } from '@/lib/types'
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  reports: Report[]
  foodShares: FoodShare[]
  onClick?: (lat: number, lng: number) => void
  height?: string
  selectedId?: string | null
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick?.(e.latlng.lat, e.latlng.lng),
  })
  return null
}

function makeIcon(emoji: string) {
  return L.divIcon({
    html: `<span style="font-size:1.5rem;line-height:1">${emoji}</span>`,
    className: 'bg-transparent border-none',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })
}

const ICONS = {
  trash: makeIcon('🗑️'),
  blindspot: makeIcon('⚠️'),
  food: makeIcon('🍽️'),
}

export default function Map({ reports, foodShares, onClick, height = '100%' }: Props) {
  const items = useMemo(() => {
    const result: { id: string; lat: number; lng: number; icon: L.DivIcon; label: string }[] = []
    for (const r of reports) {
      if (r.status !== 'open') continue
      const key = r.type === 'blindspot' ? 'blindspot' : 'trash'
      result.push({
        id: `r-${r.id}`,
        lat: r.lat,
        lng: r.lng,
        icon: ICONS[key],
        label: r.type === 'trash' ? '🗑️ 쓰레기' : '⚠️ 사각지대',
      })
    }
    for (const f of foodShares) {
      if (f.status !== 'available') continue
      result.push({
        id: `f-${f.id}`,
        lat: f.lat,
        lng: f.lng,
        icon: ICONS.food,
        label: '🍽️ 음식나눔',
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
        {items.map(item => (
          <Marker key={item.id} position={[item.lat, item.lng]} icon={item.icon}>
            <Tooltip direction="top" offset={[0, -10]}>{item.label}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
