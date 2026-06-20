import { useState } from 'react'
import { useStore } from '@/store/useStore'
import PatientCard from '@/components/patient/PatientCard'
import ContactScript from '@/components/contact/ContactScript'
import ContactModal from '@/components/contact/ContactModal'
import ContactQueue from '@/components/contact/ContactQueue'
import { getDaysOverdue, formatDate, getRelativeDateLabel } from '@/utils/date'
import { AlertTriangle, Phone, CheckCircle, Users, ChevronDown, ChevronUp, ListOrdered, LayoutList } from 'lucide-react'
import type { Patient } from '@/types'

type ViewMode = 'list' | 'queue'

export default function TodayPage() {
  const getOverduePatients = useStore((s) => s.getOverduePatients)
  const getTodayDuePatients = useStore((s) => s.getTodayDuePatients)
  const getFuturePatients = useStore((s) => s.getFuturePatients)
  const getQueuePatients = useStore((s) => s.getQueuePatients)
  const getPatientLatestStage = useStore((s) => s.getPatientLatestStage)
  const patients = useStore((s) => s.patients)

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedScriptPatient, setSelectedScriptPatient] = useState<Patient | null>(null)
  const [selectedContactPatient, setSelectedContactPatient] = useState<Patient | null>(null)
  const [futureExpanded, setFutureExpanded] = useState(false)

  const overduePatients = getOverduePatients()
  const todayPatients = getTodayDuePatients()
  const futurePatients = getFuturePatients()
  const queuePatients = getQueuePatients()
  const activePatients = patients.filter((p) => p.currentStep !== '已完成')

  const statsCards = [
    {
      label: '超期待联系',
      value: overduePatients.filter((p) => p.contactStatus !== '已联系').length,
      icon: AlertTriangle,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
    },
    {
      label: '今日应联系',
      value: todayPatients.length,
      icon: Phone,
      color: 'text-accent-500',
      bg: 'bg-accent-50',
    },
    {
      label: '今日已完成',
      value: activePatients.filter((p) => p.contactStatus === '已联系').length,
      icon: CheckCircle,
      color: 'text-success-500',
      bg: 'bg-success-50',
    },
    {
      label: '进行中病例',
      value: activePatients.length,
      icon: Users,
      color: 'text-primary-500',
      bg: 'bg-primary-50',
    },
  ]

  const showQueue = viewMode === 'queue'

  if (showQueue) {
    return <ContactQueue onExit={() => setViewMode('list')} />
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">今日跟进工作台</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(new Date().toISOString())} · 先处理超期，再处理到期，最后处理今日计划
          </p>
        </div>
        <div className="flex items-center gap-1 bg-warm-50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              !showQueue ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutList size={14} />
            列表视图
          </button>
          <button
            onClick={() => setViewMode('queue')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              showQueue ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ListOrdered size={14} />
            电话队列
            {queuePatients.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary-100 text-primary-600 rounded-full">
                {queuePatients.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-warm-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
            </div>
            <div className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {overduePatients.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-danger-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-danger-500" />
            </div>
            <h2 className="text-lg font-semibold text-danger-600">超期未复诊</h2>
            <span className="text-xs bg-danger-50 text-danger-600 px-2.5 py-0.5 rounded-full font-medium">
              {overduePatients.length} 人需尽快联系
            </span>
          </div>
          <div className="space-y-3">
            {overduePatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onSelect={() => setSelectedScriptPatient(patient)}
                onContact={() => setSelectedContactPatient(patient)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
            <Phone size={16} className="text-accent-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">今日应联系</h2>
          <span className="text-xs bg-accent-50 text-accent-600 px-2.5 py-0.5 rounded-full font-medium">
            {todayPatients.length} 人
          </span>
        </div>
        {todayPatients.length === 0 && overduePatients.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-warm-100">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-success-400" />
            </div>
            <p className="text-gray-600 font-medium">今天的联系任务已完成</p>
            <p className="text-sm text-gray-400 mt-1">可以查看下方未来预约或去录入新病例</p>
          </div>
        ) : todayPatients.length === 0 ? null : (
          <div className="space-y-3">
            {todayPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onSelect={() => setSelectedScriptPatient(patient)}
                onContact={() => setSelectedContactPatient(patient)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <button
          onClick={() => setFutureExpanded(!futureExpanded)}
          className="flex items-center gap-2 mb-4 w-full text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Users size={16} className="text-primary-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">未来预约</h2>
          <span className="text-xs bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full font-medium">
            {futurePatients.length} 人
          </span>
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            {futureExpanded ? '收起' : '展开查看'}
            {futureExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {futureExpanded && (
          <div className="bg-white rounded-xl shadow-sm border border-warm-100 overflow-hidden animate-fade-in">
            <table className="w-full text-sm">
              <thead className="bg-warm-50 border-b border-warm-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">患者</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">牙位</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">当前步骤</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">复诊日期</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {futurePatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-warm-100 last:border-0 hover:bg-warm-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{patient.name}</td>
                    <td className="px-4 py-3 text-gray-600">{patient.tooth}</td>
                    <td className="px-4 py-3 text-primary-600">{patient.currentStep}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {getRelativeDateLabel(patient.suggestedFollowUpDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        patient.contactStatus === '待联系' ? 'bg-accent-50 text-accent-600' :
                        patient.contactStatus === '已联系' ? 'bg-success-50 text-success-600' :
                        patient.contactStatus === '改约' ? 'bg-primary-50 text-primary-600' :
                        'bg-warm-100 text-warm-500'
                      }`}>
                        {patient.contactStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedScriptPatient && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center"
          onClick={() => setSelectedScriptPatient(null)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-4xl max-h-[75vh] overflow-y-auto p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedScriptPatient.name} - 沟通话术
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedScriptPatient(null)
                    setSelectedContactPatient(selectedScriptPatient)
                  }}
                  className="text-sm text-primary-500 hover:text-primary-600"
                >
                  去记录联系结果
                </button>
                <button
                  onClick={() => setSelectedScriptPatient(null)}
                  className="text-gray-400 hover:text-gray-600 px-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <ContactScript
              patientName={selectedScriptPatient.name}
              step={selectedScriptPatient.currentStep}
              suggestedFollowUpDate={selectedScriptPatient.suggestedFollowUpDate}
              daysAgo={Math.abs(getDaysOverdue(selectedScriptPatient.suggestedFollowUpDate))}
              tooth={selectedScriptPatient.tooth}
              latestStage={getPatientLatestStage(selectedScriptPatient.id)}
            />
            <div className="mt-4 flex gap-3 text-sm">
              <div className="px-3 py-1.5 bg-warm-50 rounded-lg">
                <span className="text-gray-400">牙位：</span>
                <span className="text-gray-700">{selectedScriptPatient.tooth}</span>
              </div>
              <div className="px-3 py-1.5 bg-warm-50 rounded-lg">
                <span className="text-gray-400">步骤：</span>
                <span className="text-primary-600">{selectedScriptPatient.currentStep}</span>
              </div>
              <div className="px-3 py-1.5 bg-warm-50 rounded-lg">
                <span className="text-gray-400">复诊：</span>
                <span className="text-gray-700">{selectedScriptPatient.suggestedFollowUpDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedContactPatient && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          onClick={() => setSelectedContactPatient(null)}
        >
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <ContactModal
              patientId={selectedContactPatient.id}
              patientName={selectedContactPatient.name}
              onClose={() => setSelectedContactPatient(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
