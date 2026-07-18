'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/store'

const steps = [
  {
    icon: '🗺️',
    title: '내 동네 환경 문제',
    desc: '지도에서 쓰레기 무단투기와 사각지대를 확인하세요',
  },
  {
    icon: '📸',
    title: '사진으로 제보',
    desc: '문제가 있는 곳을 발견하면 사진을 찍어 제보해주세요',
  },
  {
    icon: '🍲',
    title: '음식 나눔',
    desc: '남는 음식을 나누고 포인트로 거래해보세요',
  },
  {
    icon: '🤖',
    title: 'AI 브리핑',
    desc: '하루 동안의 제보를 AI가 자동으로 요약해드려요',
  },
]

export default function Onboarding() {
  const { user } = useApp()
  const [step, setStep] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem('eco-report-onboarding')
    if (!done && !user) setShow(true)
  }, [user])

  const complete = () => {
    localStorage.setItem('eco-report-onboarding', 'done')
    setShow(false)
  }

  if (!show) return null

  const s = steps[step]

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-7xl mb-6 animate-bounce">{s.icon}</div>
        <h2 className="text-2xl font-bold mb-3 text-center">{s.title}</h2>
        <p className="text-gray-500 text-center leading-relaxed">{s.desc}</p>
        <div className="flex gap-2 mt-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-emerald-600 w-6' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
      <div className="px-6 pb-12">
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full bg-emerald-600 text-white rounded-xl py-4 font-semibold text-lg"
          >
            다음
          </button>
        ) : (
          <button
            onClick={complete}
            className="w-full bg-emerald-600 text-white rounded-xl py-4 font-semibold text-lg"
          >
            시작하기
          </button>
        )}
        <button onClick={complete} className="w-full text-center text-gray-400 py-3 text-sm mt-2">
          건너뛰기
        </button>
      </div>
    </div>
  )
}
