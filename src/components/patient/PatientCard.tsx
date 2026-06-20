import { useNavigate } from 'react-router-dom'
import { Copy, Phone, PhoneOff, CalendarClock, AlertCircle } from 'lucide-react'
import type { Patient, ContactStatus } from '@/types'
import { useStore } from '@/store/useStore'
import { getRelativeDateLabel, isOverdue, getTodayStr } from '@/utils/date'
import { getToothLabel } from '@/utils/scripts'
import { cn } from '@/lib/utils'
import ContactStatusBadge from './ContactStatusBadge'

interface ContactActionProps {
  patient: Patient
}

function ContactAction({ patient }: ContactActionProps) {
  const addContactRecord = useStore((s) => s.addContactRecord)
  const today = getTodayStr()

  const handleMark = (status: ContactStatus) => {
    addContactRecord({
      patientId: patient.id,
      status,
      contactDate: today,
      remark: '',
    })
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      <button
        onClick={(e) => { e.stopPropagation(); handleMark('已联系') }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-success-100 text-success-700 hover:bg-success-200 transition-colors"
      >
        <Phone size={12} />已联系
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleMark('无人接听') }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-warm-200 text-warm-500 hover:bg-warm-300 transition-colors"
      >
        <PhoneOff size={12} />无人接听
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleMark('改约') }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
      >
        <CalendarClock size={12} />改约
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleMark('疼痛需提前就诊') }}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-danger-100 text-danger-700 hover:bg-danger-200 transition-colors"
      >
        <AlertCircle size={12} />疼痛
      </button>
    </div>
  )
}

interface PatientCardProps {
  patient: Patient
  compact?: boolean
}

export function PatientCard({ patient, compact, onSelect }: PatientCardProps & { onSelect?: () => void }) {
  const navigate = useNavigate()
  const overdue = isOverdue(patient.suggestedFollowUpDate)
  const relativeLabel = getRelativeDateLabel(patient.suggestedFollowUpDate)
  const toothLabel = getToothLabel(patient.tooth)

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(patient.phone)
  }

  return (
    <div
      onClick={() => onSelect ? onSelect() : navigate(`/cases/${patient.id}`)}
      className={cn(
        'bg-white rounded-xl shadow-sm border border-warm-100 p-4 cursor-pointer transition-all hover:shadow-md',
        overdue && patient.currentStep !== '已完成' && 'border-l-4 border-danger-400'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-warm-500">{patient.name}</span>
          <span className="text-sm text-warm-400">{toothLabel}</span>
        </div>
        {overdue ? (
          <span className="animate-breathe text-xs font-medium text-danger-400">
            {relativeLabel}
          </span>
        ) : (
          <span className="text-xs text-warm-400">{relativeLabel}</span>
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

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-md bg-primary-50 text-primary-700">
          {patient.currentStep}
        </span>
        <ContactStatusBadge status={patient.contactStatus} />
      </div>

      {!compact && patient.currentStep !== '已完成' && (
        <div onClick={(e) => e.stopPropagation()}>
          <ContactAction patient={patient} />
        </div>
      )}
    </div>
  )
}
