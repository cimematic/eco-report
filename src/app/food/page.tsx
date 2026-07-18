'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import FoodCard from '@/components/FoodCard'
import FoodForm from '@/components/FoodForm'

export default function FoodPage() {
  const { user, foodShares } = useApp()
  const [showForm, setShowForm] = useState(false)

  if (!user) return null

  const available = foodShares.filter(f => f.status === 'available')
  const sold = foodShares.filter(f => f.status === 'sold')
  const myFoods = foodShares.filter(f => f.userId === user.id)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🍲 음식 나눔</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white text-sm px-4 py-2 rounded-full"
        >
          + 나눔 등록
        </button>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
        <p className="text-xs text-gray-500 mb-1">내 포인트</p>
        <p className="text-2xl font-bold text-orange-600">{user.points}P</p>
      </div>

      {myFoods.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">내 나눔</h2>
          <div className="space-y-2">
            {myFoods.map(food => (
              <div key={food.id} className="bg-white rounded-xl border p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{food.title}</p>
                  <p className="text-xs text-gray-400">{food.price}P · {food.status === 'available' ? '판매중' : '거래완료'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${food.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {food.status === 'available' ? '판매중' : '거래완료'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-600">나눔 목록 ({available.length}개)</h2>

      {available.length === 0 && (
        <div className="text-center text-gray-400 py-16 text-sm">
          현재 나눔 중인 음식이 없습니다<br />
          남는 음식을 나눠보세요!
        </div>
      )}

      <div className="space-y-3">
        {available.map(food => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>

      {sold.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-600 mt-6">거래 완료</h2>
          <div className="space-y-2 opacity-60">
            {sold.map(food => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </>
      )}

      {showForm && <FoodForm lat={35.87} lng={128.6} onClose={() => setShowForm(false)} />}
    </div>
  )
}
