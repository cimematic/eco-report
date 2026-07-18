'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useApp } from '@/lib/store'
import ReportForm from '@/components/ReportForm'
import FoodForm from '@/components/FoodForm'
import MissionBanner from '@/components/MissionBanner'
import ReportCard from '@/components/ReportCard'
import FoodCard from '@/components/FoodCard'
import DistrictCards from '@/components/DistrictCard'
import AdminPanel from '@/components/AdminPanel'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

export default function Home() {
  const { user, reports, foodShares } = useApp()
  const [showReportForm, setShowReportForm] = useState(false)
  const [showFoodForm, setShowFoodForm] = useState(false)
  const [clickPos, setClickPos] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number } | null>(null)
  const [tab, setTab] = useState<'map' | 'list'>('map')
  const [showAdmin, setShowAdmin] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recentItems = [
    ...reports.slice(0, 3).map(r => ({ type: 'report' as const, data: r })),
    ...foodShares.slice(0, 3).map(f => ({ type: 'food' as const, data: f })),
  ].sort((a, b) => {
    const ta = 'createdAt' in a.data ? a.data.createdAt : 0
    const tb = 'createdAt' in b.data ? b.data.createdAt : 0
    return tb - ta
  }).slice(0, 5)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-6xl mb-4">🌍</div>
        <h1 className="text-2xl font-bold mb-2">에코리포트</h1>
        <p className="text-gray-500 mb-8 text-sm">내 동네 환경 문제를 지도에 표시하고<br />AI 브리핑으로 확인하세요</p>
        <div className="flex gap-3 text-sm text-gray-400">
          <span>🗑️ 쓰레기 제보</span>
          <span>⚠️ 사각지대</span>
          <span>🍲 음식 나눔</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold select-none"
          onPointerDown={() => { pressTimer.current = setTimeout(() => setShowAdmin(true), 800) }}
          onPointerUp={() => { if (pressTimer.current) clearTimeout(pressTimer.current) }}
          onPointerLeave={() => { if (pressTimer.current) clearTimeout(pressTimer.current) }}
        >에코리포트</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!navigator.geolocation) { alert('GPS를 지원하지 않는 브라우저입니다'); return }
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                  setUserLocation(loc)
                  setFlyToTarget(loc)
                },
                (err) => {
                  if (err.code === 1) alert('위치 권한이 거부되었습니다')
                  else if (err.code === 2) alert('위치를 찾을 수 없습니다')
                  else if (err.code === 3) alert('위치 요청 시간이 초과되었습니다')
                  else alert('위치를 가져올 수 없습니다')
                },
                { enableHighAccuracy: false, timeout: 15000 }
              )
            }}
            className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full"
          >
            📍 내 위치
          </button>
          <button
            onClick={() => { setClickPos(null); setShowFoodForm(true) }}
            className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full"
          >
            🍲 나눔등록
          </button>
          <button
            onClick={() => { setClickPos(null); setShowReportForm(true) }}
            className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full"
          >
            📸 제보하기
          </button>
        </div>
      </div>

      <MissionBanner />

      <DistrictCards />

      <div className="flex gap-2 mb-1">
        <button
          onClick={() => setTab('map')}
          className={`text-sm px-3 py-1.5 rounded-full ${tab === 'map' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'}`}
        >
          지도
        </button>
        <button
          onClick={() => setTab('list')}
          className={`text-sm px-3 py-1.5 rounded-full ${tab === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'}`}
        >
          최근 소식
        </button>
      </div>

      {tab === 'map' ? (
        <div className="h-[400px] rounded-xl overflow-hidden shadow-md">
          <Map
            reports={reports}
            foodShares={foodShares}
            flyToTarget={flyToTarget}
            userLocation={userLocation}
            onClick={(lat, lng, addr) => {
              setClickPos({ lat, lng, address: addr || '' })
              setShowReportForm(true)
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">최근 제보 및 나눔 소식</p>
          {recentItems.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">아직 제보가 없어요<br />가장 먼저 제보해보세요!</p>
          )}
          {recentItems.map((item, i) =>
            item.type === 'report' ? (
              <div key={item.data.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                <ReportCard report={item.data as any} />
              </div>
            ) : (
              <div key={item.data.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                <FoodCard food={item.data as any} />
              </div>
            )
          )}
        </div>
      )}

      {showReportForm && (
        <ReportForm
          lat={clickPos?.lat}
          lng={clickPos?.lng}
          initialAddress={clickPos?.address || ''}
          onClose={() => { setShowReportForm(false); setClickPos(null) }}
        />
      )}
      {showFoodForm && (
        <FoodForm
          lat={35.87}
          lng={128.6}
          onClose={() => setShowFoodForm(false)}
        />
      )}

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  )
}
