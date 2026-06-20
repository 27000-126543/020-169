import { useState } from 'react'
import { X } from 'lucide-react'
import type { Patient, TreatmentStep } from '@/types'
import { TREATMENT_STEPS } from '@/types'
import { useStore } from '@/store/useStore'
import { getTodayStr } from '@/utils/date'
import ToothSelector from './ToothSelector'

interface PatientFormProps {
  onClose: () => void
  editPatient?: Patient
}

export default function PatientForm({ onClose, editPatient }: PatientFormProps) {
  const addPatient = useStore((s) => s.addPatient)
  const updatePatient = useStore((s) => s.updatePatient)
  const addTreatmentStage = useStore((s) => s.addTreatmentStage)

  const [name, setName] = useState(editPatient?.name ?? '')
  const [phone, setPhone] = useState(editPatient?.phone ?? '')
  const [tooth, setTooth] = useState(editPatient?.tooth ?? '')
  const [currentStep, setCurrentStep] = useState<TreatmentStep>(editPatient?.currentStep ?? TREATMENT_STEPS[0])
  const [suggestedFollowUpDate, setSuggestedFollowUpDate] = useState(
    editPatient?.suggestedFollowUpDate ?? getTodayStr()
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editPatient) {
      updatePatient(editPatient.id, {
        name,
        phone,
        tooth,
        currentStep,
        suggestedFollowUpDate,
      })
    } else {
      const patient = addPatient({
        name,
        phone,
        tooth,
        currentStep,
        contactStatus: '待联系',
        suggestedFollowUpDate,
      })
      addTreatmentStage({
        patientId: patient.id,
        step: currentStep,
        date: getTodayStr(),
        suggestedFollowUpDate,
        notes: '',
        sealingMaterial: '',
        painLevel: '无痛',
        doctorInstructions: '',
      })
    }

    onClose()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative w-[480px] max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-warm-400 hover:text-warm-500 transition-colors"
      >
        <X size={20} />
      </button>

      <h2 className="text-lg font-semibold text-warm-500 mb-5">
        {editPatient ? '编辑患者' : '新增患者'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-warm-400 mb-1">姓名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            placeholder="请输入患者姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-400 mb-1">电话</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
            placeholder="请输入联系电话"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-400 mb-1">患牙</label>
          <ToothSelector value={tooth} onChange={setTooth} />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-400 mb-1">当前治疗步骤</label>
          <select
            value={currentStep}
            onChange={(e) => setCurrentStep(e.target.value as TreatmentStep)}
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 bg-white"
          >
            {TREATMENT_STEPS.map((step) => (
              <option key={step} value={step}>
                {step}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-400 mb-1">建议复诊日期</label>
          <input
            type="date"
            value={suggestedFollowUpDate}
            onChange={(e) => setSuggestedFollowUpDate(e.target.value)}
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          {editPatient ? '保存修改' : '添加患者'}
        </button>
      </form>
    </div>
  )
}
