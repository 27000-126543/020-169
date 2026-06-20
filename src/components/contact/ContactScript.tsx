import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { TreatmentStep } from '@/types'
import { generateContactScript } from '@/utils/scripts'

interface ContactScriptProps {
  patientName: string
  step: TreatmentStep
  suggestedFollowUpDate: string
  daysAgo: number
}

export default function ContactScript({
  patientName,
  step,
  suggestedFollowUpDate,
  daysAgo,
}: ContactScriptProps) {
  const [copied, setCopied] = useState(false)

  const scriptText = generateContactScript(step, patientName, daysAgo, suggestedFollowUpDate)

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
