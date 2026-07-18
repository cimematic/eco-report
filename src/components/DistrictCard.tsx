'use client'

import { useMemo } from 'react'
import { useApp } from '@/lib/store'

const districts = [
  { name: '범어동', lat: 35.855, lng: 128.615 },
  { name: '지산동', lat: 35.862, lng: 128.608 },
  { name: '황금동', lat: 35.848, lng: 128.622 },
  { name: '중동', lat: 35.870, lng: 128.605 },
  { name: '만촌동', lat: 35.858, lng: 128.598 },
  { name: '수성동', lat: 35.865, lng: 128.612 },
]

export default function DistrictCards() {
  const { reports, foodShares } = useApp()

  const stats = useMemo(() => {
    return districts.map(d => {
      const districtReports = reports.filter(r =>
        r.address?.includes(d.name)
      )
      const districtFoods = foodShares.filter(f =>
        f.address?.includes(d.name)
      )
      const topReporter = getTopReporter(districtReports)
      return {
        ...d,
        reportCount: districtReports.length,
        foodCount: districtFoods.length,
        topReporter,
      }
    })
  }, [reports, foodShares])

  const topDistricts = [...stats].sort((a, b) => b.reportCount - a.reportCount).slice(0, 4)

  if (topDistricts.every(d => d.reportCount === 0 && d.foodCount === 0)) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">동네별 현황</p>
      <div className="grid grid-cols-2 gap-2">
        {topDistricts.map(d => (
          <div key={d.name} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm">{d.name}</span>
              {d.reportCount > 0 && (
                <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {d.reportCount > 3 ? '🔥' : d.reportCount > 0 ? '⚠️' : ''}
                </span>
              )}
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>🗑️ {d.reportCount}</span>
              <span>🍲 {d.foodCount}</span>
            </div>
            {d.topReporter && (
              <p className="text-[10px] text-gray-400 mt-1 truncate">🏆 {d.topReporter}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function getTopReporter(reports: { nickname: string }[]): string | null {
  const count: Record<string, number> = {}
  reports.forEach(r => { count[r.nickname] = (count[r.nickname] || 0) + 1 })
  const sorted = Object.entries(count).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || null
}
