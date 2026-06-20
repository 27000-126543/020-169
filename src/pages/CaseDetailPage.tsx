import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import TreatmentTimeline from '@/components/treatment/TreatmentTimeline'
import StageForm from '@/components/treatment/StageForm'
import ContactScript from '@/components/contact/ContactScript'
import ContactModal from '@/components/contact/ContactModal'
import { getToothLabel } from '@/utils/scripts'
import {
  getDaysOverdue,
  isOverdue,
  getRelativeDateLabel,
  formatDate,
  formatDateCN,
  formatDateTimeCN,
} from '@/utils/date'
import {
  ArrowLeft,
  Plus,
  Phone,
  Trash2,
  AlertTriangle,
  MessageSquare,
  CalendarClock,
  Clock,
  PhoneOff,
  CheckCircle,
} from 'lucide-react'

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const patients = useStore((s) => s.patients)
  const deletePatient = useStore((s) => s.deletePatient)
  const getPatientLatestStage = useStore((s) => s.getPatientLatestStage)
  const getPatientRecords = useStore((s) => s.getPatientRecords)
  const [showStageForm, setShowStageForm] = useState(false)
  const [showScript, setShowScript] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const patient = patients.find((p) => p.id === id)
  const latestStage = patient ? getPatientLatestStage(patient.id) : undefined
  const contactRecords = patient ? getPatientRecords(patient.id) : []

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-500">病例不存在</p>
        <button
          onClick={() => navigate('/cases')}
          className="mt-4 text-primary-500 hover:underline"
        >
          返回病例列表
        </button>
      </div>
    )
  }

  const overdue = patient.currentStep !== '已完成' && isOverdue(patient.suggestedFollowUpDate)
  const daysOverdue = getDaysOverdue(patient.suggestedFollowUpDate)

  const handleDelete = () => {
    deletePatient(patient.id)
    navigate('/cases')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已联系': return <CheckCircle size={14} className="text-success-500" />
      case '无人接听': return <PhoneOff size={14} className="text-warm-500" />
      case '改约': return <CalendarClock size={14} className="text-primary-500" />
      case '疼痛需提前就诊': return <AlertTriangle size={14} className="text-danger-500" />
      default: return <Clock size={14} className="text-accent-500" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/cases')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        返回病例列表
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-100 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
              {overdue && (
                <span className="text-xs bg-danger-50 text-danger-600 px-2.5 py-1 rounded-full font-medium animate-breathe flex items-center gap-1">
                  <AlertTriangle size={12} />
                  超期{daysOverdue}天
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Phone size={14} />
                {patient.phone}
              </span>
              <span>牙位：{getToothLabel(patient.tooth)}</span>
              <span>当前步骤：<span className="text-primary-600 font-medium">{patient.currentStep}</span></span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">建议复诊：</span>
                <span className={overdue ? 'text-danger-500 font-medium' : 'text-gray-700'}>
                  {patient.suggestedFollowUpDate || '未设定'}
                  {patient.suggestedFollowUpDate && (
                    <span className="text-gray-400 ml-1">({getRelativeDateLabel(patient.suggestedFollowUpDate)})</span>
                  )}
                </span>
              </div>
              {patient.nextContactAt && (
                <div className="flex items-center gap-1 text-primary-500">
                  <Clock size={14} />
                  下次联系：{formatDateTimeCN(patient.nextContactAt)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScript(!showScript)}
              className="flex items-center gap-1.5 text-sm text-primary-500 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <MessageSquare size={14} />
              沟通话术
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-1.5 text-sm text-success-500 bg-success-50 px-3 py-1.5 rounded-lg hover:bg-success-100 transition-colors"
            >
              <Phone size={14} />
              记录联系
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-sm text-danger-500 bg-danger-50 px-3 py-1.5 rounded-lg hover:bg-danger-100 transition-colors"
            >
              <Trash2 size={14} />
              删除
            </button>
          </div>
        </div>

        {showScript && (
          <div className="mt-4 animate-fade-in">
            <ContactScript
              patientName={patient.name}
              step={patient.currentStep}
              suggestedFollowUpDate={patient.suggestedFollowUpDate}
              daysAgo={Math.abs(daysOverdue)}
              tooth={patient.tooth}
              latestStage={latestStage}
            />
          </div>
        )}
      </div>

      {contactRecords.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Phone size={16} className="text-primary-500" />
            联系记录
          </h3>
          <div className="space-y-3">
            {contactRecords.map((record) => (
              <div key={record.id} className="bg-warm-50 rounded-lg p-3 border border-warm-100">
                <div className="flex items-center gap-2 mb-1.5">
                  {getStatusIcon(record.status)}
                  <span className="text-sm font-medium text-gray-700">{record.status}</span>
                  <span className="text-xs text-gray-400 ml-auto">{formatDateCN(record.contactDate)}</span>
                </div>
                {record.callNotes && (
                  <p className="text-sm text-gray-600 pl-6">{record.callNotes}</p>
                )}
                <div className="flex flex-wrap gap-3 pl-6 mt-1.5">
                  {record.nextContactAt && (
                    <span className="text-xs text-primary-500 flex items-center gap-1">
                      <Clock size={12} />
                      下次联系：{formatDateTimeCN(record.nextContactAt)}
                    </span>
                  )}
                  {record.rescheduledFollowUpDate && (
                    <span className="text-xs text-accent-500 flex items-center gap-1">
                      <CalendarClock size={12} />
                      新复诊日期：{record.rescheduledFollowUpDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">治疗记录</h2>
        <button
          onClick={() => setShowStageForm(true)}
          className="flex items-center gap-1.5 text-sm bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          新增阶段
        </button>
      </div>

      <TreatmentTimeline patientId={patient.id} />

      {showStageForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowStageForm(false)}>
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <StageForm patientId={patient.id} onClose={() => setShowStageForm(false)} />
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowContactModal(false)}>
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <ContactModal
              patientId={patient.id}
              patientName={patient.name}
              onClose={() => setShowContactModal(false)}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-4">
              确定要删除 {patient.name} 的病例吗？此操作不可恢复。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 bg-warm-100 rounded-lg hover:bg-warm-200"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-white bg-danger-500 rounded-lg hover:bg-danger-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
