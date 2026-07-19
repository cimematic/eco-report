'use client'

import { useState, useRef } from 'react'

interface Props {
  onImage: (base64: string) => void
  currentUrl?: string
}

export default function ImageUpload({ onImage, currentUrl }: Props) {
  const [preview, setPreview] = useState(currentUrl || '')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 800
        let w = img.width
        let h = img.height
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하의 이미지만 업로드 가능합니다')
      return
    }

    setLoading(true)
    try {
      const compressed = await compressImage(file)
      setPreview(compressed)
      onImage(compressed)
    } catch (err) {
      alert('이미지 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      {preview ? (
        <div className="relative">
          <img src={preview} alt="미리보기" className="w-full h-40 object-cover rounded-lg" />
          <button
            type="button"
            onClick={() => { setPreview(''); onImage(''); if (inputRef.current) inputRef.current.value = '' }}
            className="absolute top-2 right-2 bg-black/50 text-white w-7 h-7 rounded-full text-sm"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition disabled:opacity-40"
        >
          {loading ? (
            <span className="text-sm">변환 중...</span>
          ) : (
            <>
              <span className="text-2xl mb-1">📷</span>
              <span className="text-sm">사진 찍기 또는 업로드</span>
              <span className="text-xs mt-1">5MB 이하</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
