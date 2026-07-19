'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { User, Report, FoodShare, Chat } from './types'
import { useToast } from '@/components/Toast'
import { restGetDocs, restAddDoc, restUpdateDoc, restDeleteDoc, hasFirebaseKeys } from './firebase'

interface AppState {
  user: User | null
  reports: Report[]
  foodShares: FoodShare[]
  chats: Chat[]
  isLoading: boolean
  isFirebaseReady: boolean
}

interface AppContextType extends AppState {
  login: (nickname: string, pin: string) => void
  logout: () => void
  addReport: (report: Omit<Report, 'id' | 'userId' | 'nickname' | 'createdAt'>) => Promise<void>
  addFoodShare: (food: Omit<FoodShare, 'id' | 'userId' | 'nickname' | 'createdAt' | 'status'>) => Promise<void>
  buyFood: (foodId: string) => Promise<boolean>
  addPoints: (amount: number) => void
  deleteReport: (id: string) => Promise<void>
  deleteFoodShare: (id: string) => Promise<void>
  toggleReportStatus: (id: string) => Promise<void>
  createChat: (foodId: string, sellerId: string, sellerNickname: string, foodProductName: string) => Promise<string>
  sendMessage: (chatId: string, text: string) => Promise<void>
  markChatRead: (chatId: string) => Promise<void>
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)
const SESSION_KEY = 'eco-report-user'
const AUTH_KEY = 'eco-report-auth'

function loadUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch { }
  return null
}

function saveUser(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    saveAuthUser(user)
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

function loadAuth(): Record<string, User> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '{}')
  } catch { return {} }
}

function saveAuth(auth: Record<string, User>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

function saveAuthUser(user: User) {
  const auth = loadAuth()
  auth[user.nickname] = { ...auth[user.nickname], ...user }
  saveAuth(auth)
}

function hashPin(pin: string): string {
  return btoa(pin)
}

function findAuthUser(nickname: string): User | undefined {
  const auth = loadAuth()
  return auth[nickname]
}

function cleanData(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key] = value
    }
  }
  return result
}

