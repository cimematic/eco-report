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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('5MB 이하의 이미지만 업로드 가능합니다')
      return
    }

    setLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreview(result)
      onImage(result)
      setLoading(false)
    }
    reader.readAsDataURL(file)
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
