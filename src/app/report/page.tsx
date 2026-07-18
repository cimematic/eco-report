'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import ReportCard from '@/components/ReportCard'
import ReportForm from '@/components/ReportForm'

export default function ReportPage() {
  const { user, reports } = useApp()
  const [showForm, setShowForm] = useState(false)

  if (!user) return null

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📸 제보 목록</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-full"
        >
          + 새 제보
        </button>
      </div>

      <div className="flex gap-2 text-xs">
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
          총 {reports.length}건
        </span>
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
          미해결 {reports.filter(r => r.status === 'open').length}건
        </span>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
          해결 {reports.filter(r => r.status === 'resolved').length}건
        </span>
      </div>

      {reports.length === 0 && (
        <div className="text-center text-gray-400 py-16 text-sm">
          아직 제보가 없습니다<br />
          첫 제보를 올려보세요!
        </div>
      )}

      <div className="space-y-3">
        {reports.map(report => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {showForm && <ReportForm lat={35.87} lng={128.6} onClose={() => setShowForm(false)} />}
    </div>
  )
}
