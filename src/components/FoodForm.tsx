'use client'

import { useState, useCallback } from 'react'
import { useApp } from '@/lib/store'
import ImageUpload from './ImageUpload'
import AddressSearch from './AddressSearch'

interface Props {
  lat?: number | null
  lng?: number | null
  onClose: () => void
}

const brands = ['GS25', 'CU', '7-Eleven', 'Emart24', 'Ministop', '기타']
const storageOptions = ['상온', '냉장', '냉동']

export default function FoodForm({ lat, lng, onClose }: Props) {
  const { addFoodShare, user } = useApp()

  const [productName, setProductName] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState(10)
  const [photoUrl, setPhotoUrl] = useState('')
  const [storeBrand, setStoreBrand] = useState('')
  const [originalPrice, setOriginalPrice] = useState(0)
  const [allergens, setAllergens] = useState('')
  const [storageMethod, setStorageMethod] = useState('')
  const [pickupDeadline, setPickupDeadline] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user) return null

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 10)

  const canSubmit = productName.trim() && expirationDate && address.trim() && !submitting

  const handleSubmit = async () => {
    if (!canSubmit || !lat || !lng) return
    setSubmitting(true)
    await addFoodShare({
      productName: productName.trim(),
      expirationDate,
      address: address.trim(),
      lat,
      lng,
      price,
      photoUrl: photoUrl || undefined,
      storeBrand: storeBrand || undefined,
      originalPrice: originalPrice > 0 ? originalPrice : undefined,
      allergens: allergens.trim() || undefined,
      storageMethod: storageMethod || undefined,
      pickupDeadline: pickupDeadline || undefined,
      description: description.trim() || undefined,
    })
    setSubmitting(false)
    onClose()
  }

  const handleAddressSelect = useCallback((addr: string) => {
    setAddress(addr)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">🏪 폐기식품 나눔 등록</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <p className="text-xs text-red-500 mb-4">* 표시는 필수 입력 항목입니다</p>

        <input
          value={productName}
          onChange={e => setProductName(e.target.value)}
          placeholder="* 제품명 (예: 삼각김밥 참치마요)"
          className="w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">* 소비기한 / 유통기한</label>
          <input
            type="date"
            value={expirationDate}
            min={minDate}
            onChange={e => setExpirationDate(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">* 수령 장소 (편의점 주소)</label>
          <AddressSearch onSelect={handleAddressSelect} placeholder="* 편의점 주소 검색" />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">편의점 브랜드 (선택)</label>
          <div className="flex flex-wrap gap-1.5">
            {brands.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setStoreBrand(storeBrand === b ? '' : b)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  storeBrand === b
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-xs text-gray-500 shrink-0">정가 (선택)</label>
          <input
            type="number"
            min={0}
            value={originalPrice || ''}
            onChange={e => setOriginalPrice(Number(e.target.value))}
            placeholder="예: 4500"
            className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <span className="text-xs text-gray-400 shrink-0">원</span>
        </div>

        <input
          value={allergens}
          onChange={e => setAllergens(e.target.value)}
          placeholder="알레르기 유발물질 (선택) 예: 우유, 대두, 밀"
          className="w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">보관 방법 (선택)</label>
          <div className="flex gap-1.5">
            {storageOptions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStorageMethod(storageMethod === s ? '' : s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  storageMethod === s
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">픽업 마감 시간 (선택)</label>
          <input
            type="time"
            value={pickupDeadline}
            onChange={e => setPickupDeadline(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="추가 설명 (선택)"
          rows={2}
          className="w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
        />

        <ImageUpload onImage={url => setPhotoUrl(url)} currentUrl={photoUrl} />

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-600">판매 포인트</span>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            className="flex-1 accent-emerald-600"
          />
          <span className="text-sm font-bold text-emerald-600 min-w-[3rem] text-right">{price}P</span>
        </div>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium disabled:opacity-40"
        >
          {submitting ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  )
}
