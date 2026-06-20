import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { formatDateCN, formatTime, formatDateTimeCN, isOverdue } from '@/utils/date'
import { getToothLabel } from '@/utils/scripts'
import type { Patient } from '@/types'
import {
  Sunrise,
  Sunset,
  Moon,
  Phone,
  AlertTriangle,
  ChevronRight,
  Play,
  Clock,
} from 'lucide-react'

interface DailyScheduleProps {
  date: string
  onStartQueue?: (date: string) => void
  onChangeDate?: (date: string) => void
}

type TimeSlot = 'morning' | 'afternoon' | 'evening'

interface SlotPatients {
  slot: TimeSlot
  label: string
  icon: typeof Sunrise
  color: string
  bgColor: string
  patients: Array<{
    patient: Patient
    contactType: 'followup' | 'callback' | 'overdue'
    contactTime?: string
  }>
}

export default function DailySchedule({ date, onStartQueue }: DailyScheduleProps) {
  const navigate = useNavigate()
  const patients = useStore((s) => s.patients)
  const getQueuePatients = useStore((s) => s.getQueuePatients)
  const hasContactOnDate = useStore((s) => s.hasContactOnDate)

  const queueData = useMemo(() => getQueuePatients(date), [getQueuePatients, date])

  const slots = useMemo((): SlotPatients[] => {
    function getTimeSlot(dateTimeStr?: string): TimeSlot {
      if (!dateTimeStr) return 'morning'
      const d = new Date(dateTimeStr)
      const h = d.getHours()
      if (h < 12) return 'morning'
      if (h < 18) return 'afternoon'
      return 'evening'
    }

    function getContactType(p: Patient & { priority?: number }): 'followup' | 'callback' | 'overdue' {
      if (p.priority === 1) return 'overdue'
      if (p.priority === 2) return 'callback'
      return 'followup'
    }

    const morning: SlotPatients['patients'] = []
    const afternoon: SlotPatients['patients'] = []
    const evening: SlotPatients['patients'] = []

    queueData.forEach((p) => {
      const queueP = p as Patient & { priority?: number }
      const contactType = getContactType(queueP)
      const contactAt = p.nextContactAt
      const slot = getTimeSlot(contactAt)
      const entry = {
        patient: p,
        contactType,
        contactTime: contactAt ? formatTime(contactAt) : undefined,
      }
      if (slot === 'morning') morning.push(entry)
      else if (slot === 'afternoon') afternoon.push(entry)
      else evening.push(entry)
    })

    const sortByTime = (
      a: SlotPatients['patients'][number],
      b: SlotPatients['patients'][number]
    ) => {
      if (a.contactTime && b.contactTime) return a.contactTime.localeCompare(b.contactTime)
      if (a.contactTime) return -1
      if (b.contactTime) return 1
      if (a.contactType !== b.contactType) {
        const order: Record<string, number> = { overdue: 0, callback: 1, followup: 2 }
        return order[a.contactType] - order[b.contactType]
      }
      return 0
    }

    morning.sort(sortByTime)
    afternoon.sort(sortByTime)
    evening.sort(sortByTime)

    return [
      {
        slot: 'morning',
        label: '上午',
        icon: Sunrise,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        patients: morning,
      },
      {
        slot: 'afternoon',
        label: '下午',
        icon: Sunset,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        patients: afternoon,
      },
      {
        slot: 'evening',
        label: '晚上',
        icon: Moon,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        patients: evening,
      },
    ]
  }, [queueData, date])

  const totalCount = slots.reduce((sum, s) => sum + s.patients.length, 0)
  const overdueCount = slots.reduce(
    (sum, s) => sum + s.patients.filter((p) => p.contactType === 'overdue').length,
    0
  )
  const callbackCount = slots.reduce(
    (sum, s) => sum + s.patients.filter((p) => p.contactType === 'callback').length,
    0
  )

  function getTypeBadge(type: 'followup' | 'callback' | 'overdue') {
    switch (type) {
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-danger-50 text-danger-600 font-medium">
            <AlertTriangle size={9} />
            超期
          </span>
        )
      case 'callback':
        return (
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent-50 text-accent-600 font-medium">
            <Clock size={9} />
            回电
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">
            <Phone size={9} />
            复诊
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{formatDateCN(date)} 日排班</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-primary-400" />
              共 {totalCount} 通电话
            </span>
            {overdueCount > 0 && (
              <span className="flex items-center gap-1">
                <AlertTriangle size={12} className="text-danger-400" />
                {overdueCount} 个超期
              </span>
            )}
            {callbackCount > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-accent-400" />
                {callbackCount} 个回电
              </span>
            )}
          </div>
        </div>
        {totalCount > 0 && (
          <button
            onClick={() => onStartQueue?.(date)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
          >
            <Play size={14} />
            进入电话队列
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {slots.map((slot) => {
          const Icon = slot.icon
          return (
            <div
              key={slot.slot}
              className={`rounded-xl border border-warm-100 overflow-hidden ${
                slot.patients.length === 0 ? 'opacity-60' : ''
              }`}
            >
              <div className={`flex items-center justify-between px-4 py-3 ${slot.bgColor}`}>
                <div className="flex items-center gap-2">
                  <Icon size={16} className={slot.color} />
                  <span className="font-semibold text-gray-700">{slot.label}</span>
                </div>
                <span className="text-xs text-gray-500">{slot.patients.length} 位</span>
              </div>
              <div className="bg-white divide-y divide-warm-50">
                {slot.patients.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">暂无安排</div>
                ) : (
                  slot.patients.map((entry) => {
                    const p = entry.patient
                    const isContacted = hasContactOnDate(p.id, date)
                    return (
                      <div
                        key={p.id}
                        className={`p-3 hover:bg-warm-50/50 cursor-pointer transition-colors group ${
                          isContacted ? 'opacity-50' : ''
                        }`}
                        onClick={() => navigate(`/cases/${p.id}`)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {entry.contactTime && (
                                <span className="text-xs font-mono text-gray-500 bg-warm-100 px-1.5 py-0.5 rounded">
                                  {entry.contactTime}
                                </span>
                              )}
                              {getTypeBadge(entry.contactType)}
                              {entry.contactType === 'overdue' && (
                                <span className="text-[10px] text-danger-500">
                                  超期{Math.floor(
                                    (new Date(date).getTime() - new Date(p.suggestedFollowUpDate).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )}天
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-800 truncate">{p.name}</span>
                              <span className="text-xs text-gray-400 truncate">
                                · {getToothLabel(p.tooth)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 truncate">
                              {p.phone} · {p.currentStep}
                            </div>
                            {p.nextContactAt && entry.contactType === 'callback' && (
                              <div className="text-[10px] text-primary-500 mt-0.5">
                                约：{formatDateTimeCN(p.nextContactAt)}
                              </div>
                            )}
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-gray-300 group-hover:text-primary-400 transition-colors mt-1"
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
