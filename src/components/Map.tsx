'use client'

import { useMemo, useState } from 'react'
import { Report, FoodShare } from '@/lib/types'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  reports: Report[]
  foodShares: FoodShare[]
  onClick?: (lat: number, lng: number, address?: string) => void
  height?: string
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

function LocateButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    setLocating(true)

    const fly = (lat: number, lng: number) => {
      map.flyTo([lat, lng], 15, { duration: 1.5 })
      setLocating(false)
    }

    const ipFallback = () => {
      fetch('https://ip-api.com/json/?fields=lat,lon')
        .then(r => r.json())
        .then(d => { if (d.lat && d.lon) fly(d.lat, d.lon) })
        .catch(() => { alert('위치를 찾을 수 없습니다'); setLocating(false) })
    }

    if (!navigator.geolocation) { ipFallback(); return }

    navigator.geolocation.getCurrentPosition(
      (pos) => fly(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        if (err.code === 1) {
          alert('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.')
          setLocating(false)
        } else {
          ipFallback()
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleLocate}
          disabled={locating}
          className="w-9 h-9 bg-white flex items-center justify-center text-lg cursor-pointer hover:bg-gray-100 border-b"
          title="내 위치"
        >
          {locating ? '⏳' : '📍'}
        </button>
      </div>
    </div>
  )
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

type PopupItem = {
  id: string; lat: number; lng: number; icon: L.DivIcon
  title: string; address: string
  description: string; photoUrl?: string; nickname: string; meta?: string
}

export default function Map({ reports, foodShares, onClick, height = '100%' }: Props) {
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
        icon: ICONS.food,
        title: `🍽️ ${f.title}`, address: f.address,
        description: f.description || '', photoUrl: f.photoUrl,
        nickname: f.nickname, meta: `${f.price}P`,
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
        <LocateButton />
        {items.map(item => (
          <Marker key={item.id} position={[item.lat, item.lng]} icon={item.icon}>
            <Popup>
              <div style={{ minWidth: 200, maxWidth: 260 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                {item.address && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>📍 {item.address}</div>
                )}
                {item.photoUrl && (
                  <img
                    src={item.photoUrl}
                    alt=""
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }}
                  />
                )}
                {item.description && (
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4, marginBottom: 6 }}>
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
