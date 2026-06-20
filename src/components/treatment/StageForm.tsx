import { useState } from 'react'
import type { TreatmentStep, PainLevel } from '@/types'
import { TREATMENT_STEPS, PAIN_LEVELS } from '@/types'
import { useStore } from '@/store/useStore'
import { getTodayStr } from '@/utils/date'

interface StageFormProps {
  patientId: string
  onClose: () => void
}

export default function StageForm({ patientId, onClose }: StageFormProps) {
  const addTreatmentStage = useStore((s) => s.addTreatmentStage)

  const [step, setStep] = useState<TreatmentStep>(TREATMENT_STEPS[0])
  const [date, setDate] = useState(getTodayStr())
  const [suggestedFollowUpDate, setSuggestedFollowUpDate] = useState('')
  const [notes, setNotes] = useState('')
  const [sealingMaterial, setSealingMaterial] = useState('')
  const [painLevel, setPainLevel] = useState<PainLevel>(PAIN_LEVELS[0])
  const [doctorInstructions, setDoctorInstructions] = useState('')

  const showSealingMaterial = step.includes('封药')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addTreatmentStage({
      patientId,
      step,
      date,
      suggestedFollowUpDate,
      notes,
      sealingMaterial: showSealingMaterial ? sealingMaterial : '',
      painLevel,
      doctorInstructions,
    })
    onClose()
  }

  return (
    <div className="rounded-xl border border-warm-200 bg-white p-6 w-[480px] max-h-[90vh] overflow-y-auto shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-gray-800">添加治疗阶段</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">治疗步骤</label>
          <select
            value={step}
            onChange={(e) => setStep(e.target.value as TreatmentStep)}
            className="w-full rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
          >
            {TREATMENT_STEPS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">治疗日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">建议复诊日期</label>
          <input
            type="date"
            value={suggestedFollowUpDate}
            onChange={(e) => setSuggestedFollowUpDate(e.target.value)}
            className="w-full rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
          />
        </div>

        {showSealingMaterial && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">封药材料</label>
            <input
              type="text"
              value={sealingMaterial}
              onChange={(e) => setSealingMaterial(e.target.value)}
              placeholder="请输入封药材料"
              className="w-full rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">疼痛程度</label>
          <select
            value={painLevel}
            onChange={(e) => setPainLevel(e.target.value as PainLevel)}
            className="w-full rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
          >
            {PAIN_LEVELS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="治疗备注..."
            className="w-full resize-none rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">医嘱</label>
          <textarea
            value={doctorInstructions}
            onChange={(e) => setDoctorInstructions(e.target.value)}
            rows={2}
            placeholder="医生叮嘱..."
            className="w-full resize-none rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-warm-200 px-4 py-2 text-sm text-gray-500 hover:bg-warm-50"
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
