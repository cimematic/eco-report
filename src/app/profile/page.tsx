'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'

function hashPin(pin: string): string {
  return btoa(pin)
}

export default function ProfilePage() {
  const { user, reports, foodShares } = useApp()
  const [showPinChange, setShowPinChange] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newPinConfirm, setNewPinConfirm] = useState('')
  const [pinMsg, setPinMsg] = useState('')

  if (!user) return null

  const myReports = reports.filter(r => r.userId === user.id)
  const myFoods = foodShares.filter(f => f.userId === user.id)

  const handleChangePin = () => {
    if (!user.pinHash) return
    if (hashPin(oldPin) !== user.pinHash) {
      setPinMsg('현재 PIN이 일치하지 않습니다')
      return
    }
    if (newPin.length !== 4) {
      setPinMsg('새 PIN은 4자리 숫자여야 합니다')
      return
    }
    if (newPin !== newPinConfirm) {
      setPinMsg('새 PIN이 일치하지 않습니다')
      return
    }

    const updated = { ...user, pinHash: hashPin(newPin) }
    localStorage.setItem('eco-report-user', JSON.stringify(updated))
    const auth = JSON.parse(localStorage.getItem('eco-report-auth') || '{}')
    if (auth[user.nickname]) {
      auth[user.nickname] = { ...auth[user.nickname], ...updated }
      localStorage.setItem('eco-report-auth', JSON.stringify(auth))
    }
    setPinMsg('PIN이 변경되었습니다 ✅')
    setOldPin(''); setNewPin(''); setNewPinConfirm('')
    setTimeout(() => setShowPinChange(false), 1500)
  }

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

      {showPinChange ? (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold">🔐 PIN 변경</h3>
          <input
            type="password" inputMode="numeric" placeholder="현재 PIN"
            value={oldPin} maxLength={4}
            onChange={e => { setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinMsg('') }}
            className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password" inputMode="numeric" placeholder="새 PIN (4자리 숫자)"
            value={newPin} maxLength={4}
            onChange={e => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinMsg('') }}
            className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password" inputMode="numeric" placeholder="새 PIN 한 번 더"
            value={newPinConfirm} maxLength={4}
            onChange={e => { setNewPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinMsg('') }}
            className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {pinMsg && <p className={`text-sm text-center ${pinMsg.includes('✅') ? 'text-emerald-600' : 'text-red-500'}`}>{pinMsg}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowPinChange(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600">취소</button>
            <button onClick={handleChangePin} disabled={!oldPin || !newPin || !newPinConfirm} className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm disabled:opacity-40">변경</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowPinChange(true)} className="w-full bg-white rounded-xl p-4 shadow-sm text-sm text-gray-600 text-left">
          🔐 PIN 변경
        </button>
      )}

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
