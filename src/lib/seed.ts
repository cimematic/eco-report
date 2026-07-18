import { v4 as uuidv4 } from 'uuid'
import type { Report, FoodShare } from './types'

const now = Date.now()
const DAY = 86400000

const nicknames = [
  '수성구환경지킴이', '범어동토끼', '지산동할매', '황금동사는청년',
  '만촌동댕이', '중동러너', '수성구새내기', '범물동피크닉',
  '두산동책방', '파동산책러', '고모동사진사', '수성구민A',
]

const addresses = [
  '대구 수성구 범어동 176-1', '대구 수성구 지산동 1256', '대구 수성구 황금동 789',
  '대구 수성구 중동 345', '대구 수성구 만촌동 567', '대구 수성구 수성동 234',
  '대구 수성구 범물동 890', '대구 수성구 두산동 123', '대구 수성구 파동 456',
  '대구 수성구 상동 678', '대구 수성구 시지동 901', '대구 수성구 노변동 234',
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

const foodTitles = [
  '김치찌개 3인분', '라면 5봉지', '통밀빵 2개',
  '사과 6개', '즉석밥 10개', '생수 1.5L 6팩',
  '케익 1판', '과일바구니', '떡볶이 떡 2kg',
  '콩나물 2봉', '두부 3모', '요거트 4개',
]

const locations: { lat: number; lng: number }[] = [
  { lat: 35.855, lng: 128.615 }, { lat: 35.862, lng: 128.608 }, { lat: 35.848, lng: 128.622 },
  { lat: 35.870, lng: 128.605 }, { lat: 35.858, lng: 128.598 }, { lat: 35.865, lng: 128.612 },
  { lat: 35.875, lng: 128.620 }, { lat: 35.850, lng: 128.630 }, { lat: 35.860, lng: 128.590 },
  { lat: 35.880, lng: 128.600 }, { lat: 35.845, lng: 128.625 }, { lat: 35.868, lng: 128.595 },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateSeedData(): { reports: Report[]; foodShares: FoodShare[] } {
  const reports: Report[] = []
  const foodShares: FoodShare[] = []

  const seedNicknames = [...nicknames]

  for (let i = 0; i < 20; i++) {
    const isTrash = i < 12
    const daysAgo = Math.floor(Math.random() * 7)
    const loc = locations[i % locations.length]
    const nickname = seedNicknames[i % seedNicknames.length]

    reports.push({
      id: `seed-report-${i}`,
      userId: `seed-user-${i % 6}`,
      nickname,
      type: isTrash ? 'trash' : 'blindspot',
      lat: loc.lat + (Math.random() - 0.5) * 0.008,
      lng: loc.lng + (Math.random() - 0.5) * 0.008,
      address: addresses[i % addresses.length],
      photoUrl: '',
      description: isTrash
        ? trashDescriptions[i % trashDescriptions.length]
        : blindspotDescriptions[i % blindspotDescriptions.length],
      status: i < 3 ? 'resolved' : 'open',
      severity: Math.floor(Math.random() * 3) + 1,
      createdAt: now - daysAgo * DAY - Math.floor(Math.random() * 3600000),
    } as any)

    if (i < 8) {
      foodShares.push({
        id: `seed-food-${i}`,
        userId: `seed-user-${(i + 3) % 6}`,
        nickname: seedNicknames[(i + 3) % seedNicknames.length],
        title: foodTitles[i % foodTitles.length],
        description: '냉장고 정리 중 나눔합니다. 직접 픽업 가능하신 분 연락주세요.',
        photoUrl: '',
        price: 10 + i * 5,
        lat: locations[i % locations.length].lat + (Math.random() - 0.5) * 0.005,
        lng: locations[i % locations.length].lng + (Math.random() - 0.5) * 0.005,
        address: addresses[i % addresses.length],
        status: i < 2 ? 'sold' : 'available',
        buyerId: i < 2 ? `seed-buyer-${i}` : undefined,
        createdAt: now - daysAgo * DAY - Math.floor(Math.random() * 7200000),
      })
    }
  }

  return { reports, foodShares }
}
