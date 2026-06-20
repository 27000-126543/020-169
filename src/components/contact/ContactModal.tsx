import { useState } from 'react'
import { X } from 'lucide-react'
import { CONTACT_STATUSES, type ContactStatus } from '@/types'
import { useStore } from '@/store/useStore'
import { getTodayStr, formatDate, formatTime, combineDateAndTime } from '@/utils/date'

interface ContactModalProps {
  patientId: string
  patientName: string
  onClose: () => void
  onComplete?: () => void
}

export default function ContactModal({ patientId, patientName, onClose, onComplete }: ContactModalProps) {
  const addContactRecord = useStore((s) => s.addContactRecord)
  const getPatientLatestRecord = useStore((s) => s.getPatientLatestRecord)

  const latestRecord = getPatientLatestRecord(patientId)
  const defaultNextDate = latestRecord?.nextContactAt ? formatDate(latestRecord.nextContactAt) : getTodayStr()
  const defaultNextTime = latestRecord?.nextContactAt ? formatTime(latestRecord.nextContactAt) : '09:30'

  const [status, setStatus] = useState<ContactStatus>('已联系')
  const [callNotes, setCallNotes] = useState(latestRecord?.callNotes || '')
  const [nextContactDate, setNextContactDate] = useState(defaultNextDate)
  const [nextContactTime, setNextContactTime] = useState(defaultNextTime)
  const [rescheduledFollowUpDate, setRescheduledFollowUpDate] = useState('')

  const showNextContactDateTime = status === '无人接听' || status === '改约'
  const showRescheduledDate = status === '改约'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextContactAt = showNextContactDateTime
      ? combineDateAndTime(nextContactDate, nextContactTime)
      : undefined
    addContactRecord({
      patientId,
      status,
      contactDate: getTodayStr(),
      remark: '',
      callNotes,
      nextContactAt,
      rescheduledFollowUpDate: showRescheduledDate ? rescheduledFollowUpDate : undefined,
    })
    onClose()
    onComplete?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-[520px] max-w-full rounded-xl bg-white shadow-xl animate-fade-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-warm-400 hover:bg-warm-50 hover:text-warm-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-warm-500 mb-6 pr-8">
            联系记录 - {patientName}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-warm-500 mb-2">
                联系状态
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTACT_STATUSES.map((s) => (
                  <label
                    key={s}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                      status === s
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-warm-200 text-warm-500 hover:border-warm-300 hover:bg-warm-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={status === s}
                      onChange={() => setStatus(s)}
                      className="h-3.5 w-3.5 accent-primary-500"
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-500 mb-2">
                通话备注
              </label>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="通话备注，比如：无人接听下午15:30再打、患者同意明天复诊..."
                rows={3}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm text-warm-500 placeholder-warm-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
              />
            </div>

            {showNextContactDateTime && (
              <div>
                <label className="block text-sm font-medium text-warm-500 mb-2">
                  下次联系时间
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={nextContactDate}
                      onChange={(e) => setNextContactDate(e.target.value)}
                      className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm text-warm-500 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="time"
                      value={nextContactTime}
                      onChange={(e) => setNextContactTime(e.target.value)}
                      className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm text-warm-500 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {showRescheduledDate && (
              <div>
                <label className="block text-sm font-medium text-warm-500 mb-2">
                新复诊日期
              </label>
                <input
                  type="date"
                  value={rescheduledFollowUpDate}
                  onChange={(e) => setRescheduledFollowUpDate(e.target.value)}
                  className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm text-warm-500 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-warm-200 px-4 py-2 text-sm text-warm-500 hover:bg-warm-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                保存记录
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
