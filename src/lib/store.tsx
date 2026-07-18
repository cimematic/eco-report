'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { User, Report, FoodShare, Chat, ChatMessage } from './types'
import { useToast } from '@/components/Toast'
import { db } from './firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  Timestamp,
  limit,
  where,
} from 'firebase/firestore'
import { generateSeedData } from './seed'

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

function toDate(ts: any): number {
  if (ts?.toMillis) return ts.toMillis()
  if (typeof ts === 'number') return ts
  return 0
}

export function AppProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [foodShares, setFoodShares] = useState<FoodShare[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)

  useEffect(() => {
    const saved = loadUser()
    if (saved) setUser(saved)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    saveUser(user)
  }, [user])

  useEffect(() => {
    if (!db) {
      setIsFirebaseReady(false)
      return
    }
    setIsFirebaseReady(true)

    let seeded = false

    const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(200))
    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const list: Report[] = snapshot.docs.map(d => {
        const d2 = d.data() as any
        return { ...d2, id: d.id, createdAt: toDate(d2.createdAt) } as Report
      })
      setReports(list)

      if (!seeded && list.length === 0) {
        seeded = true
        const seed = generateSeedData()
        seed.reports.forEach(r => {
          addDoc(collection(db!, 'reports'), { ...r, createdAt: Timestamp.now() })
        })
        seed.foodShares.forEach(f => {
          addDoc(collection(db!, 'foodShares'), { ...f, createdAt: Timestamp.now() })
        })
      }
    }, (err) => {
      console.error('Firestore reports error:', err)
    })

    const foodQuery = query(collection(db, 'foodShares'), orderBy('createdAt', 'desc'), limit(100))
    const unsubFood = onSnapshot(foodQuery, (snapshot) => {
      const list: FoodShare[] = snapshot.docs.map(d => {
        const d2 = d.data() as any
        return { ...d2, id: d.id, createdAt: toDate(d2.createdAt) } as FoodShare
      })
      setFoodShares(list)
    }, (err) => {
      console.error('Firestore foodShares error:', err)
    })

    const chatsQuery = query(collection(db, 'chats'), orderBy('createdAt', 'desc'), limit(50))
    const unsubChats = onSnapshot(chatsQuery, (snapshot) => {
      const list: Chat[] = snapshot.docs.map(d => {
        const d2 = d.data() as any
        return { ...d2, id: d.id, createdAt: toDate(d2.createdAt), lastMessageAt: toDate(d2.lastMessageAt), lastReadBySeller: d2.lastReadBySeller != null ? toDate(d2.lastReadBySeller) : undefined, lastReadByBuyer: d2.lastReadByBuyer != null ? toDate(d2.lastReadByBuyer) : undefined } as Chat
      })
      setChats(list)
    }, (err) => {
      console.error('Firestore chats error:', err)
    })

    return () => { unsubReports(); unsubFood(); unsubChats() }
  }, [])

  const login = (nickname: string, pin: string) => {
    const existing = findAuthUser(nickname)
    const hashed = hashPin(pin)

    if (existing) {
      if (existing.pinHash !== hashed) {
        throw new Error('PIN이 일치하지 않습니다')
      }
      const restored: User = {
        ...existing,
      }
      setUser(restored)
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
      createdAt: Timestamp.now(),
    }
    const data = cleanData(raw)
    if (db && isFirebaseReady) {
      try {
        await addDoc(collection(db, 'reports'), data)
        setUser(prev => prev ? { ...prev, points: prev.points + 10 } : prev)
        toast('제보 완료! +10P', '📸')
      } catch (e: any) {
        console.error('Failed to add report:', e)
        toast(`제보 실패: ${e?.message || '알 수 없는 오류'}`, '❌')
      }
    } else {
      toast('Firebase가 연결되지 않았습니다. 환경 변수를 확인해주세요.', '⚠️')
    }
  }

  const addFoodShare = async (input: Omit<FoodShare, 'id' | 'userId' | 'nickname' | 'createdAt' | 'status'>) => {
    if (!user) return
    const raw = {
      ...input,
      userId: user.id,
      nickname: user.nickname,
      status: 'available',
      createdAt: Timestamp.now(),
    }
    const data = cleanData(raw)
    if (db && isFirebaseReady) {
      try {
        await addDoc(collection(db, 'foodShares'), data)
        toast('나눔 등록 완료!', '🍲')
      } catch (e) {
        console.error('Failed to add food share:', e)
        toast('등록 실패. 다시 시도해주세요.', '❌')
      }
    } else {
      toast('Firebase가 연결되지 않았습니다.', '⚠️')
    }
  }

  const buyFood = async (foodId: string): Promise<boolean> => {
    if (!user) return false
    const food = foodShares.find(f => f.id === foodId)
    if (!food || food.status !== 'available') return false
    if (user.points < food.price) return false

    if (db && isFirebaseReady) {
      try {
        await updateDoc(doc(db, 'foodShares', foodId), {
          status: 'sold',
          buyerId: user.id,
        })
        setUser(prev => prev ? { ...prev, points: prev.points - food.price } : prev)
        toast(`${food.productName} 구매 완료!`, '🎉')
        return true
      } catch (e) {
        console.error('Failed to buy food:', e)
        toast('구매 실패. 다시 시도해주세요.', '❌')
        return false
      }
    } else {
      toast('Firebase가 연결되지 않았습니다.', '⚠️')
      return false
    }
  }

  const addPoints = (amount: number) => {
    setUser(prev => prev ? { ...prev, points: prev.points + amount } : prev)
  }

  const deleteReport = async (id: string) => {
    if (!db || !isFirebaseReady) return
    try {
      await deleteDoc(doc(db, 'reports', id))
    } catch (e) {
      console.error('Failed to delete report:', e)
    }
  }

  const deleteFoodShare = async (id: string) => {
    if (!db || !isFirebaseReady) return
    try {
      await deleteDoc(doc(db, 'foodShares', id))
    } catch (e) {
      console.error('Failed to delete food share:', e)
    }
  }

  const toggleReportStatus = async (id: string) => {
    if (!user || !db || !isFirebaseReady) return
    const report = reports.find(r => r.id === id)
    if (!report) return
    const newStatus = report.status === 'open' ? 'resolved' : 'open'
    try {
      await updateDoc(doc(db, 'reports', id), { status: newStatus })
    } catch (e) {
      console.error('Failed to toggle report status:', e)
    }
  }

  const createChat = async (foodId: string, sellerId: string, sellerNickname: string, foodProductName: string): Promise<string> => {
    if (!user || !db || !isFirebaseReady) return ''
    const existing = chats.find(c => c.foodId === foodId && c.buyerId === user.id)
    if (existing) return existing.id
    try {
      const ref = await addDoc(collection(db, 'chats'), {
        foodId,
        foodProductName,
        sellerId,
        sellerNickname,
        buyerId: user.id,
        buyerNickname: user.nickname,
        participants: [sellerId, user.id],
        createdAt: Timestamp.now(),
      })
      toast('채팅방이 개설되었습니다', '💬')
      return ref.id
    } catch (e) {
      console.error('Failed to create chat:', e)
      toast('채팅방 개설 실패', '❌')
      return ''
    }
  }

  const sendMessage = async (chatId: string, text: string) => {
    if (!user || !db || !isFirebaseReady || !text.trim()) return
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.id,
        text: text.trim(),
        createdAt: Timestamp.now(),
      })
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text.trim(),
        lastMessageAt: Timestamp.now(),
      })
    } catch (e) {
      console.error('Failed to send message:', e)
      toast('메시지 전송 실패', '❌')
    }
  }

  const markChatRead = async (chatId: string) => {
    if (!user || !db || !isFirebaseReady) return
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return
    const field = user.id === chat.sellerId ? 'lastReadBySeller' : 'lastReadByBuyer'
    try {
      await updateDoc(doc(db, 'chats', chatId), { [field]: Timestamp.now() })
    } catch (e) {
      console.error('Failed to mark chat read:', e)
    }
  }

  return (
    <AppContext.Provider value={{
      user, reports, foodShares, chats, isLoading, isFirebaseReady,
      login, logout, addReport, addFoodShare, buyFood, addPoints, deleteReport, deleteFoodShare,
      toggleReportStatus, createChat, sendMessage, markChatRead,
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
