'use client'

import { Report } from '@/lib/types'

const typeIcon: Record<string, string> = {
  trash: '🗑️',
  blindspot: '⚠️',
  food: '🍲',
}

const typeLabel: Record<string, string> = {
  trash: '쓰레기 무단투기',
  blindspot: '사각지대',
  food: '음식 나눔',
}

interface Props {
  report: Report
}

export default function ReportCard({ report }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{typeIcon[report.type] || '📌'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-xs px-2 py-0.5 rounded-full text-gray-600">
              {typeLabel[report.type] || report.type}
            </span>
            {report.severity && (
              <span className="text-xs text-gray-400"> severity {report.severity}</span>
            )}
          </div>
          {report.description && (
            <p className="text-sm text-gray-700 mt-1">{report.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{report.nickname}</span>
            <span>·</span>
            <span>{report.address?.slice(0, 20) || '위치 미확인'}</span>
            <span>·</span>
            <span>{new Date(report.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
          {report.photoUrl && (
            <img
              src={report.photoUrl}
              alt="제보 사진"
              className="mt-2 rounded-lg w-full h-40 object-cover"
            />
          )}
          {report.aiTags && report.aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {report.aiTags.map(tag => (
                <span key={tag} className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                  AI: {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
