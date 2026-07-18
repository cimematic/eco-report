export type ReportType = 'trash' | 'blindspot' | 'food'

export type ReportStatus = 'open' | 'resolved'

export interface Report {
  id: string
  userId: string
  nickname: string
  type: ReportType
  lat: number
  lng: number
  address: string
  photoUrl?: string
  description?: string
  status: ReportStatus
  severity?: number
  aiTags?: string[]
  createdAt: number
}

export interface FoodShare {
  id: string
  userId: string
  nickname: string
  title: string
  description: string
  photoUrl?: string
  price: number
  lat: number
  lng: number
  address: string
  status: 'available' | 'sold'
  buyerId?: string
  createdAt: number
}

export interface User {
  id: string
  nickname: string
  points: number
  avatar?: string
  pinHash?: string
  createdAt: number
}

export interface Transaction {
  id: string
  foodId: string
  sellerId: string
  buyerId: string
  points: number
  status: 'pending' | 'completed'
  createdAt: number
}

export interface Briefing {
  date: string
  summary: string
  trashCount: number
  blindspotCount: number
  foodCount: number
  topReporter?: string
  hotDistrict?: string
  tips?: string
  createdAt: number
}
