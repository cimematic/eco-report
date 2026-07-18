'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import FoodCard from '@/components/FoodCard'
import FoodForm from '@/components/FoodForm'
import ChatRoom from '@/components/ChatRoom'
import ChatList from '@/components/ChatList'
import PurchaseModal from '@/components/PurchaseModal'
import { FoodShare } from '@/lib/types'

function isExpired(dateStr: string): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

function isUnread(chat: { lastMessageAt?: number; lastReadBySeller?: number; lastReadByBuyer?: number }, userId: string, sellerId: string): boolean {
  if (!chat.lastMessageAt) return false
  const lastRead = userId === sellerId ? chat.lastReadBySeller : chat.lastReadByBuyer
  return !lastRead || chat.lastMessageAt > lastRead
}

export default function FoodPage() {
  const { user, foodShares, chats, createChat, markChatRead } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [chatTarget, setChatTarget] = useState<FoodShare | null>(null)
  const [showChatList, setShowChatList] = useState(false)
  const [buyTarget, setBuyTarget] = useState<FoodShare | null>(null)

  if (!user) return null

  const available = foodShares.filter(f => f.status === 'available' && !isExpired(f.expirationDate))
  const sold = foodShares.filter(f => f.status === 'sold')
  const myFoods = foodShares.filter(f => f.userId === user.id)
  const myExpired = myFoods.filter(f => isExpired(f.expirationDate))
  const myActive = myFoods.filter(f => !isExpired(f.expirationDate))

  const myChats = chats.filter(c => c.participants.includes(user.id))
  const unreadCount = useMemo(() =>
    myChats.filter(c => isUnread(c, user.id, c.sellerId)).length,
  [myChats, user.id])

  const handleChat = async (food: FoodShare) => {
    const chatId = await createChat(food.id, food.userId, food.nickname, food.productName)
    if (chatId) {
      setChatTarget(food)
    }
  }

  const handleBuyStart = (food: FoodShare) => {
    setBuyTarget(food)
  }

  const handleBuyClose = () => {
    setBuyTarget(null)
  }

  const handleChatStartAfterBuy = (food: FoodShare) => {
    handleChat(food)
    setBuyTarget(null)
  }

  const handleChatRoomClose = () => {
    if (chatTarget) {
      markChatRead(chats.find(c => c.foodId === chatTarget.id && c.participants.includes(user.id))?.id || '')
    }
    setChatTarget(null)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🏪 폐기식품 나눔</h1>
        <div className="flex gap-2">
          {myChats.length > 0 && (
            <button
              onClick={() => setShowChatList(true)}
              className="bg-blue-500 text-white text-sm px-3 py-2 rounded-full relative"
            >
              💬 채팅
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white text-sm px-4 py-2 rounded-full"
          >
            + 나눔 등록
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
        <p className="text-xs text-gray-500 mb-1">내 포인트</p>
        <p className="text-2xl font-bold text-orange-600">{user.points}P</p>
      </div>

      {myActive.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">내 나눔</h2>
          <div className="space-y-2">
            {myActive.map(food => (
              <div key={food.id} className="bg-white rounded-xl border p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{food.productName}</p>
                  <p className="text-xs text-gray-400">
                    {food.price}P · {food.expirationDate ? `~${food.expirationDate}` : ''} · {food.status === 'available' ? '판매중' : '거래완료'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${food.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {food.status === 'available' ? '판매중' : '거래완료'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myExpired.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-2">만료됨</h2>
          <div className="space-y-2 opacity-50">
            {myExpired.map(food => (
              <div key={food.id} className="bg-white rounded-xl border p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{food.productName}</p>
                  <p className="text-xs text-gray-400">{food.expirationDate}까지</p>
                </div>
                <span className="text-xs text-gray-400 ml-2">만료</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-600">나눔 목록 ({available.length}개)</h2>

      {available.length === 0 && (
        <div className="text-center text-gray-400 py-16 text-sm">
          현재 나눔 중인 상품이 없습니다<br />
          유통기한 임박 상품을 등록해보세요!
        </div>
      )}

      <div className="space-y-3">
        {available.map(food => (
          <FoodCard key={food.id} food={food} onChat={handleChat} onBuy={handleBuyStart} />
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
      {buyTarget && <PurchaseModal food={buyTarget} onClose={handleBuyClose} onChatStart={handleChatStartAfterBuy} />}
      {chatTarget && <ChatRoom food={chatTarget} onClose={handleChatRoomClose} />}
      {showChatList && <ChatList onSelect={handleChat} onClose={() => setShowChatList(false)} />}
    </div>
  )
}
