'use client'

import { useState, useCallback } from 'react'
import { useApp } from '@/lib/store'
import ImageUpload from './ImageUpload'

interface Props {
  lat?: number | null
  lng?: number | null
  onClose: () => void
}

function openPostcode(onSelect: (addr: string) => void) {
  if (typeof window === 'undefined') return
  const win = window as any
  if (!win.daum) {
    const script = document.createElement('script')
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.onload = () => {
      new win.daum.Postcode({ oncomplete: (d: any) => onSelect(d.address) }).open()
    }
    document.head.appendChild(script)
  } else {
    new win.daum.Postcode({ oncomplete: (d: any) => onSelect(d.address) }).open()
  }
}

export default function FoodForm({ lat, lng, onClose }: Props) {
  const { addFoodShare, user } = useApp()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(10)
  const [photoUrl, setPhotoUrl] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user) return null

  const handleSubmit = async () => {
    if (!title.trim() || !lat || !lng) return
    if (!address.trim()) return alert('주소를 선택해주세요')
    setSubmitting(true)
    await addFoodShare({
      title: title.trim(),
      description: description || undefined,
      price,
      photoUrl: photoUrl || undefined,
      lat,
      lng,
      address: address.trim(),
    } as any)
    setSubmitting(false)
    onClose()
  }

  const handleAddressSearch = useCallback(() => {
    openPostcode(addr => setAddress(addr))
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">🍲 음식 나눔 등록</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="음식 이름 (예: 김치찌개 3인분)"
          className="w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
        />

        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="설명 (재료, 유통기한 등)"
          rows={3}
          className="w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
        />

        <div className="mb-3">
          <div className="flex gap-2">
            <div className="flex-1 border rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-700 truncate">
              {address || '주소를 검색해주세요'}
            </div>
            <button
              type="button"
              onClick={handleAddressSearch}
              className="bg-emerald-600 text-white px-4 rounded-lg text-sm font-medium shrink-0"
            >
              주소 검색
            </button>
          </div>
        </div>

        <ImageUpload onImage={url => setPhotoUrl(url)} currentUrl={photoUrl} />

        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-gray-600">포인트</span>
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
          disabled={!title.trim() || !address.trim() || submitting}
          onClick={handleSubmit}
          className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium disabled:opacity-40"
        >
          {submitting ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  )
}
