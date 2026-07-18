'use client'

import { useApp } from '@/lib/store'
import { FoodShare } from '@/lib/types'

interface Props {
  food: FoodShare
  onChat?: (food: FoodShare) => void
  onBuy?: (food: FoodShare) => void
}

const brandColors: Record<string, string> = {
  GS25: 'text-blue-600 bg-blue-50',
  CU: 'text-purple-600 bg-purple-50',
  '7-Eleven': 'text-green-600 bg-green-50',
  Emart24: 'text-orange-600 bg-orange-50',
  Ministop: 'text-red-600 bg-red-50',
}

function isExpired(dateStr: string): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

export default function FoodCard({ food, onChat, onBuy }: Props) {
  const { user } = useApp()
  const expired = isExpired(food.expirationDate)
  const isMine = user?.id === food.userId
  const canAfford = user ? user.points >= food.price : false

  const dDays = (() => {
    if (!food.expirationDate) return null
    const diff = Math.ceil((new Date(food.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return '유통기한 만료'
    if (diff === 0) return '오늘까지'
    return `D-${diff}`
  })()

  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm ${expired ? 'opacity-50' : ''}`}>
      <div className="flex gap-3">
        {food.photoUrl && (
          <img
            src={food.photoUrl}
            alt={food.productName}
            className="w-20 h-20 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{food.productName || '제품명 없음'}</h3>
            {food.storeBrand && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${brandColors[food.storeBrand] || 'text-gray-500 bg-gray-100'}`}>
                {food.storeBrand}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            {dDays && (
              <span className={expired ? 'text-red-500 font-medium' : ''}>{dDays}</span>
            )}
            {food.storageMethod && <span>📦 {food.storageMethod}</span>}
            {food.allergens && <span>⚠️ {food.allergens}</span>}
            {food.originalPrice && food.originalPrice > 0 && (
              <span className="text-gray-400 line-through">정가 {food.originalPrice.toLocaleString()}원</span>
            )}
          </div>

          {food.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{food.description}</p>
          )}

          {food.pickupDeadline && (
            <p className="text-[10px] text-gray-400 mt-1">⏰ 픽업 마감: 오늘 {food.pickupDeadline}까지</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{food.nickname}</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold text-sm">{food.price}P</span>
              {expired ? (
                <span className="text-xs text-gray-400">만료</span>
              ) : food.status === 'available' ? (
                <div className="flex gap-1.5">
                  {!isMine ? (
                    <>
                      <button
                        onClick={() => onChat?.(food)}
                        className="bg-blue-500 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-blue-600"
                      >
                        채팅
                      </button>
                      <button
                        onClick={() => onBuy?.(food)}
                        disabled={!canAfford}
                        className="bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {canAfford ? '구매' : '포인트 부족'}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">내 상품</span>
                  )}
                </div>
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
