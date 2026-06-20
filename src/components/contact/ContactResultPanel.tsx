import { useState } from 'react'
import { X, Check, PhoneOff, CalendarPlus, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { CONTACT_STATUSES, type ContactStatus } from '@/types'
import { useStore } from '@/store/useStore'
import { getTodayStr, formatDate, formatTime, combineDateAndTime, formatDateTimeCN } from '@/utils/date'

interface ContactResultPanelProps {
  patientId: string
  patientName: string
  defaultDate?: string
  onClose: () => void
  onComplete?: () => void
}

const STATUS_OPTIONS: Array<{
  status: ContactStatus
  icon: typeof Check
  label: string
  color: string
  activeColor: string
  desc: string
}> = [
  { status: '已联系', icon: Check, label: '已联系', color: 'border-success-200 text-success-600', activeColor: 'bg-success-50 border-success-400 text-success-700', desc: '已确认复诊或沟通完毕' },
  { status: '无人接听', icon: PhoneOff, label: '无人接听', color: 'border-warm-200 text-warm-500', activeColor: 'bg-warm-50 border-warm-400 text-warm-700', desc: '稍后再打' },
  { status: '改约', icon: CalendarPlus, label: '改约', color: 'border-accent-200 text-accent-600', activeColor: 'bg-accent-50 border-accent-400 text-accent-700', desc: '改到其他日期复诊' },
  { status: '疼痛需提前就诊', icon: AlertCircle, label: '疼痛急诊', color: 'border-danger-200 text-danger-600', activeColor: 'bg-danger-50 border-danger-400 text-danger-700', desc: '安排提前就诊' },
  { status: '待联系', icon: Clock, label: '待联系', color: 'border-primary-200 text-primary-600', activeColor: 'bg-primary-50 border-primary-400 text-primary-700', desc: '稍后处理' },
]

export default function ContactResultPanel({ patientId, patientName, defaultDate, onClose, onComplete }: ContactResultPanelProps) {
  const addContactRecord = useStore((s) => s.addContactRecord)
  const getPatientLatestRecord = useStore((s) => s.getPatientLatestRecord)
  const getPatient = useStore((s) => (id: string) => s.patients.find((p) => p.id === id))

  const patient = getPatient(patientId)
  const latestRecord = getPatientLatestRecord(patientId)
  const targetDate = defaultDate || getTodayStr()

  const getDefaultNextDateTime = () => {
    if (latestRecord?.nextContactAt) {
      return { date: formatDate(latestRecord.nextContactAt), time: formatTime(latestRecord.nextContactAt) }
    }
    if (patient?.nextContactAt) {
      return { date: formatDate(patient.nextContactAt), time: formatTime(patient.nextContactAt) }
    }
    return { date: targetDate, time: '15:30' }
  }

  const defaultNext = getDefaultNextDateTime()
  const initRescheduled = patient?.suggestedFollowUpDate || targetDate

  const [status, setStatus] = useState<ContactStatus>(latestRecord?.status || '待联系')
  const [callNotes, setCallNotes] = useState(latestRecord?.callNotes || '')
  const [nextContactDate, setNextContactDate] = useState(defaultNext.date)
  const [nextContactTime, setNextContactTime] = useState(defaultNext.time)
  const [rescheduledFollowUpDate, setRescheduledFollowUpDate] = useState(initRescheduled)
  const [showPreview, setShowPreview] = useState(false)

  const showNextContact = status === '无人接听' || status === '改约' || status === '待联系'
  const showRescheduled = status === '改约' || status === '疼痛需提前就诊'

  const addDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    return formatDate(d.toISOString())
  }

  const previewNextContactAt = showNextContact ? combineDateAndTime(nextContactDate, nextContactTime) : undefined

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextContactAt = showNextContact ? combineDateAndTime(nextContactDate, nextContactTime) : undefined
    addContactRecord({
      patientId,
      status,
      contactDate: getTodayStr(),
      remark: '',
      callNotes,
      nextContactAt,
      rescheduledFollowUpDate: showRescheduled ? rescheduledFollowUpDate : undefined,
    })
    onClose()
    onComplete?.()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">联系结果 - {patientName}</h3>
          <p className="text-sm text-warm-500 mt-0.5">请选择通话结果并填写必要信息</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:bg-white hover:text-warm-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            通话结果
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isActive = status === opt.status
              return (
                <button
                  type="button"
                  key={opt.status}
                  onClick={() => setStatus(opt.status)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all text-left ${
                    isActive ? opt.activeColor : opt.color + ' hover:bg-warm-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className="font-medium text-sm">{opt.label}</span>
                  </div>
                  <span className="text-[10px] opacity-70 leading-tight">{opt.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            通话备注
          </label>
          <textarea
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder="例如：患者说今天没时间，改到明天上午；下午15:30再打；患者有点痛，安排提前来看..."
            rows={3}
            className="w-full rounded-xl border border-warm-200 px-4 py-3 text-sm text-gray-700 placeholder-warm-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none transition-all"
          />
        </div>

        {showNextContact && (
          <div className="bg-warm-50/60 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-primary-500" />
              <label className="block text-sm font-medium text-gray-700">
                下次联系时间
                {status === '无人接听' && <span className="text-xs text-warm-400 ml-1">（什么时候再打）</span>}
                {status === '改约' && <span className="text-xs text-warm-400 ml-1">（确认日期前再提醒）</span>}
                {status === '待联系' && <span className="text-xs text-warm-400 ml-1">（安排联系时间）</span>}
              </label>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="date"
                  value={nextContactDate}
                  onChange={(e) => setNextContactDate(e.target.value)}
                  className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm bg-white focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>
              <div className="w-32">
                <input
                  type="time"
                  value={nextContactTime}
                  onChange={(e) => setNextContactTime(e.target.value)}
                  className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm bg-white focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>
            </div>
          </div>
        )}

        {showRescheduled && (
          <div className="bg-accent-50/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarPlus size={14} className="text-accent-500" />
              <label className="block text-sm font-medium text-gray-700">
                新复诊日期
                {status === '疼痛需提前就诊' && <span className="text-xs text-danger-500 ml-1">（安排提前就诊）</span>}
              </label>
            </div>
            <input
              type="date"
              value={rescheduledFollowUpDate}
              onChange={(e) => setRescheduledFollowUpDate(e.target.value)}
              className="w-full rounded-lg border border-warm-200 px-3 py-2.5 text-sm bg-white focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400"
            />
          </div>
        )}

        {(showNextContact || showRescheduled) && (
          <div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
            >
              {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showPreview ? '收起保存后预览' : '查看保存后效果'}
            </button>
            {showPreview && (
              <div className="mt-2 p-3 rounded-lg border border-dashed border-warm-200 bg-warm-50/50 text-sm space-y-1.5">
                {previewNextContactAt && (
                  <div className="text-warm-500">
                    <span className="text-warm-400">下次联系：</span>
                    <span className="font-medium text-primary-600">{formatDateTimeCN(previewNextContactAt)}</span>
                  </div>
                )}
                {showRescheduled && (
                  <div className="text-warm-500">
                    <span className="text-warm-400">复诊日期：</span>
                    <span className="font-medium text-accent-600">{rescheduledFollowUpDate}</span>
                  </div>
                )}
                {callNotes && (
                  <div className="text-warm-500">
                    <span className="text-warm-400">备注：</span>
                    <span>{callNotes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-warm-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-warm-200 text-sm text-gray-600 hover:bg-warm-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 shadow-sm hover:shadow-md transition-all"
          >
            保存并继续下一位 →
          </button>
        </div>
      </form>
    </div>
  )
}
