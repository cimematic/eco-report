'use client'

import { Briefing } from '@/lib/types'

interface Props {
  briefing: Briefing
}

export default function BriefingCard({ briefing }: Props) {
  return (
    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">오늘의 브리핑</h2>
        <span className="text-emerald-200 text-sm">{briefing.date}</span>
      </div>

      <p className="text-sm leading-relaxed mb-4 opacity-90">{briefing.summary}</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">🗑️</div>
          <div className="text-lg font-bold">{briefing.trashCount}</div>
          <div className="text-[11px] opacity-70">쓰레기</div>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-lg font-bold">{briefing.blindspotCount}</div>
          <div className="text-[11px] opacity-70">사각지대</div>
        </div>
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <div className="text-2xl mb-1">🍲</div>
          <div className="text-lg font-bold">{briefing.foodCount}</div>
          <div className="text-[11px] opacity-70">음식나눔</div>
        </div>
      </div>

      {briefing.topReporter && (
        <div className="mt-3 bg-white/10 rounded-xl px-4 py-2 text-sm">
          🏆 오늘의 제보왕: <strong>{briefing.topReporter}</strong>
        </div>
      )}

      {briefing.hotDistrict && (
        <div className="mt-2 bg-white/10 rounded-xl px-4 py-2 text-sm">
          🔥 관심 지역: <strong>{briefing.hotDistrict}</strong>
        </div>
      )}

      {briefing.tips && (
        <div className="mt-2 bg-white/10 rounded-xl px-4 py-2 text-sm">
          💡 {briefing.tips}
        </div>
      )}
    </div>
  )
}
