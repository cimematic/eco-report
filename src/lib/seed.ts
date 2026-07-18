import { v4 as uuidv4 } from 'uuid'
import type { Report, FoodShare } from './types'

const now = Date.now()
const DAY = 86400000

const nicknames = [
  '수성구환경지킴이', '범어동토끼', '지산동할매', '황금동사는청년',
  '만촌동댕이', '중동러너', '수성구새내기', '범물동피크닉',
  '두산동책방', '파동산책러', '고모동사진사', '수성구민A',
]

const spots = [
  { address: '대구 수성구 범어동 176-1', lat: 35.855, lng: 128.615 },
  { address: '대구 수성구 지산동 1256', lat: 35.862, lng: 128.608 },
  { address: '대구 수성구 황금동 789', lat: 35.848, lng: 128.622 },
  { address: '대구 수성구 중동 345', lat: 35.870, lng: 128.605 },
  { address: '대구 수성구 만촌동 567', lat: 35.858, lng: 128.598 },
  { address: '대구 수성구 수성동 234', lat: 35.865, lng: 128.612 },
  { address: '대구 수성구 범물동 890', lat: 35.875, lng: 128.620 },
  { address: '대구 수성구 두산동 123', lat: 35.850, lng: 128.630 },
  { address: '대구 수성구 파동 456', lat: 35.860, lng: 128.590 },
  { address: '대구 수성구 상동 678', lat: 35.880, lng: 128.600 },
  { address: '대구 수성구 시지동 901', lat: 35.845, lng: 128.625 },
  { address: '대구 수성구 노변동 234', lat: 35.868, lng: 128.595 },
]

const trashDescriptions = [
  '쓰레기 봉투 5개가 아무렇게나 버려져 있어요', '재활용 쓰레기가 분리수거 안 되고 쌓여있어요',
  '대형 폐기물이 길가에 방치됐어요', '음식물 쓰레기 봉투가 찢어져 있어요',
  '담배꽁초가 길바닥에 수북해요', '플라스틱 병이 공터에 잔뜩 쌓여있어요',
  '스티로폼이 바람에 날려 사방에 흩어져 있어요', '페트병이 하천가에 버려져 있어요',
  '비닐쓰레기가 나뭇가지에 걸려 있어요', '전단지가 길가에 아무렇게나 버려져 있어요',
  '쓰레기봉투가 새들에 의해 찢겨 내용물이 흩어졌어요', '캠핑장 쓰레기 그대로 방치됨',
]

const blindspotDescriptions = [
  '가로등이 고장 나서 밤에 너무 어두워요', '맨홀 뚜껑이 없어 위험해요',
  '인도가 파손되어 보행자가 다칠 위험이 있어요', 'CCTV 사각지대라 밤에 위험해요',
  '횡단보도가 없어서 건너기 위험해요', '건설 자재가 인도에 방치되어 있어요',
  '낡은 전봇대가 쓰러질 것 같아요', '배수로 뚜껑이 파손되었어요',
  '과속 방지턱이 없어 차량이 위험하게 달려요', '가로수가 쓰러질 위험이 있어요',
  '야간 조명이 전혀 없어서 위험해요', '공사장 안전펜스가 없어 위험해요',
]

const foodItems = [
  { productName: '삼각김밥 참치마요', brand: 'GS25', price: 1200, storage: '냉장' },
  { productName: '도시락 제육덮밥', brand: 'CU', price: 4500, storage: '냉장' },
  { productName: '샌드위치 햄치즈', brand: '7-Eleven', price: 3200, storage: '냉장' },
  { productName: '바나나 우유 3팩', brand: 'GS25', price: 2400, storage: '냉장' },
  { productName: '삼각김밥 소불고기', brand: 'CU', price: 1300, storage: '상온' },
  { productName: '즉석밥 �반 210g x3', brand: 'Emart24', price: 3600, storage: '상온' },
  { productName: '요구르트 4입', brand: 'GS25', price: 2000, storage: '냉장' },
  { productName: '컵라면 육개장', brand: 'Ministop', price: 1500, storage: '상온' },
  { productName: '생수 2L 6팩', brand: 'CU', price: 4800, storage: '상온' },
  { productName: '초코파이 6입', brand: '7-Eleven', price: 3000, storage: '상온' },
  { productName: '김밥 야채', brand: 'GS25', price: 2500, storage: '냉장' },
  { productName: '핫바 치즈', brand: 'CU', price: 1500, storage: '상온' },
]

export function generateSeedData(): { reports: Report[]; foodShares: FoodShare[] } {
  const reports: Report[] = []
  const foodShares: FoodShare[] = []

  for (let i = 0; i < 20; i++) {
    const isTrash = i < 12
    const daysAgo = Math.floor(Math.random() * 7)
    const s = spots[i % spots.length]
    const nickname = nicknames[i % nicknames.length]

    reports.push({
      id: `seed-report-${i}`,
      userId: `seed-user-${i % 6}`,
      nickname,
      type: isTrash ? 'trash' : 'blindspot',
      lat: s.lat,
      lng: s.lng,
      address: s.address,
      photoUrl: '',
      description: isTrash
        ? trashDescriptions[i % trashDescriptions.length]
        : blindspotDescriptions[i % blindspotDescriptions.length],
      status: i < 3 ? 'resolved' : 'open',
      severity: Math.floor(Math.random() * 3) + 1,
      createdAt: now - daysAgo * DAY - Math.floor(Math.random() * 3600000),
    })

    if (i < 8) {
      const fs = spots[(i + 1) % spots.length]
      const item = foodItems[i % foodItems.length]
      const daysUntilExp = Math.floor(Math.random() * 3) + 1
      const exp = new Date(now + daysUntilExp * DAY)
      foodShares.push({
        id: `seed-food-${i}`,
        userId: `seed-user-${(i + 3) % 6}`,
        nickname: nicknames[(i + 3) % nicknames.length],
        productName: item.productName,
        expirationDate: exp.toISOString().slice(0, 10),
        address: fs.address,
        lat: fs.lat,
        lng: fs.lng,
        price: 10 + i * 5,
        photoUrl: '',
        storeBrand: item.brand,
        originalPrice: item.price,
        storageMethod: item.storage,
        status: i < 2 ? 'sold' : 'available',
        buyerId: i < 2 ? `seed-buyer-${i}` : undefined,
        createdAt: now - daysAgo * DAY - Math.floor(Math.random() * 7200000),
      })
    }
  }

  return { reports, foodShares }
}
