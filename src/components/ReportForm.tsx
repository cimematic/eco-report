'use client'

import { useState, useCallback } from 'react'
import { useApp } from '@/lib/store'
import type { ReportType } from '@/lib/types'
import ImageUpload from './ImageUpload'
import AddressSearch from './AddressSearch'

interface Props {
  lat?: number | null
  lng?: number | null
  initialAddress?: string
  onClose: () => void
}

const types: { value: ReportType; label: string; icon: string }[] = [
  { value: 'trash', label: '쓰레기 무단투기', icon: '🗑️' },
  { value: 'blindspot', label: '사각지대', icon: '⚠️' },
]

export default function ReportForm({ lat, lng, initialAddress, onClose }: Props) {
  const { addReport, user } = useApp()
  const [type, setType] = useState<ReportType>('trash')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [address, setAddress] = useState(initialAddress || '')
  const [step, setStep] = useState<'location' | 'form'>(
    lat && lng ? 'form' : 'location'
  )
  const [submitting, setSubmitting] = useState(false)

  if (!user) return null

  const handleSubmit = async () => {
    if (!lat || !lng) return
    if (!address.trim()) return alert('주소를 입력해주세요')
    if (!photoUrl) return alert('사진을 촬영 또는 업로드해주세요')
    setSubmitting(true)
    await addReport({
      type,
      lat,
      lng,
      address: address.trim(),
      photoUrl,
      description: description || undefined,
      status: 'open',
    })
    setSubmitting(false)
    onClose()
  }

  const handleAddressSelect = useCallback((addr: string) => {
    setAddress(addr)
  }, [])

  const canSubmit = address.trim() && photoUrl && !submitting

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">제보하기</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        {step === 'location' && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">지도에서 위치를 클릭해주세요</p>
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(pos => {
                  onClose()
                }, () => {
                  alert('위치 권한이 필요합니다')
                })
              }}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl"
            >
              현재 위치 사용하기
            </button>
          </div>
        )}

        {step === 'form' && (
          <>
            <div className="flex gap-2 mb-4">
              {types.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition ${
                    type === t.value
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <AddressSearch onSelect={handleAddressSelect} placeholder="주소 검색 (전세계)" initialValue={initialAddress} />

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="설명 (선택)"
              rows={3}
              className="w-full border rounded-lg px-4 py-3 mb-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            />

            <div className="mb-1">
              <p className="text-xs text-red-500 mb-1">* 사진은 필수입니다</p>
              <ImageUpload onImage={url => setPhotoUrl(url)} currentUrl={photoUrl} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium disabled:opacity-40"
            >
              {submitting ? '제보 중...' : '제보하기 (+10P)'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
