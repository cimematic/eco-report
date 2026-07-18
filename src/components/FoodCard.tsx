'use client'

import { useApp } from '@/lib/store'
import { FoodShare } from '@/lib/types'

interface Props {
  food: FoodShare
}

export default function FoodCard({ food }: Props) {
  const { buyFood, user } = useApp()

  const canBuy = user && food.status === 'available' && food.userId !== user.id && user.points >= food.price

  const handleBuy = () => {
    if (!canBuy) return
    if (!confirm(`${food.price}P를 사용하여 "${food.title}"을(를) 구매하시겠습니까?`)) return
    if (buyFood(food.id)) {
      alert('구매 완료! 판매자에게 연락해주세요.')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex gap-3">
        {food.photoUrl && (
          <img
            src={food.photoUrl}
            alt={food.title}
            className="w-20 h-20 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{food.title}</h3>
          {food.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{food.description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{food.nickname}</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold text-sm">{food.price}P</span>
              {food.status === 'available' ? (
                <button
                  onClick={handleBuy}
                  disabled={!canBuy}
                  className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  구매
                </button>
              ) : (
                <span className="text-xs text-gray-400">거래완료</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
