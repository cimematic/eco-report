'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'

const ADMIN_CODE = '0417'

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const { reports, foodShares, deleteReport, deleteFoodShare, toggleReportStatus } = useApp()
  const [code, setCode] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = () => {
    if (code === ADMIN_CODE) {
      setUnlocked(true)
      setError('')
    } else {
      setError('잘못된 코드입니다')
    }
  }

  const handleDeleteReport = async (id: string) => {
    if (!confirm('이 제보를 삭제하시겠습니까?')) return
    await deleteReport(id)
  }

  const handleDeleteFood = async (id: string) => {
    if (!confirm('이 나눔글을 삭제하시겠습니까?')) return
    await deleteFoodShare(id)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">🔐 관리자</h2>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">&times;</button>
        </div>

        {!unlocked ? (
          <div>
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              value={code}
              onChange={e => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 4))
                setError('')
              }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="관리자 코드 4자리"
              maxLength={4}
              className="w-full border rounded-lg px-4 py-3 mb-3 text-base outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              disabled={code.length !== 4}
              onClick={handleVerify}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium disabled:opacity-40"
            >
              확인
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto space-y-4 flex-1 min-h-0">
            <p className="text-xs text-gray-400">총 제보 {reports.length}건 / 나눔 {foodShares.length}건</p>

            {reports.length === 0 && foodShares.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">게시글이 없습니다</p>
            )}

            {reports.map(r => (
              <div key={r.id} className="border rounded-xl p-3 flex gap-2 items-start">
                <div className="flex-1 min-w-0 text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{r.nickname}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      r.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {r.status === 'resolved' ? '✅ 해결됨' : '🟡 미해결'}
                    </span>
                  </div>
                  <p className="text-gray-500 truncate">{r.address || '주소 없음'}</p>
                  <p className="text-gray-700 truncate">{r.description}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleReportStatus(r.id)}
                    className={`text-xs rounded-lg px-2.5 py-1 border ${
                      r.status === 'resolved'
                        ? 'text-gray-500 border-gray-200 hover:bg-gray-50'
                        : 'text-green-600 border-green-200 hover:bg-green-50'
                    }`}
                  >
                    {r.status === 'resolved' ? '되돌리기' : '해결'}
                  </button>
                  <button
                    onClick={() => handleDeleteReport(r.id)}
                    className="text-red-500 text-xs shrink-0 border border-red-300 rounded-lg px-2.5 py-1 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}

            {foodShares.map(f => (
              <div key={f.id} className="border rounded-xl p-3 flex gap-3 items-start">
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-medium truncate">{f.productName}</p>
                  <p className="text-gray-500 truncate">{f.address || '주소 없음'}</p>
                  <p className="text-gray-700 truncate">{f.description}</p>
                  <span className="text-xs text-gray-400">{f.price}P</span>
                </div>
                <button
                  onClick={() => handleDeleteFood(f.id)}
                  className="text-red-500 text-xs shrink-0 border border-red-300 rounded-lg px-2.5 py-1 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
