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

export default function Navigation() {
  const path = usePathname()
  const { user } = useApp()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map(tab => {
          const active = path === tab.href
          return (
            <Link
              key={tab.href}
              href={user ? tab.href : '#'}
              onClick={e => !user && e.preventDefault()}
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors ${
                active ? 'text-emerald-600' : 'text-gray-400'
              } ${!user ? 'opacity-40' : ''}`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