export function AppProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [foodShares, setFoodShares] = useState<FoodShare[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const refreshInProgress = useRef(false)

  const refreshData = useCallback(async () => {
    if (refreshInProgress.current) return
    refreshInProgress.current = true
    try {
      const [rawReports, rawFoodShares, rawChats] = await Promise.all([
        restGetDocs('reports', { orderBy: 'createdAt', desc: true, limit: 200 }),
        restGetDocs('foodShares', { orderBy: 'createdAt', desc: true, limit: 100 }),
        restGetDocs('chats', { orderBy: 'createdAt', desc: true, limit: 50 }),
      ])
      setReports(rawReports as Report[])
      setFoodShares(rawFoodShares as FoodShare[])
      setChats(rawChats.map((c: any) => ({
        ...c,
        lastMessageAt: c.lastMessageAt || undefined,
        lastReadBySeller: c.lastReadBySeller || undefined,
        lastReadByBuyer: c.lastReadByBuyer || undefined,
      })) as Chat[])
      setIsFirebaseReady(true)
    } catch (e) {
      console.error('restGetDocs error:', e)
    } finally {
      refreshInProgress.current = false
    }
  }, [])

  useEffect(() => {
    const saved = loadUser()
    if (saved) setUser(saved)
    setIsLoading(false)

    if (hasFirebaseKeys) {
      refreshData()
      pollRef.current = setInterval(refreshData, 30000)
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refreshData])

  useEffect(() => {
    saveUser(user)
  }, [user])

  const login = (nickname: string, pin: string) => {
    const existing = findAuthUser(nickname)
    const hashed = hashPin(pin)

    if (existing) {
      if (existing.pinHash !== hashed) {
        throw new Error('PIN이 일치하지 않습니다')
      }
      setUser({ ...existing })
    } else {
      const newUser: User = {
        id: uuidv4(),
        nickname,
        points: 100,
        pinHash: hashed,
        createdAt: Date.now(),
      }
      setUser(newUser)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const addReport = async (input: Omit<Report, 'id' | 'userId' | 'nickname' | 'createdAt'>) => {
    if (!user) return
    const raw = {
      ...input,
      userId: user.id,
      nickname: user.nickname,
      createdAt: new Date().toISOString(),
    }
    const data = cleanData(raw)
    try {
      await restAddDoc('reports', data)
      setUser(prev => prev ? { ...prev, points: prev.points + 10 } : prev)
      toast('제보 완료! +10P', '📸')
      refreshData()
    } catch (e: any) {
      console.error('Failed to add report:', e)
      toast(`제보 실패: ${e?.message || '알 수 없는 오류'}`, '❌')
    }
  }

  const addFoodShare = async (input: Omit<FoodShare, 'id' | 'userId' | 'nickname' | 'createdAt' | 'status'>) => {
    if (!user) return
    const raw = {
      ...input,
      userId: user.id,
      nickname: user.nickname,
      status: 'available',
      createdAt: new Date().toISOString(),
    }
    const data = cleanData(raw)
    try {
      await restAddDoc('foodShares', data)
      toast('나눔 등록 완료!', '🍲')
      refreshData()
    } catch (e: any) {
      console.error('Failed to add food share:', e)
      toast(`등록 실패: ${e?.message || '알 수 없는 오류'}`, '❌')
    }
  }

  const buyFood = async (foodId: string): Promise<boolean> => {
    if (!user) return false
    const food = foodShares.find(f => f.id === foodId)
    if (!food || food.status !== 'available') return false
    if (user.points < food.price) return false

    try {
      await restUpdateDoc('foodShares', foodId, { status: 'sold', buyerId: user.id })
      setUser(prev => prev ? { ...prev, points: prev.points - food.price } : prev)
      toast(`${food.productName} 구매 완료!`, '🎉')
      refreshData()
      return true
    } catch (e: any) {
      console.error('Failed to buy food:', e)
      toast(`구매 실패: ${e?.message || '알 수 없는 오류'}`, '❌')
      return false
    }
  }

  const addPoints = (amount: number) => {
    setUser(prev => prev ? { ...prev, points: prev.points + amount } : prev)
  }

  const deleteReport = async (id: string) => {
    try {
      await restDeleteDoc('reports', id)
      refreshData()
    } catch (e) {
      console.error('Failed to delete report:', e)
    }
  }

  const deleteFoodShare = async (id: string) => {
    try {
      await restDeleteDoc('foodShares', id)
      refreshData()
    } catch (e) {
      console.error('Failed to delete food share:', e)
    }
  }

  const toggleReportStatus = async (id: string) => {
    if (!user) return
    const report = reports.find(r => r.id === id)
    if (!report) return
    const newStatus = report.status === 'open' ? 'resolved' : 'open'
    try {
      await restUpdateDoc('reports', id, { status: newStatus })
      refreshData()
    } catch (e) {
      console.error('Failed to toggle report status:', e)
    }
  }

  const createChat = async (foodId: string, sellerId: string, sellerNickname: string, foodProductName: string): Promise<string> => {
    if (!user) return ''
    const existing = chats.find(c => c.foodId === foodId && c.buyerId === user.id)
    if (existing) return existing.id
    try {
      const chatId = await restAddDoc('chats', {
        foodId,
        foodProductName,
        sellerId,
        sellerNickname,
        buyerId: user.id,
        buyerNickname: user.nickname,
        participants: [sellerId, user.id],
        createdAt: new Date().toISOString(),
      })
      toast('채팅방이 개설되었습니다', '💬')
      refreshData()
      return chatId
    } catch (e) {
      console.error('Failed to create chat:', e)
      toast('채팅방 개설 실패', '❌')
      return ''
    }
  }

  const sendMessage = async (chatId: string, text: string) => {
    if (!user || !text.trim()) return
    try {
      const ts = new Date().toISOString()
      await restAddDoc(`chats/${chatId}/messages`, {
        senderId: user.id,
        text: text.trim(),
        createdAt: ts,
      })
      await restUpdateDoc('chats', chatId, {
        lastMessage: text.trim(),
        lastMessageAt: ts,
      })
      refreshData()
    } catch (e) {
      console.error('Failed to send message:', e)
      toast('메시지 전송 실패', '❌')
    }
  }

  const markChatRead = async (chatId: string) => {
    if (!user) return
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return
    const field = user.id === chat.sellerId ? 'lastReadBySeller' : 'lastReadByBuyer'
    try {
      await restUpdateDoc('chats', chatId, { [field]: new Date().toISOString() })
    } catch (e) {
      console.error('Failed to mark chat read:', e)
    }
  }

  return (
    <AppContext.Provider value={{
      user, reports, foodShares, chats, isLoading, isFirebaseReady,
      login, logout, addReport, addFoodShare, buyFood, addPoints,
      deleteReport, deleteFoodShare, toggleReportStatus,
      createChat, sendMessage, markChatRead, refreshData,
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
