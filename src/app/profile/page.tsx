'use client'

import { useApp } from '@/lib/store'

export default function ProfilePage() {
  const { user, reports, foodShares } = useApp()

  if (!user) return null

  const myReports = reports.filter(r => r.userId === user.id)
  const myFoods = foodShares.filter(f => f.userId === user.id)

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
          {user.nickname[0]}
        </div>
        <h2 className="text-lg font-bold">{user.nickname}</h2>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-emerald-600 font-bold text-xl">{user.points}</span>
          <span className="text-gray-400 text-sm">P</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl mb-1">📸</div>
          <div className="text-xl font-bold">{myReports.length}</div>
          <div className="text-xs text-gray-500">내 제보</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl mb-1">🍲</div>
          <div className="text-xl font-bold">{myFoods.length}</div>
          <div className="text-xs text-gray-500">내 나눔</div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <h3 className="text-sm font-semibold mb-2">🏆 업적</h3>
        <div className="flex flex-wrap gap-2">
          {myReports.length >= 1 && <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">🌱 첫 제보</span>}
          {myReports.length >= 5 && <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">⭐ 환경 지킴이</span>}
          {myReports.length >= 10 && <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">🏅 10회 제보</span>}
          {myFoods.length >= 1 && <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">🍲 나눔 천사</span>}
          {myFoods.filter(f => f.status === 'sold').length >= 1 && <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">🤝 따뜻한 나눔</span>}
          {myReports.length === 0 && <span className="text-gray-400 text-xs">아직 획득한 업적이 없어요</span>}
        </div>
      </div>
    </div>
  )
}
