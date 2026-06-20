import { useStore } from '@/store/useStore'
import { formatDateCN, isToday, formatDate } from '@/utils/date'
import { Phone, AlertTriangle, RefreshCw, ChevronRight, CheckCircle, Clock, CalendarDays } from 'lucide-react'

interface WeeklySummaryProps {
  onSelectDate?: (date: string) => void
  onStartQueue?: (date: string) => void
}

export default function WeeklySummary({ onSelectDate, onStartQueue }: WeeklySummaryProps) {
  const weeklySummary = useStore((s) => s.getWeeklySummary())

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  function handleDayClick(date: string) {
    onSelectDate?.(date)
  }

  function handleStartQueue(e: React.MouseEvent, date: string) {
    e.stopPropagation()
    onStartQueue?.(date)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary-500" />
          <h3 className="font-semibold text-gray-700">本周复诊排班摘要</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <Phone size={10} className="text-primary-400" />
            复诊
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-accent-400" />
            回电
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={10} className="text-success-400" />
            已完成
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weeklySummary.map((day) => {
          const d = new Date(day.date)
          const dayName = dayNames[d.getDay()]
          const isTodayDate = isToday(day.date)
          const hasPatients = day.total > 0

          return (
            <div
              key={day.date}
              onClick={() => handleDayClick(day.date)}
              className={`relative rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${
                isTodayDate
                  ? 'border-accent-400 bg-accent-50/30'
                  : hasPatients
                  ? 'border-warm-200 bg-white hover:border-primary-300'
                  : 'border-warm-100 bg-warm-50/50 opacity-70'
              }`}
            >
              <div className={`text-center mb-2 ${
                isTodayDate ? 'text-accent-600' : 'text-gray-600'
              }`}>
                <div className="text-xs font-medium">{dayName}</div>
                <div className="text-lg font-bold">{d.getDate()}</div>
              </div>

              {hasPatients ? (
                <div className="space-y-1.5">
                  {day.followUpCount > 0 && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-primary-600">
                        <Phone size={10} />
                        复诊
                      </span>
                      <span className="font-medium text-primary-700">{day.followUpCount}</span>
                    </div>
                  )}
                  {day.callbackCount > 0 && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-accent-600">
                        <Clock size={10} />
                        回电
                      </span>
                      <span className="font-medium text-accent-700">{day.callbackCount}</span>
                    </div>
                  )}
                  {day.completedCount > 0 && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-success-600">
                        <CheckCircle size={10} />
                        已完成
                      </span>
                      <span className="font-medium text-success-700">{day.completedCount}</span>
                    </div>
                  )}
                  {day.overdueCount > 0 && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-danger-500">
                        <AlertTriangle size={10} />
                        超期
                      </span>
                      <span className="font-medium text-danger-600">{day.overdueCount}</span>
                    </div>
                  )}
                  {day.rescheduledCount > 0 && (
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="flex items-center gap-1 text-amber-600">
                        <RefreshCw size={10} />
                        改约
                      </span>
                      <span className="font-medium text-amber-700">{day.rescheduledCount}</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-warm-100 mt-1.5">
                    <button
                      onClick={(e) => handleStartQueue(e, day.date)}
                      className="w-full flex items-center justify-center gap-1 py-1 text-[10px] text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors font-medium"
                    >
                      进入队列
                      <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[10px] text-gray-300 py-3">
                  无预约
                </div>
              )}

              {isTodayDate && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-400 rounded-full animate-pulse" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
