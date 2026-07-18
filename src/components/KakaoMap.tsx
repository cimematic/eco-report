'use client'

import { useEffect, useRef, useState } from 'react'
import { Report, FoodShare } from '@/lib/types'

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAPS_KEY || ''

interface Props {
  reports: Report[]
  foodShares: FoodShare[]
  onClick?: (lat: number, lng: number) => void
  height?: string
  selectedId?: string | null
}

declare global {
  interface Window {
    kakao: any
  }
}

export default function KakaoMap({ reports, foodShares, onClick, height = '100%', selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!KAKAO_KEY) {
      setLoaded(true)
      return
    }
    if (window.kakao?.maps) {
      setLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => setLoaded(true))
    }
    document.head.appendChild(script)
    return () => { script.remove() }
  }, [])

  useEffect(() => {
    if (!loaded || !containerRef.current) return
    if (!window.kakao?.maps) {
      if (!markersRef.current.length) {
        const fallback = document.createElement('div')
        fallback.className = 'flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50 rounded-xl'
        fallback.textContent = 'Kakao Maps API 키가 필요합니다 (.env.local에 NEXT_PUBLIC_KAKAO_MAPS_KEY 설정)'
        containerRef.current.appendChild(fallback)
      }
      return
    }

    if (!mapRef.current) {
      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(35.87, 128.6),
        level: 8,
      })
      if (onClick) {
        window.kakao.maps.event.addListener(mapRef.current, 'click', (e: any) => {
          onClick(e.latLng.getLat(), e.latLng.getLng())
        })
      }
    }

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const allItems: ({ lat: number; lng: number; label: string; type: string })[] = [
      ...reports.filter(r => r.status === 'open').map(r => ({
        lat: r.lat, lng: r.lng,
        label: r.type === 'trash' ? '🗑️' : r.type === 'blindspot' ? '⚠️' : '🍲',
        type: r.type,
      })),
      ...foodShares.filter(f => f.status === 'available').map(f => ({
        lat: f.lat, lng: f.lng, label: '🍽️', type: 'food',
      })),
    ]

    allItems.forEach(item => {
      const marker = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: new window.kakao.maps.LatLng(item.lat, item.lng),
        title: item.label,
      })
      const info = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:4px 8px;font-size:13px;white-space:nowrap">${item.label}</div>`,
      })
      window.kakao.maps.event.addListener(marker, 'mouseover', () => info.open(mapRef.current, marker))
      window.kakao.maps.event.addListener(marker, 'mouseout', () => info.close())
      markersRef.current.push(marker)
    })
  }, [loaded, reports, foodShares, onClick])

  return (
    <div ref={containerRef} style={{ width: '100%', height }} className="rounded-xl overflow-hidden" />
  )
}
