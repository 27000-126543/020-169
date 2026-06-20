import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { PatientCard } from '@/components/patient/PatientCard'
import ContactScript from '@/components/contact/ContactScript'
import { getDaysOverdue, getTodayStr, formatDate } from '@/utils/date'
import { ClipboardList, AlertTriangle, Phone, Users } from 'lucide-react'
import type { Patient } from '@/types'

export default function TodayPage() {
  const patients = useStore((s) => s.patients)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const activePatients = patients.filter((p) => p.currentStep !== '已完成')
  const overduePatients = activePatients
    .filter((p) => getDaysOverdue(p.suggestedFollowUpDate) > 0)
    .sort((a, b) => getDaysOverdue(b.suggestedFollowUpDate) - getDaysOverdue(a.suggestedFollowUpDate))

  const todayWaiting = activePatients.filter(
    (p) => p.contactStatus === '待联系' && getDaysOverdue(p.suggestedFollowUpDate) <= 0
  )

  const contactedToday = activePatients.filter((p) => p.contactStatus === '已联系')

  const statsCards = [
    {
      label: '超期未联系',
      value: overduePatients.filter((p) => p.contactStatus === '待联系').length,
      icon: AlertTriangle,
      color: 'text-danger-500',
      bg: 'bg-danger-50',
    },
    {
      label: '待联系',
      value: todayWaiting.length,
      icon: Phone,
      color: 'text-accent-500',
      bg: 'bg-accent-50',
    },
    {
      label: '今日已联系',
      value: contactedToday.length,
      icon: ClipboardList,
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">今日待办</h1>
        <p className="text-sm text-gray-500 mt-1">{formatDate(new Date().toISOString())} · 优先联系超期患者</p>
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
            <AlertTriangle size={18} className="text-danger-500" />
            <h2 className="text-lg font-semibold text-danger-600">超期预警</h2>
            <span className="text-xs bg-danger-50 text-danger-600 px-2 py-0.5 rounded-full">
              {overduePatients.length} 人
            </span>
          </div>
          <div className="space-y-3">
            {overduePatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onSelect={() => setSelectedPatient(patient)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={18} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-700">待联系名单</h2>
        </div>
        {todayWaiting.length === 0 && overduePatients.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-warm-100">
            <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={28} className="text-success-400" />
            </div>
            <p className="text-gray-500">所有患者都已联系</p>
            <p className="text-sm text-gray-400 mt-1">今天的跟进工作已完成</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayWaiting.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onSelect={() => setSelectedPatient(patient)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center" onClick={() => setSelectedPatient(null)}>
          <div
            className="bg-white rounded-t-2xl w-full max-w-5xl max-h-[70vh] overflow-y-auto p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedPatient.name} - 沟通话术
              </h3>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ContactScript
              patientName={selectedPatient.name}
              step={selectedPatient.currentStep}
              suggestedFollowUpDate={selectedPatient.suggestedFollowUpDate}
              daysAgo={Math.abs(getDaysOverdue(selectedPatient.suggestedFollowUpDate))}
            />
            <div className="mt-4 text-sm text-gray-500">
              <p>牙位：{selectedPatient.tooth} · 当前步骤：{selectedPatient.currentStep}</p>
              <p>建议复诊日期：{selectedPatient.suggestedFollowUpDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
