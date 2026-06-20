import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import PatientForm from '@/components/patient/PatientForm'
import ContactStatusBadge from '@/components/patient/ContactStatusBadge'
import { getToothLabel } from '@/utils/scripts'
import { getDaysOverdue, isOverdue, getRelativeDateLabel } from '@/utils/date'
import type { TreatmentStep, ContactStatus } from '@/types'
import { Plus, Search, Filter, ChevronRight } from 'lucide-react'

export default function CasesPage() {
  const patients = useStore((s) => s.patients)
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [search, setSearch] = useState('')
  const [stepFilter, setStepFilter] = useState<TreatmentStep | ''>('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | ''>('')

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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">病例管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {patients.length} 个病例，{patients.filter((p) => p.currentStep !== '已完成').length} 个进行中</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          新增病例
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-warm-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索姓名、手机号、牙位..."
              className="w-full pl-9 pr-4 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
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
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-warm-100">
          <p className="text-gray-500">
            {patients.length === 0 ? '暂无病例，点击"新增病例"开始' : '没有匹配的病例'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((patient) => {
            const overdue = patient.currentStep !== '已完成' && isOverdue(patient.suggestedFollowUpDate)
            return (
              <div
                key={patient.id}
                onClick={() => navigate(`/cases/${patient.id}`)}
                className={`bg-white rounded-xl p-4 shadow-sm border border-warm-100 hover:shadow-md transition-shadow cursor-pointer animate-fade-in ${
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
                    <span className="text-xs text-gray-400">
                      {patient.suggestedFollowUpDate
                        ? getRelativeDateLabel(patient.suggestedFollowUpDate)
                        : '未设定复诊'}
                    </span>
                    <ContactStatusBadge status={patient.contactStatus} />
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowAddForm(false)}>
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <PatientForm onClose={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
