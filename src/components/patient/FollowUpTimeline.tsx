import { useStore } from '@/store/useStore'
import { Calendar, Phone, Clock, Stethoscope, ArrowRight } from 'lucide-react'
import { formatDateCN, formatDateTimeCN, isToday, isPast } from '@/utils/date'

interface FollowUpTimelineProps {
  patientId: string
  onSelectDate?: (date: string) => void
}

export default function FollowUpTimeline({ patientId, onSelectDate }: FollowUpTimelineProps) {
  const getFollowUpTimeline = useStore((s) => s.getFollowUpTimeline)
  const timeline = getFollowUpTimeline(patientId)

  function getIcon(type: string) {
    switch (type) {
      case 'stage':
        return Stethoscope
      case 'contact':
        return Phone
      case 'nextContact':
        return Clock
      case 'followUp':
        return Calendar
      default:
        return Calendar
    }
  }

  function getColorClass(type: string, isPastEvent: boolean) {
    if (!isPastEvent) {
      return 'border-primary-200 bg-primary-50 text-primary-600'
    }
    switch (type) {
      case 'stage':
        return 'border-indigo-200 bg-indigo-50 text-indigo-600'
      case 'contact':
        return 'border-success-200 bg-success-50 text-success-600'
      case 'nextContact':
        return 'border-accent-200 bg-accent-50 text-accent-600'
      case 'followUp':
        return 'border-primary-200 bg-primary-50 text-primary-600'
      default:
        return 'border-warm-200 bg-warm-50 text-warm-600'
    }
  }

  function getLineColor(isPastEvent: boolean) {
    return isPastEvent ? 'bg-success-200' : 'bg-warm-200'
  }

  function handleItemClick(date: string) {
    onSelectDate?.(date)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-primary-500" />
        <h3 className="font-semibold text-gray-700">跟进计划时间线</h3>
      </div>

      <div className="relative">
        {timeline.map((item, index) => {
          const Icon = getIcon(item.type)
          const isPastEvent = isPast(item.date) && !isToday(item.date)
          const colorClass = getColorClass(item.type, isPastEvent)
          const isLast = index === timeline.length - 1
          const isClickable = item.type === 'contact' || item.type === 'nextContact' || item.type === 'followUp'

          return (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={14} />
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 my-1 ${getLineColor(isPastEvent)}`} />
                )}
              </div>

              <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                <div
                  className={`rounded-lg border p-3 transition-all ${
                    isClickable && onSelectDate
                      ? 'cursor-pointer hover:shadow-md hover:border-primary-300'
                      : ''
                  } ${isPastEvent ? 'opacity-70' : ''}`}
                  onClick={() => isClickable && handleItemClick(item.date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      isToday(item.date)
                        ? 'bg-accent-100 text-accent-600'
                        : isPastEvent
                        ? 'bg-warm-100 text-warm-500'
                        : 'bg-primary-100 text-primary-600'
                    }`}>
                      {formatDateCN(item.date)}
                      {isToday(item.date) && ' · 今天'}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  )}
                  {isClickable && onSelectDate && (
                    <div className="mt-2 flex items-center justify-end text-[11px] text-primary-500">
                      查看当天队列
                      <ArrowRight size={10} className="ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {timeline.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无跟进记录
          </div>
        )}
      </div>
    </div>
  )
}
