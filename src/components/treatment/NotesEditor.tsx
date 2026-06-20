import { useState, useEffect } from 'react'
import type { PainLevel } from '@/types'
import { useStore } from '@/store/useStore'

interface NotesEditorProps {
  patientId: string
}

export default function NotesEditor({ patientId }: NotesEditorProps) {
  const stages = useStore((s) => s.getPatientStages(patientId))
  const addTreatmentStage = useStore((s) => s.addTreatmentStage)

  const latestStage = stages[0]

  const [notes, setNotes] = useState('')
  const [sealingMaterial, setSealingMaterial] = useState('')
  const [painLevel, setPainLevel] = useState<PainLevel>('无痛')
  const [doctorInstructions, setDoctorInstructions] = useState('')

  useEffect(() => {
    if (latestStage) {
      setNotes(latestStage.notes)
      setSealingMaterial(latestStage.sealingMaterial)
      setPainLevel(latestStage.painLevel)
      setDoctorInstructions(latestStage.doctorInstructions)
    }
  }, [latestStage])

  if (!latestStage) {
    return (
      <div className="py-4 text-center text-sm text-warm-400">暂无治疗记录</div>
    )
  }

  function handleSave() {
    addTreatmentStage({
      patientId,
      step: latestStage.step,
      date: latestStage.date,
      suggestedFollowUpDate: latestStage.suggestedFollowUpDate,
      notes,
      sealingMaterial,
      painLevel,
      doctorInstructions,
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">备注</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">封药材料</label>
        <input
          type="text"
          value={sealingMaterial}
          onChange={(e) => setSealingMaterial(e.target.value)}
          className="w-full rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">疼痛程度</label>
        <input
          type="text"
          value={painLevel}
          onChange={(e) => setPainLevel(e.target.value as PainLevel)}
          className="w-full rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">医嘱</label>
        <textarea
          value={doctorInstructions}
          onChange={(e) => setDoctorInstructions(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-warm-200 bg-warm-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-primary-500"
        />
      </div>

      <button
        onClick={handleSave}
        className="rounded-md bg-primary-500 px-4 py-1.5 text-sm text-white hover:bg-primary-600"
      >
        保存
      </button>
    </div>
  )
}
