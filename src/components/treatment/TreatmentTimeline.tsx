import type { TreatmentStep } from '@/types'
import { useStore } from '@/store/useStore'
import { formatDateCN } from '@/utils/date'
import { cn } from '@/lib/utils'

const STEP_DOT_COLORS: Record<TreatmentStep, string> = {
  开髓引流: 'bg-accent-500',
  已封药待复诊: 'bg-primary-400',
  已预备待充填: 'bg-primary-500',
  已充填待冠修复: 'bg-success-400',
  已完成: 'bg-success-600',
}

interface TreatmentTimelineProps {
  patientId: string
}

export default function TreatmentTimeline({ patientId }: TreatmentTimelineProps) {
  const stages = useStore((s) => s.getPatientStages(patientId))

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-warm-400">
        <p className="text-sm">暂无治疗记录</p>
        <p className="mt-1 text-xs">添加第一条治疗阶段以开始追踪</p>
      </div>
    )
  }

  return (
    <div className="relative pl-6">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1
        const dotColor = STEP_DOT_COLORS[stage.step]

        return (
          <div key={stage.id} className="relative pb-6 last:pb-0">
            <div
              className={cn(
                'absolute left-[-20px] top-1 h-3 w-3 rounded-full',
                dotColor
              )}
            />
            {!isLast && (
              <div className="absolute left-[-17px] top-4 h-full w-[2px] bg-warm-200" />
            )}

            <div className="ml-2 rounded-lg border border-warm-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">{stage.step}</span>
                <span className="text-xs text-gray-400">{formatDateCN(stage.date)}</span>
              </div>

              {stage.painLevel && (
                <p className="mt-2 text-xs text-gray-500">
                  疼痛程度：<span className="text-gray-700">{stage.painLevel}</span>
                </p>
              )}

              {stage.sealingMaterial && (
                <p className="mt-1 text-xs text-gray-500">
                  封药材料：<span className="text-gray-700">{stage.sealingMaterial}</span>
                </p>
              )}

              {stage.notes && (
                <p className="mt-2 text-sm text-gray-600">{stage.notes}</p>
              )}

              {stage.doctorInstructions && (
                <p className="mt-2 text-xs text-primary-600">
                  医嘱：{stage.doctorInstructions}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
