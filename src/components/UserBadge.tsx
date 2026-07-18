'use client'

import { useApp } from '@/lib/store'

export default function UserBadge() {
  const { user, logout } = useApp()

  if (!user) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className="bg-white rounded-full px-3 py-1.5 shadow-md text-sm flex items-center gap-1.5">
        <span className="font-medium text-gray-700">{user.nickname}</span>
        <span className="text-emerald-600 font-bold">{user.points}P</span>
      </div>
      <button
        onClick={logout}
        className="bg-white/80 rounded-full px-2.5 py-1.5 shadow-md text-xs text-gray-500"
      >
        로그아웃
      </button>
    </div>
  )
}
