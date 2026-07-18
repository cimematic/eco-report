'use client'

import { useMemo } from 'react'
import { useApp } from '@/lib/store'
import { FoodShare } from '@/lib/types'

interface Props {
  onSelect: (food: FoodShare) => void
  onClose: () => void
}

function isUnread(chat: { lastMessageAt?: number; lastReadBySeller?: number; lastReadByBuyer?: number }, userId: string, sellerId: string): boolean {
  if (!chat.lastMessageAt) return false
  const lastRead = userId === sellerId ? chat.lastReadBySeller : chat.lastReadByBuyer
  return !lastRead || chat.lastMessageAt > lastRead
}

export default function ChatList({ onSelect, onClose }: Props) {
  const { user, chats, foodShares } = useApp()

  if (!user) return null

  const myChats = chats
    .filter(c => c.participants.includes(user.id))
    .sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt))

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">💬 내 채팅</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {myChats.length === 0 && (
            <div className="text-center text-gray-400 py-16 text-sm">
              채팅방이 없습니다<br />
              나눔 상품에서 채팅을 시작해보세요!
            </div>
          )}

          {myChats.map(chat => {
            const food = foodShares.find(f => f.id === chat.foodId)
            const otherNickname = user.id === chat.sellerId ? chat.buyerNickname : chat.sellerNickname
            const unread = isUnread(chat, user.id, chat.sellerId)
            return (
              <button
                key={chat.id}
                onClick={() => {
                  if (food) {
                    onSelect(food)
                    onClose()
                  }
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0 relative">
                  🏪
                  {unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unread ? 'font-bold' : 'font-medium'}`}>{chat.foodProductName}</p>
                    {chat.lastMessageAt && (
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {new Date(chat.lastMessageAt).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${unread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{otherNickname}</p>
                  {chat.lastMessage && (
                    <p className={`text-xs truncate mt-0.5 ${unread ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
