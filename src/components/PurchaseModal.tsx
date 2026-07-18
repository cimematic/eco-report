'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { FoodShare } from '@/lib/types'

interface Props {
  food: FoodShare
  onClose: () => void
  onChatStart: (food: FoodShare) => void
}

export default function PurchaseModal({ food, onClose, onChatStart }: Props) {
  const { buyFood, user } = useApp()
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!user) return null

  const afterPoints = user.points - food.price

  const handleBuy = async () => {
    setBusy(true)
    const ok = await buyFood(food.id)
    setBusy(false)
    if (ok) setDone(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {!done ? (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🛒</span>
              <div>
                <h2 className="font-bold">구매 확인</h2>
                <p className="text-xs text-gray-400">아래 내용을 확인해주세요</p>
              </div>
            </div>

            <div className="flex gap-3 bg-gray-50 rounded-xl p-3 mb-4">
              {food.photoUrl && (
                <img src={food.photoUrl} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{food.productName}</p>
                {food.storeBrand && (
                  <p className="text-xs text-gray-500">{food.storeBrand}</p>
                )}
                {food.originalPrice && food.originalPrice > 0 && (
                  <p className="text-xs text-gray-400 line-through mt-0.5">
                    정가 {food.originalPrice.toLocaleString()}원
                  </p>
                )}
              </div>
            </div>

            {food.originalPrice && food.originalPrice > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>정가</span>
                <span className="line-through">{food.originalPrice.toLocaleString()}원</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span>구매 포인트</span>
              <span className="text-emerald-600 font-bold">{food.price}P</span>
            </div>

            <div className="border-t pt-2 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>보유 포인트</span>
                <span>{user.points}P</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>사용 포인트</span>
                <span className="text-red-500">-{food.price}P</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t">
                <span>잔여 포인트</span>
                <span className={afterPoints >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                  {afterPoints}P
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 rounded-lg py-3 text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleBuy}
                disabled={busy}
                className="flex-1 bg-emerald-600 text-white rounded-lg py-3 text-sm font-medium disabled:opacity-40"
              >
                {busy ? '처리 중...' : '구매하기'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-5xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-lg font-bold mb-1">구매 완료!</h2>
            <p className="text-xs text-gray-500 mb-4">{food.productName}</p>

            <div className="bg-emerald-50 rounded-xl p-4 mb-4 text-left space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">사용 포인트</span>
                <span className="font-medium text-red-500">-{food.price}P</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">잔여 포인트</span>
                <span className="font-bold text-emerald-600">{afterPoints}P</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              판매자에게 채팅으로<br />픽업 시간을 문의해주세요
            </p>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 rounded-lg py-3 text-sm text-gray-600"
              >
                확인
              </button>
              <button
                onClick={() => { onChatStart(food); onClose() }}
                className="flex-1 bg-blue-500 text-white rounded-lg py-3 text-sm font-medium"
              >
                💬 채팅하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
