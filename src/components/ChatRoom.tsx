'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/lib/store'
import { FoodShare } from '@/lib/types'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { ChatMessage } from '@/lib/types'

interface Props {
  food: FoodShare
  onClose: () => void
}

export default function ChatRoom({ food, onClose }: Props) {
  const { user, sendMessage, chats, markChatRead } = useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const chat = chats.find(c => c.foodId === food.id && (c.buyerId === user?.id || c.sellerId === user?.id))
  const chatId = chat?.id

  const otherNickname = user?.id === food.userId ? chat?.buyerNickname : food.nickname

  useEffect(() => {
    if (!chatId || !db) return
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = snapshot.docs.map(d => {
        const d2 = d.data() as any
        return { ...d2, id: d.id, createdAt: d2.createdAt?.toMillis?.() || Date.now() }
      })
      setMessages(list)
    })
    return () => unsub()
  }, [chatId])

  useEffect(() => {
    if (chatId) markChatRead(chatId)
  }, [chatId, markChatRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!chatId || !text.trim()) return
    sendMessage(chatId, text.trim())
    setText('')
  }

  if (!chatId) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center" onClick={e => e.stopPropagation()}>
          <p className="text-gray-500 mb-4">채팅방을 찾을 수 없습니다</p>
          <button onClick={onClose} className="bg-gray-200 text-gray-600 rounded-lg px-4 py-2 text-sm">닫기</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col h-[80vh] sm:h-[600px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm truncate">{food.productName}</h2>
            <p className="text-xs text-gray-400 truncate">{otherNickname}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl ml-3">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => {
            const isMine = msg.senderId === user?.id
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? 'bg-emerald-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="메시지 입력..."
            className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="bg-emerald-600 text-white rounded-full px-4 py-2 text-sm disabled:opacity-40"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
