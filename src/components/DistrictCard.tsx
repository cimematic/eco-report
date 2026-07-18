'use client'

import { useMemo } from 'react'
import { useApp } from '@/lib/store'

function extractDong(address: string): string | null {
  const matches = address.match(/([가-힣]+동)(?=\s|\d|$)/g)
  return matches ? matches[matches.length - 1] : null
}

interface DongStat {
  name: string
  reportCount: number
  foodCount: number
  topReporter: string | null
}

export default function DistrictCards() {
  const { reports, foodShares } = useApp()

  const stats = useMemo(() => {
    const map = new Map<string, DongStat>()

    for (const r of reports) {
      if (!r.address) continue
      const dong = extractDong(r.address)
      if (!dong) continue
      const cur = map.get(dong) || { name: dong, reportCount: 0, foodCount: 0, topReporter: null }
      cur.reportCount++
      map.set(dong, cur)
    }

    for (const f of foodShares) {
      if (!f.address) continue
      const dong = extractDong(f.address)
      if (!dong) continue
      const cur = map.get(dong) || { name: dong, reportCount: 0, foodCount: 0, topReporter: null }
      cur.foodCount++
      map.set(dong, cur)
    }

    for (const r of reports) {
      if (!r.address) continue
      const dong = extractDong(r.address)
      if (!dong) continue
      const cur = map.get(dong)!
      if (!cur.topReporter) cur.topReporter = r.nickname
    }

    return Array.from(map.values())
      .sort((a, b) => (b.reportCount + b.foodCount) - (a.reportCount + a.foodCount))
      .slice(0, 4)
  }, [reports, foodShares])

  if (stats.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">동네별 현황</p>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(d => (
          <div key={d.name} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm">{d.name}</span>
              {d.reportCount > 0 && (
                <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {d.reportCount > 3 ? '🔥' : '⚠️'}
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
