import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { formatDateCN, isToday, formatTime, formatDate } from '@/utils/date'
import { Users, Sun, Sunset, Moon, ChevronLeft, ChevronRight, UserCircle, Phone, Clock, CheckCircle } from 'lucide-react'

interface StaffDutyBoardProps {
  selectedDate: string
  onDateChange: (date: string) => void
  onSelectPatient?: (patientId: string) => void
  onStartQueueForStaff?: (staffId: string) => void
}

export default function StaffDutyBoard({ selectedDate, onDateChange, onSelectPatient, onStartQueueForStaff }: StaffDutyBoardProps) {
  const dailyScheduleByStaff = useStore((s) => s.getDailyScheduleByStaff(selectedDate))
  const assignPatient = useStore((s) => s.assignPatient)
  const staffs = useStore((s) => s.staffs.filter((st) => st.active))
  const unassignedPatients = useStore((s) => s.getPatientsByDate(selectedDate).filter((p) => !p.assignedTo))

  const [draggedPatientId, setDraggedPatientId] = useState<string | null>(null)

  const isTodayDate = isToday(selectedDate)

  function changeDate(days: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    onDateChange(formatDate(d.toISOString()))
  }

  function getTotalForStaff(staffId: string) {
    const staff = dailyScheduleByStaff.find((s) => s.staffId === staffId)
    return staff ? staff.total : 0
  }

  function handleDragStart(patientId: string) {
    setDraggedPatientId(patientId)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDrop(staffId: string) {
    if (draggedPatientId) {
      assignPatient(draggedPatientId, staffId)
      setDraggedPatientId(null)
    }
  }

  const timeSlots = [
    { key: 'morning', label: '上午', icon: Sun, color: 'amber' },
    { key: 'afternoon', label: '下午', icon: Sunset, color: 'orange' },
    { key: 'evening', label: '晚上', icon: Moon, color: 'indigo' },
  ] as const

  return (
    <div className="bg-white rounded-xl shadow-sm border border-warm-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-warm-100 bg-warm-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary-500" />
            <h3 className="font-semibold text-gray-700">前台值班看板</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg hover:bg-warm-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className={`text-sm font-medium min-w-[100px] text-center ${
              isTodayDate ? 'text-accent-600' : 'text-gray-600'
            }`}>
              {formatDateCN(selectedDate)}
              {isTodayDate && <span className="ml-1 text-[10px] text-accent-500">今天</span>}
            </span>
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg hover:bg-warm-100 text-gray-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${staffs.length + 1}, minmax(0, 1fr))` }}>
          <div
            className={`rounded-lg border-2 border-dashed p-3 transition-colors ${
              draggedPatientId ? 'border-primary-300 bg-primary-50/30' : 'border-warm-200 bg-warm-50/30'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('')}
          >
            <div className="text-center mb-3">
              <div className="w-10 h-10 rounded-full bg-warm-200 flex items-center justify-center mx-auto mb-2">
                <UserCircle size={20} className="text-warm-500" />
              </div>
              <div className="text-sm font-medium text-gray-600">待分配</div>
              <div className="text-xs text-gray-400 mt-0.5">{unassignedPatients.length} 位</div>
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {unassignedPatients.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(p.id)}
                  onClick={() => onSelectPatient?.(p.id)}
                  className="p-2 bg-white rounded-lg border border-warm-100 cursor-grab hover:border-primary-300 hover:shadow-sm transition-all text-left active:cursor-grabbing"
                >
                  <div className="text-sm font-medium text-gray-700">{p.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{p.phone}</div>
                  <div className="text-[10px] text-primary-500 mt-1">{p.currentStep}</div>
                </div>
              ))}
              {unassignedPatients.length === 0 && (
                <div className="text-center text-xs text-gray-300 py-4">
                  全部已分配
                </div>
              )}
            </div>
          </div>

          {staffs.map((staff) => {
            const schedule = dailyScheduleByStaff.find((s) => s.staffId === staff.id)
            const total = schedule?.total || 0

            return (
              <div
                key={staff.id}
                className={`rounded-lg border-2 p-3 transition-colors ${
                  draggedPatientId ? 'border-primary-300 bg-primary-50/30' : 'border-warm-200 bg-white'
                }`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(staff.id)}
              >
                <div className="text-center mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold"
                    style={{ backgroundColor: staff.color }}
                  >
                    {staff.name.charAt(0)}
                  </div>
                  <div className="text-sm font-medium text-gray-700">{staff.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{staff.role}</div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                    <span className="flex items-center gap-0.5 text-primary-500">
                      <Phone size={10} />
                      {total}
                    </span>
                    {onStartQueueForStaff && total > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartQueueForStaff(staff.id)
                        }}
                        className="text-[10px] px-2 py-0.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                      >
                        进入队列
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {timeSlots.map((slot) => {
                    const patients = schedule?.[slot.key] || []
                    const SlotIcon = slot.icon
                    const slotColorClass = {
                      amber: 'text-amber-500 bg-amber-50',
                      orange: 'text-orange-500 bg-orange-50',
                      indigo: 'text-indigo-500 bg-indigo-50',
                    }[slot.color]

                    return (
                      <div key={slot.key}>
                        <div className={`flex items-center gap-1.5 mb-1.5 px-1.5 py-1 rounded ${slotColorClass}`}>
                          <SlotIcon size={12} />
                          <span className="text-[11px] font-medium">{slot.label}</span>
                          <span className="text-[10px] ml-auto opacity-70">{patients.length}位</span>
                        </div>
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                          {patients.map((p) => (
                            <div
                              key={p.id}
                              draggable
                              onDragStart={() => handleDragStart(p.id)}
                              onClick={() => onSelectPatient?.(p.id)}
                              className="p-1.5 bg-warm-50 rounded border border-warm-100 cursor-grab hover:border-primary-300 transition-all text-left active:cursor-grabbing"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-700">{p.name}</span>
                                {p.nextContactAt && (
                                  <span className="text-[10px] text-gray-400">
                                    {formatTime(p.nextContactAt)}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-primary-500">{p.currentStep}</div>
                            </div>
                          ))}
                          {patients.length === 0 && (
                            <div className="text-center text-[10px] text-gray-300 py-2">
                              无安排
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-warm-100 text-center text-[11px] text-gray-400">
          💡 拖拽患者卡片到前台人员列中即可分配任务
        </div>
      </div>
    </div>
  )
}
