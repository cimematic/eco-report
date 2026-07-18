'use client'

import { useState, useCallback } from 'react'
import { useApp } from '@/lib/store'

function findAuthUser(nickname: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const auth = JSON.parse(localStorage.getItem('eco-report-auth') || '{}')
    return !!auth[nickname]
  } catch { return false }
}

export default function LoginModal() {
  const { user, login } = useApp()
  const [nickname, setNickname] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const isExisting = nickname.trim() ? findAuthUser(nickname.trim()) : false

  const canSubmit = nickname.trim() && pin.length === 4 && (isExisting || pin === pinConfirm)

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return
    try {
      login(nickname.trim(), pin)
    } catch (e: any) {
      setError(e.message || '로그인에 실패했습니다')
    }
  }, [nickname, pin, canSubmit, login])

  if (user) return null

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm shadow-lg"
      >
        로그인
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold mb-1">시작하기</h2>
        <p className="text-sm text-gray-500 mb-4">
          {isExisting ? 'PIN을 입력해서 로그인해주세요' : '닉네임과 PIN 4자리를 설정해주세요'}
        </p>

        <input
          autoFocus
          value={nickname}
          onChange={e => { setNickname(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && !isExisting && document.getElementById('pin-input')?.focus()}
          placeholder="닉네임"
          maxLength={10}
          className="w-full border rounded-lg px-4 py-3 mb-3 text-base outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <input
          id="pin-input"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 4)
            setPin(v)
            setError('')
            if (v.length === 4 && isExisting) handleSubmit()
          }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="PIN 4자리 숫자"
          maxLength={4}
          className="w-full border rounded-lg px-4 py-3 mb-3 text-base outline-none focus:ring-2 focus:ring-emerald-400"
        />

        {!isExisting && (
          <input
            type="password"
            inputMode="numeric"
            value={pinConfirm}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4)
              setPinConfirm(v)
              setError('')
            }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="PIN 한 번 더 입력"
            maxLength={4}
            className="w-full border rounded-lg px-4 py-3 mb-3 text-base outline-none focus:ring-2 focus:ring-emerald-400"
          />
        )}

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        {!isExisting && pin && pinConfirm && pin !== pinConfirm && (
          <p className="text-red-400 text-sm mb-3 text-center">PIN이 일치하지 않습니다</p>
        )}

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium disabled:opacity-40"
        >
          {isExisting ? '로그인' : '가입하기'}
        </button>

        {!isExisting && (
          <p className="text-xs text-gray-400 text-center mt-3">포인트 100P가 지급됩니다</p>
        )}
      </div>
    </div>
  )
}
