import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import PatientForm from '@/components/patient/PatientForm'
import ContactStatusBadge from '@/components/patient/ContactStatusBadge'
import FollowUpCalendar from '@/components/calendar/FollowUpCalendar'
import WeeklySummary from '@/components/calendar/WeeklySummary'
import ContactQueue from '@/components/contact/ContactQueue'
import { getToothLabel } from '@/utils/scripts'
import {
  getDaysOverdue,
  isOverdue,
  getRelativeDateLabel,
  formatDate,
  formatDateCN,
} from '@/utils/date'
import type { TreatmentStep, ContactStatus, Patient } from '@/types'
import { Plus, Search, List, Calendar, CalendarDays, ChevronRight } from 'lucide-react'

type ViewMode = 'list' | 'calendar' | 'week' | 'summary'

export default function CasesPage() {
  const patients = useStore((s) => s.patients)
  const getPatientsByDate = useStore((s) => s.getPatientsByDate)
  const getPatientsByDateRange = useStore((s) => s.getPatientsByDateRange)
  const navigate = useNavigate()

  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('summary')
  const [search, setSearch] = useState('')
  const [stepFilter, setStepFilter] = useState<TreatmentStep | ''>('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | ''>('')
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date().toISOString()))
  const [showQueueForDate, setShowQueueForDate] = useState<string | null>(null)

  const weekPatients = useMemo(() => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(today.getTime() + 6 * 86400000)
    const weekEndStr = formatDate(weekEnd.toISOString())
    const weekStartStr = formatDate(weekStart.toISOString())
    const list = getPatientsByDateRange(weekStartStr, weekEndStr)

    const grouped: Record<string, Patient[]> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 86400000)
      const key = formatDate(d.toISOString())
      grouped[key] = []
    }
    list.forEach((p) => {
      if (grouped[p.suggestedFollowUpDate]) {
        grouped[p.suggestedFollowUpDate].push(p)
      }
    })
    return grouped
  }, [patients, getPatientsByDateRange])

  const filtered = patients.filter((p) => {
    if (search && !p.name.includes(search) && !p.phone.includes(search) && !p.tooth.includes(search)) return false
    if (stepFilter && p.currentStep !== stepFilter) return false
    if (statusFilter && p.contactStatus !== statusFilter) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const aOverdue = a.currentStep !== '已完成' && isOverdue(a.suggestedFollowUpDate)
    const bOverdue = b.currentStep !== '已完成' && isOverdue(b.suggestedFollowUpDate)
    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const datePatients = getPatientsByDate(selectedDate)

  if (showQueueForDate) {
    return (
      <ContactQueue
        onExit={() => setShowQueueForDate(null)}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">病例管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {patients.length} 个病例，{patients.filter((p) => p.currentStep !== '已完成').length} 个进行中
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          新增病例
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-warm-100 mb-6">
        <div className="flex items-center justify-between p-3 border-b border-warm-100">
          <div className="flex items-center gap-1 bg-warm-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'summary' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarDays size={14} />
              周排班摘要
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List size={14} />
              列表
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CalendarDays size={14} />
              本周排程
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar size={14} />
              月历视图
            </button>
          </div>

          {viewMode === 'list' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索姓名、手机号、牙位..."
                  className="w-64 pl-8 pr-4 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                />
              </div>
              <select
                value={stepFilter}
                onChange={(e) => setStepFilter(e.target.value as TreatmentStep | '')}
                className="text-sm bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400"
              >
                <option value="">全部步骤</option>
                <option value="开髓引流">开髓引流</option>
                <option value="已封药待复诊">已封药待复诊</option>
                <option value="已预备待充填">已预备待充填</option>
                <option value="已充填待冠修复">已充填待冠修复</option>
                <option value="已完成">已完成</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ContactStatus | '')}
                className="text-sm bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-400"
              >
                <option value="">全部状态</option>
                <option value="待联系">待联系</option>
                <option value="已联系">已联系</option>
                <option value="无人接听">无人接听</option>
                <option value="改约">改约</option>
                <option value="疼痛需提前就诊">疼痛需提前就诊</option>
              </select>
            </div>
          )}
        </div>

        {viewMode === 'summary' && (
          <div className="p-4">
            <WeeklySummary
              onSelectDate={(date) => {
                setSelectedDate(date)
                setViewMode('calendar')
              }}
              onStartQueue={(date) => {
                setShowQueueForDate(date)
              }}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="p-2">
            {sorted.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {patients.length === 0 ? '暂无病例，点击"新增病例"开始' : '没有匹配的病例'}
              </div>
            ) : (
              <div className="space-y-2">
                {sorted.map((patient) => {
                  const overdue = patient.currentStep !== '已完成' && isOverdue(patient.suggestedFollowUpDate)
                  return (
                    <div
                      key={patient.id}
                      onClick={() => navigate(`/cases/${patient.id}`)}
                      className={`bg-white rounded-lg p-4 border border-warm-100 hover:shadow-md transition-all cursor-pointer animate-fade-in ${
                        overdue ? 'border-l-4 border-l-danger-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 truncate">{patient.name}</span>
                              {overdue && (
                                <span className="text-xs bg-danger-50 text-danger-600 px-2 py-0.5 rounded-full font-medium animate-breathe">
                                  超期{getDaysOverdue(patient.suggestedFollowUpDate)}天
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span>{getToothLabel(patient.tooth)}</span>
                              <span>·</span>
                              <span>{patient.phone}</span>
                              <span>·</span>
                              <span className="text-primary-600">{patient.currentStep}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {patient.suggestedFollowUpDate
                                ? getRelativeDateLabel(patient.suggestedFollowUpDate)
                                : '未设定复诊'}
                            </div>
                            {patient.nextContactAt && (
                              <div className="text-xs text-primary-500 mt-0.5">
                                下次联系：{formatDateCN(patient.nextContactAt)}
                              </div>
                            )}
                          </div>
                          <ContactStatusBadge status={patient.contactStatus} />
                          <ChevronRight size={16} className="text-gray-300" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(weekPatients).map(([date, list]) => {
                const d = new Date(date)
                const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
                const isToday = date === formatDate(new Date().toISOString())
                const isOverdueList = list.filter((p) => isOverdue(p.suggestedFollowUpDate))

                return (
                  <div
                    key={date}
                    className={`rounded-lg border ${
                      isToday ? 'border-accent-400 bg-accent-50/30' : 'border-warm-100 bg-white'
                    } min-h-[200px] flex flex-col`}
                  >
                    <div className={`px-3 py-2 border-b border-warm-100 ${
                      isToday ? 'bg-accent-50' : ''
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${
                          isToday ? 'text-accent-600' : 'text-gray-700'
                        }`}>
                          {dayNames[d.getDay()]}
                        </span>
                        <span className="text-xs text-gray-400">
                          {d.getMonth() + 1}/{d.getDate()}
                        </span>
                      </div>
                      {list.length > 0 && (
                        <div className="text-xs mt-0.5">
                          <span className="text-primary-500">{list.length} 位</span>
                          {isOverdueList.length > 0 && (
                            <span className="text-danger-500 ml-2">
                              {isOverdueList.length}超期
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                      {list.length === 0 ? (
                        <p className="text-xs text-gray-300 text-center py-4">无预约</p>
                      ) : (
                        list.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => navigate(`/cases/${p.id}`)}
                            className={`text-xs p-2 rounded-md cursor-pointer transition-colors hover:bg-warm-50 ${
                              isOverdue(p.suggestedFollowUpDate)
                                ? 'bg-danger-50 text-danger-600 border border-danger-100'
                                : 'bg-warm-50 text-gray-600'
                            }`}
                          >
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-[10px] opacity-75 mt-0.5 truncate">
                              {p.tooth} · {p.currentStep}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="p-4">
            <div className="flex gap-6 items-start">
              <FollowUpCalendar onSelectDate={setSelectedDate} />
              <div className="flex-1 bg-warm-50 rounded-xl p-4 min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">
                    {formatDateCN(selectedDate)} 复诊安排
                  </h3>
                  <span className="text-sm text-gray-400">{datePatients.length} 人</span>
                </div>
                {datePatients.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">该日期无复诊安排</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {datePatients.map((p) => {
                      const overdue = isOverdue(p.suggestedFollowUpDate)
                      return (
                        <div
                          key={p.id}
                          onClick={() => navigate(`/cases/${p.id}`)}
                          className={`bg-white rounded-lg p-3 border cursor-pointer transition-all hover:shadow-md ${
                            overdue ? 'border-l-4 border-l-danger-400' : 'border-warm-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-800">{p.name}</span>
                              <span className="text-xs text-gray-400 ml-2">{p.phone}</span>
                            </div>
                            {overdue && (
                              <span className="text-xs bg-danger-50 text-danger-600 px-2 py-0.5 rounded-full">
                                超期
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{getToothLabel(p.tooth)}</span>
                            <span>·</span>
                            <span className="text-primary-600">{p.currentStep}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setShowAddForm(false)}
        >
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <PatientForm onClose={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
