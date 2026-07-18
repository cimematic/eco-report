'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { User, Report, FoodShare } from './types'
import { generateSeedData } from './seed'
import { useToast } from '@/components/Toast'

interface AppState {
  user: User | null
  reports: Report[]
  foodShares: FoodShare[]
  isLoading: boolean
}

interface AppContextType extends AppState {
  login: (nickname: string) => void
  logout: () => void
  addReport: (report: Omit<Report, 'id' | 'userId' | 'nickname' | 'createdAt'>) => void
  addFoodShare: (food: Omit<FoodShare, 'id' | 'userId' | 'nickname' | 'createdAt' | 'status'>) => void
  buyFood: (foodId: string) => boolean
  addPoints: (amount: number) => void
}

const AppContext = createContext<AppContextType | null>(null)

const STORAGE_KEY = 'eco-report-state'

function loadState(): Partial<AppState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { }
  return {}
}

function saveState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [foodShares, setFoodShares] = useState<FoodShare[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = loadState()
    const hasSeed = localStorage.getItem('eco-report-seeded')

    if (!hasSeed) {
      const seed = generateSeedData()
      saved.reports = seed.reports
      saved.foodShares = seed.foodShares
      localStorage.setItem('eco-report-seeded', 'true')
    }

    if (saved.user) setUser(saved.user)
    if (saved.reports) setReports(saved.reports)
    if (saved.foodShares) setFoodShares(saved.foodShares)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      saveState({ user, reports, foodShares })
    }
  }, [user, reports, foodShares, isLoading])

  const login = (nickname: string) => {
    const newUser: User = {
      id: uuidv4(),
      nickname,
      points: 100,
      createdAt: Date.now(),
    }
    setUser(newUser)
  }

  const logout = () => {
    setUser(null)
  }

  const addReport = (input: Omit<Report, 'id' | 'userId' | 'nickname' | 'createdAt'>) => {
    if (!user) return
    const report: Report = {
      ...input,
      id: uuidv4(),
      userId: user.id,
      nickname: user.nickname,
      createdAt: Date.now(),
    }
    setReports(prev => [report, ...prev])
    setUser(prev => prev ? { ...prev, points: prev.points + 10 } : prev)
    toast('제보 완료! +10P', '📸')
  }

  const addFoodShare = (input: Omit<FoodShare, 'id' | 'userId' | 'nickname' | 'createdAt' | 'status'>) => {
    if (!user) return
    const food: FoodShare = {
      ...input,
      id: uuidv4(),
      userId: user.id,
      nickname: user.nickname,
      status: 'available',
      createdAt: Date.now(),
    }
    setFoodShares(prev => [food, ...prev])
    toast('나눔 등록 완료!', '🍲')
  }

  const buyFood = (foodId: string): boolean => {
    if (!user) return false
    const food = foodShares.find(f => f.id === foodId)
    if (!food || food.status !== 'available') return false
    if (user.points < food.price) return false

    setUser(prev => prev ? { ...prev, points: prev.points - food.price } : prev)
    setFoodShares(prev => prev.map(f =>
      f.id === foodId ? { ...f, status: 'sold' as const, buyerId: user.id } : f
    ))
    toast(`${food.title} 구매 완료!`, '🎉')
    return true
  }

  const addPoints = (amount: number) => {
    setUser(prev => prev ? { ...prev, points: prev.points + amount } : prev)
  }

  return (
    <AppContext.Provider value={{
      user, reports, foodShares, isLoading,
      login, logout, addReport, addFoodShare, buyFood, addPoints,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
