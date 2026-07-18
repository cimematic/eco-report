'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/store'
import dynamic from 'next/dynamic'
import type { Briefing } from '@/lib/types'

const BriefingCard = dynamic(() => import('@/components/BriefingCard'), { ssr: false })

export default function BriefingPage() {
  const { user, reports, foodShares } = useApp()
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)

  const generateBriefing = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports, foodShares }),
      })
      const data = await res.json()
      setBriefing({
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
        summary: data.summary || '',
        trashCount: data.trashCount || reports.filter(r => r.type === 'trash').length,
        blindspotCount: data.blindspotCount || reports.filter(r => r.type === 'blindspot').length,
        foodCount: data.foodCount || foodShares.filter(f => f.status === 'available').length,
        topReporter: data.topReporter || undefined,
        hotDistrict: data.hotDistrict || undefined,
        tips: data.tips || undefined,
        createdAt: Date.now(),
      })
    } catch {
      alert('브리핑 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reports.length > 0 || foodShares.length > 0) generateBriefing()
  }, [])

  const askQuestion = async (q: string) => {
    if (!q.trim()) return
    setAsking(true)
    setAnswer('')
    try {
      const res = await fetch('/api/ai-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports, foodShares, question: q }),
      })
      const data = await res.json()
      setAnswer(data.summary || '질문에 답변할 수 없습니다.')
    } catch {
      setAnswer('답변 생성에 실패했습니다.')
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🤖 AI 브리핑</h1>
        <button
          onClick={generateBriefing}
          disabled={loading}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-full disabled:opacity-40"
        >
          {loading ? '생성 중...' : '새로고침'}
        </button>
      </div>

      {briefing ? (
        <BriefingCard briefing={briefing} />
      ) : (
        <div className="bg-gray-100 rounded-2xl p-6 text-center text-gray-400 text-sm">
          {loading ? 'AI가 브리핑을 준비 중입니다...' : '제보 데이터가 없어 브리핑을 생성할 수 없습니다.'}
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-semibold mb-3">💬 궁금한 점을 물어보세요</h3>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion(question)}
            placeholder="예: 수성구에서 가장 많이 나온 문제는?"
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={() => askQuestion(question)}
            disabled={asking || !question.trim()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40"
          >
            {asking ? '...' : '질문'}
          </button>
        </div>
        {answer && (
          <div className="mt-3 bg-emerald-50 rounded-lg p-3 text-sm">
            {answer}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { q: '가장 제보가 많은 동네는?', icon: '🏘️', label: '가장 제보가 많은 동네는?' },
          { q: '오늘 환경을 위해 실천할 수 있는 일은?', icon: '🌱', label: '오늘 실천할 수 있는 일은?' },
          { q: '쓰레기 문제가 가장 심각한 곳은?', icon: '🗑️', label: '쓰레기 문제가 가장 심각한 곳은?' },
          { q: '이번 주 제보 추세를 분석해줘', icon: '📈', label: '이번 주 제보 추세 분석' },
        ].map((item) => (
          <button
            key={item.q}
            onClick={() => { setQuestion(item.q); askQuestion(item.q) }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 text-left hover:bg-emerald-50 hover:border-emerald-200 transition"
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
