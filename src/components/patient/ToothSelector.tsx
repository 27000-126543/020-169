import { getToothQuadrants } from '@/utils/scripts'
import { cn } from '@/lib/utils'

interface ToothSelectorProps {
  value: string
  onChange: (val: string) => void
}

const QUADRANT_LABELS = ['上颌右侧', '上颌左侧', '下颌左侧', '下颌右侧']

export default function ToothSelector({ value, onChange }: ToothSelectorProps) {
  const quadrants = getToothQuadrants()

  return (
    <div className="space-y-2">
      {quadrants.map((q, qi) => (
        <div key={q.label} className="flex items-center gap-2">
          <span className="w-16 text-xs text-warm-500 shrink-0">{QUADRANT_LABELS[qi]}</span>
          <div className="flex gap-1">
            {Array.from({ length: 8 }, (_, i) => {
              const num = String(q.range[0] + i)
              const selected = value === num
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChange(num)}
                  className={cn(
                    'w-9 h-9 text-sm rounded-md border transition-colors',
                    selected
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-warm-500 border-warm-200 hover:border-primary-300 hover:text-primary-500'
                  )}
                >
                  {num}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
