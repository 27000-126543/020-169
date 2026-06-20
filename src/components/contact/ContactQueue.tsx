import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import ContactScript from '@/components/contact/ContactScript'
import ContactModal from '@/components/contact/ContactModal'
import {
  AlertTriangle,
  Phone,
  CheckCircle,
  SkipForward,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Patient } from '@/types'
import { formatDateTimeCN, getDaysOverdue } from '@/utils/date'
import { getToothLabel } from '@/utils/scripts'

type QueuePatient = Patient & { priority?: number; sortTime?: number }

interface ContactQueueProps {
  startIndex?: number
  onExit: () => void
}

export default function ContactQueue({ startIndex = 0, onExit }: ContactQueueProps) {
  const queue = useStore((s) => s.getQueuePatients()) as QueuePatient[]
  const getPatientLatestStage = useStore((s) => s.getPatientLatestStage)
  const getPatientLatestRecord = useStore((s) => s.getPatientLatestRecord)

  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [showScript, setShowScript] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    if (currentIndex >= queue.length && queue.length > 0) {
      setCurrentIndex(queue.length - 1)
    }
  }, [queue.length, currentIndex])

  const currentPatient = queue[currentIndex] as QueuePatient

  if (queue.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-success-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">今日电话队列已完成</h3>
          <p className="text-gray-500 mb-6">没有需要联系的患者了</p>
          <button
            onClick={onExit}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            返回工作台
          </button>
        </div>
      </div>
    )
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowScript(false)
      setShowContactModal(false)
    }
  }

  function handleNext() {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowScript(false)
      setShowContactModal(false)
    } else {
      onExit()
    }
  }

  function handleContactComplete() {
    handleNext()
  }

  function getPriorityLabel(p: Patient & { priority?: number }) {
    if (p.priority === 1) return { label: '超期优先', color: 'text-danger-600 bg-danger-50' }
    if (p.priority === 2) return { label: '约定回电', color: 'text-accent-600 bg-accent-50' }
    return { label: '今日复诊', color: 'text-primary-600 bg-primary-50' }
  }

  return (
    <div className="fixed inset-0 z-50 bg-warm-50 flex flex-col">
      <div className="bg-white border-b border-warm-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← 返回工作台
            </button>
            <div className="h-5 w-px bg-warm-200" />
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-primary-500" />
              <h2 className="text-lg font-bold text-gray-800">电话跟进队列</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              第 <span className="font-bold text-primary-600">{currentIndex + 1}</span> / 共 {queue.length} 位
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {currentPatient && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-warm-100 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">{currentPatient.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityLabel(currentPatient).color}`}>
                        {getPriorityLabel(currentPatient).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <span>{getToothLabel(currentPatient.tooth)}</span>
                      <span>·</span>
                      <span>{currentPatient.phone}</span>
                      <span>·</span>
                      <span className="text-primary-600 font-medium">{currentPatient.currentStep}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {currentPatient.priority === 1 && (
                      <div className="flex items-center gap-1.5 text-danger-600 mb-1">
                        <AlertTriangle size={16} />
                        <span className="font-medium">超期{getDaysOverdue(currentPatient.suggestedFollowUpDate)}天</span>
                      </div>
                    )}
                    {currentPatient.nextContactAt && (
                      <div className="text-sm text-gray-600">
                        约定：{formatDateTimeCN(currentPatient.nextContactAt)}
                      </div>
                    )}
                    <div className="text-sm text-gray-400 mt-1">
                      建议复诊：{currentPatient.suggestedFollowUpDate}
                    </div>
                  </div>
                </div>

                {(() => {
                  const latestRecord = getPatientLatestRecord(currentPatient.id)
                  if (latestRecord?.callNotes) {
                    return (
                      <div className="bg-warm-50 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                          <MessageSquare size={16} className="text-warm-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-warm-400 mb-1">上次联系备注</div>
                            <p className="text-sm text-warm-600">{latestRecord.callNotes}</p>
                            {latestRecord.nextContactAt && (
                              <p className="text-xs text-primary-500 mt-1">
                                约好：{formatDateTimeCN(latestRecord.nextContactAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {!showScript && !showContactModal && (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setShowScript(true)}
                      className="flex flex-col items-center gap-2 py-4 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors"
                    >
                      <MessageSquare size={24} />
                      <span className="text-sm font-medium">查看话术</span>
                    </button>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="flex flex-col items-center gap-2 py-4 rounded-xl bg-success-50 hover:bg-success-100 text-success-600 transition-colors"
                    >
                      <Phone size={24} />
                      <span className="text-sm font-medium">记录联系</span>
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex flex-col items-center gap-2 py-4 rounded-xl bg-warm-50 hover:bg-warm-100 text-warm-500 transition-colors"
                    >
                      <SkipForward size={24} />
                      <span className="text-sm font-medium">跳过</span>
                    </button>
                  </div>
                )}
              </div>

              {showScript && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-700">沟通话术</h4>
                    <button
                      onClick={() => setShowScript(false)}
                      className="text-sm text-gray-400 hover:text-gray-600"
                    >
                      收起
                    </button>
                  </div>
                  <ContactScript
                    patientName={currentPatient.name}
                    step={currentPatient.currentStep}
                    suggestedFollowUpDate={currentPatient.suggestedFollowUpDate}
                    daysAgo={Math.abs(getDaysOverdue(currentPatient.suggestedFollowUpDate))}
                    tooth={currentPatient.tooth}
                    latestStage={getPatientLatestStage(currentPatient.id)}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setShowScript(false)
                        setShowContactModal(true)
                      }}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                    >
                      去记录联系结果 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-warm-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-warm-200 text-warm-500 hover:bg-warm-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
            上一位
          </button>
          <div className="flex items-center gap-1">
            {queue.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex
                    ? 'bg-primary-500'
                    : idx < currentIndex
                    ? 'bg-success-400'
                    : 'bg-warm-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            {currentIndex === queue.length - 1 ? '完成队列' : '下一位'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {showContactModal && currentPatient && (
        <ContactModal
          patientId={currentPatient.id}
          patientName={currentPatient.name}
          onClose={() => setShowContactModal(false)}
          onComplete={handleContactComplete}
        />
      )}
    </div>
  )
}
