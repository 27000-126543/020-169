import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { TreatmentStep, TreatmentStage } from '@/types'
import { generateContactScript, getToothChineseLabel } from '@/utils/scripts'

interface ContactScriptProps {
  patientName: string
  step: TreatmentStep
  suggestedFollowUpDate: string
  daysAgo: number
  tooth: string
  latestStage?: TreatmentStage
}

export default function ContactScript({
  patientName,
  step,
  suggestedFollowUpDate,
  daysAgo,
  tooth,
  latestStage,
}: ContactScriptProps) {
  const [copied, setCopied] = useState(false)

  const scriptText = generateContactScript({
    step,
    patientName,
    daysAgo,
    followUpDate: suggestedFollowUpDate,
    tooth,
    latestStage,
  })

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(scriptText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = scriptText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-lg bg-warm-100 p-4">
      <p className="italic text-sm leading-relaxed text-gray-700">{scriptText}</p>

      <div className="mt-3 rounded-md bg-white/70 p-3 text-xs text-warm-500">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-warm-400">牙位：</span>
            <span className="font-medium">{getToothChineseLabel(tooth)}</span>
          </div>
          <div>
            <span className="text-warm-400">封药材料：</span>
            <span className="font-medium">{latestStage?.sealingMaterial || '无'}</span>
          </div>
          <div>
            <span className="text-warm-400">上次疼痛：</span>
            <span className="font-medium">{latestStage?.painLevel || '-'}</span>
          </div>
          <div>
            <span className="text-warm-400">医嘱：</span>
            <span className="font-medium">{latestStage?.doctorInstructions || '无'}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="mt-3 flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm hover:bg-warm-50"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-success-500" />
            <span className="text-success-500">已复制</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>复制话术</span>
          </>
        )}
      </button>
    </div>
  )
}
