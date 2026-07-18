'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'

export default function LoginModal() {
  const { user, login, logout } = useApp()
  const [nickname, setNickname] = useState('')
  const [show, setShow] = useState(false)

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
        <p className="text-sm text-gray-500 mb-4">닉네임을 입력하면 바로 시작할 수 있어요</p>
        <input
          autoFocus
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && nickname.trim() && login(nickname.trim())}
          placeholder="닉네임"
          className="w-full border rounded-lg px-4 py-3 mb-3 text-base outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          disabled={!nickname.trim()}
          onClick={() => login(nickname.trim())}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium disabled:opacity-40"
        >
          시작하기
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">포인트 100P가 지급됩니다</p>
      </div>
    </div>
  )
}
