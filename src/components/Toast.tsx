'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'

interface Toast {
  id: number
  message: string
  icon?: string
}

const ToastContext = createContext<((msg: string, icon?: string) => void) | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, icon?: string) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, icon }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="animate-toast bg-gray-900 text-white px-5 py-3 rounded-full shadow-xl text-sm font-medium flex items-center gap-2"
          >
            {t.icon && <span>{t.icon}</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
