import { useNavigate } from 'react-router-dom'
import { Copy, MessageSquare, Phone } from 'lucide-react'
import type { Patient } from '@/types'
import { useStore } from '@/store/useStore'
import { getDaysOverdue, formatDate } from '@/utils/date'
import { getToothLabel } from '@/utils/scripts'
import { cn } from '@/lib/utils'
import ContactStatusBadge from './ContactStatusBadge'

interface PatientCardProps {
  patient: Patient
  onSelect?: () => void
  onContact?: () => void
}

export default function PatientCard({ patient, onSelect, onContact }: PatientCardProps) {
  const navigate = useNavigate()
  const getPatientRecords = useStore((s) => s.getPatientRecords)

  const daysOverdue = getDaysOverdue(patient.suggestedFollowUpDate)
  const isOverdue = daysOverdue > 0 && patient.currentStep !== '已完成'
  const toothLabel = getToothLabel(patient.tooth)
  const today = formatDate(new Date().toISOString())

  const records = getPatientRecords(patient.id)
  const latestRescheduled = records.find((r) => r.status === '改约' && r.rescheduledFollowUpDate)

  const hasFutureNextContact =
    patient.nextContactDate && patient.nextContactDate > today

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(patient.phone)
  }

  const handleCardClick = () => {
    navigate(`/cases/${patient.id}`)
  }

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.()
  }

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onContact?.()
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'bg-white rounded-xl shadow-sm border border-warm-100 p-4 cursor-pointer transition-all hover:shadow-md',
        isOverdue && 'border-l-4 border-danger-400'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-warm-500">{patient.name}</span>
          <span className="text-sm text-warm-400">{toothLabel}</span>
        </div>
        {isOverdue ? (
          <span className="animate-breathe text-xs font-medium text-danger-400">
            超期{daysOverdue}天
          </span>
        ) : (
          <span className="text-xs text-warm-400">
            {patient.currentStep === '已完成' ? '已完成' : `建议复诊：${patient.suggestedFollowUpDate}`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm text-warm-400 mb-2">
        <span className="inline-flex items-center gap-1">
          {patient.phone}
          <Copy
            size={12}
            className="cursor-pointer hover:text-primary-500 transition-colors"
            onClick={handleCopyPhone}
          />
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-md bg-primary-50 text-primary-700">
          {patient.currentStep}
        </span>
      </div>

      {(hasFutureNextContact || latestRescheduled) && (
        <div className="mb-3 text-xs space-y-1">
          {hasFutureNextContact && (
            <div className="text-warm-500">
              下次联系：<span className="text-primary-600 font-medium">{patient.nextContactDate}</span>
            </div>
          )}
          {latestRescheduled && (
            <div className="text-warm-500">
              改约复诊：<span className="text-accent-600 font-medium">{latestRescheduled.rescheduledFollowUpDate}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-warm-100">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectClick}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md text-primary-500 hover:bg-primary-50 transition-colors"
          >
            <MessageSquare size={14} />
            话术
          </button>
          <button
            onClick={handleContactClick}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md text-success-500 hover:bg-success-50 transition-colors"
          >
            <Phone size={14} />
            记录
          </button>
        </div>
        <ContactStatusBadge status={patient.contactStatus} />
      </div>
    </div>
  )
}
