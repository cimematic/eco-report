'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/lib/store'

const tabs = [
  { href: '/', label: '지도', icon: '🗺️' },
  { href: '/report', label: '제보', icon: '📸' },
  { href: '/food', label: '나눔', icon: '🏪' },
  { href: '/briefing', label: '브리핑', icon: '🤖' },
]

function isUnread(chat: { lastMessageAt?: number; lastReadBySeller?: number; lastReadByBuyer?: number }, userId: string, sellerId: string): boolean {
  if (!chat.lastMessageAt) return false
  const lastRead = userId === sellerId ? chat.lastReadBySeller : chat.lastReadByBuyer
  return !lastRead || chat.lastMessageAt > lastRead
}

export default function Navigation() {
  const path = usePathname()
  const { user, chats } = useApp()

  const unreadCount = user
    ? chats.filter(c => c.participants.includes(user.id) && isUnread(c, user.id, c.sellerId)).length
    : 0

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map(tab => {
          const active = path === tab.href
          const isFood = tab.href === '/food'
          return (
            <Link
              key={tab.href}
              href={user ? tab.href : '#'}
              onClick={e => !user && e.preventDefault()}
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors relative ${
                active ? 'text-emerald-600' : 'text-gray-400'
              } ${!user ? 'opacity-40' : ''}`}
            >
              <span className="text-xl mb-0.5">
                {tab.icon}
                {isFood && unreadCount > 0 && (
                  <span className="absolute top-0.5 right-2 bg-red-500 text-white text-[9px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1 font-bold leading-none">
                    {unreadCount}
                  </span>
                )}
              </span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
