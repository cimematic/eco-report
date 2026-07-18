'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

interface Props {
  onSelect: (address: string) => void
  placeholder?: string
  initialValue?: string
}

export default function AddressSearch({ onSelect, placeholder = '주소 검색 (전세계)', initialValue }: Props) {
  const [query, setQuery] = useState(initialValue || '')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(initialValue || '')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=ko`
      )
      const data: NominatimResult[] = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    setSelected('')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(value), 300)
  }

  const handleSelect = (r: NominatimResult) => {
    setSelected(r.display_name)
    setQuery(r.display_name)
    setOpen(false)
    onSelect(r.display_name)
  }

  return (
    <div ref={containerRef} className="relative mb-3">
      <input
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
      />

      {loading && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 p-3 text-sm text-gray-400 shadow-lg z-10">
          검색 중...
        </div>
      )}

      {open && !loading && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 border-b last:border-b-0"
            >
              <span className="text-gray-800">{r.display_name.split(',')[0]}</span>
              <span className="text-gray-400 text-xs block truncate">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {!open && selected && (
        <p className="text-xs text-emerald-600 mt-1">✓ {selected.split(',')[0]}</p>
      )}
    </div>
  )
}
