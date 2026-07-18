'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/store'

const missions = [
  { text: '오늘 쓰레기 사진 1장 찍기', reward: 15 },
  { text: '음식 나눔 글 1개 올리기', reward: 20 },
  { text: '오늘의 브리핑 읽기', reward: 5 },
  { text: '친구에게 앱 소개하기', reward: 30 },
  { text: '제보 3개 채우기', reward: 25 },
]

export default function MissionBanner() {
  const [todayMission, setTodayMission] = useState(missions[0])
  const [done, setDone] = useState(false)
  const { addPoints } = useApp()

  useEffect(() => {
    const idx = new Date().getDate() % missions.length
    setTodayMission(missions[idx])
    const key = `mission-${new Date().toDateString()}`
    if (localStorage.getItem(key)) setDone(true)
  }, [])

  const handleComplete = () => {
    addPoints(todayMission.reward)
    setDone(true)
    localStorage.setItem(`mission-${new Date().toDateString()}`, 'done')
  }

  if (done) return null

  return (
    <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl p-4 text-white shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-80 mb-0.5">🎯 오늘의 미션</p>
          <p className="font-semibold text-sm">{todayMission.text}</p>
        </div>
        <button
          onClick={handleComplete}
          className="bg-white text-orange-500 text-xs font-bold px-4 py-2 rounded-full shrink-0"
        >
          +{todayMission.reward}P 받기
        </button>
      </div>
    </div>
  )
}
