import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate, isToday } from '@/utils/date'
import { cn } from '@/lib/utils'

interface FollowUpCalendarProps {
  onSelectDate: (date: string) => void
}

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export default function FollowUpCalendar({ onSelectDate }: FollowUpCalendarProps) {
  const getPatientsByDateRange = useStore((s) => s.getPatientsByDateRange)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const rangeStart = formatDate(firstDayOfMonth.toISOString())
  const rangeEnd = formatDate(lastDayOfMonth.toISOString())

  const monthPatients = useMemo(
    () => getPatientsByDateRange(rangeStart, rangeEnd),
    [getPatientsByDateRange, rangeStart, rangeEnd]
  )

  const patientCountByDate = useMemo(() => {
    const map: Record<string, number> = {}
    monthPatients.forEach((p) => {
      const d = p.suggestedFollowUpDate
      map[d] = (map[d] || 0) + 1
    })
    return map
  }, [monthPatients])

  const calendarCells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d)
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function handleDateClick(day: number) {
    const dateStr = formatDate(new Date(year, month, day).toISOString())
    setSelectedDate(dateStr)
    onSelectDate(dateStr)
  }

  function getDotColorClass(count: number): string {
    if (count >= 6) return 'bg-danger-500'
    if (count >= 3) return 'bg-accent-500'
    return 'bg-primary-400'
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5 max-w-[600px] w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-md text-warm-500 hover:bg-warm-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-base font-semibold text-warm-500">
          {year}年{month + 1}月
        </h3>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-md text-warm-500 hover:bg-warm-50 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEK_LABELS.map((w) => (
          <div
            key={w}
            className="text-center text-xs font-medium text-warm-400 py-1.5"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const dateStr = formatDate(new Date(year, month, day).toISOString())
          const count = patientCountByDate[dateStr] || 0
          const hasPatients = count > 0
          const isSelected = selectedDate === dateStr
          const isTodayCell = isToday(dateStr)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => handleDateClick(day)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative',
                isSelected
                  ? 'bg-primary-500 text-white'
                  : hasPatients
                  ? 'text-warm-500 hover:bg-warm-50 cursor-pointer'
                  : 'text-warm-300 hover:bg-warm-50 cursor-pointer',
                isTodayCell && !isSelected && 'ring-2 ring-accent-500 ring-offset-1'
              )}
            >
              <span>{day}</span>
              {hasPatients && (
                <span
                  className={cn(
                    'mt-0.5 w-1.5 h-1.5 rounded-full',
                    isSelected ? 'bg-white' : getDotColorClass(count)
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-warm-400">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary-400 inline-block" />
          <span>1-2 人</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent-500 inline-block" />
          <span>3-5 人</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-danger-500 inline-block" />
          <span>6+ 人</span>
        </div>
      </div>
    </div>
  )
}
