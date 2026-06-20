import { Check, PhoneOff, CalendarClock, AlertTriangle } from 'lucide-react'
import type { ContactStatus } from '@/types'
import { useStore } from '@/store/useStore'
import { getTodayStr } from '@/utils/date'
import { cn } from '@/lib/utils'

const ACTION_BUTTONS: {
  status: ContactStatus
  label: string
  icon: React.ElementType
  activeClass: string
  hoverClass: string
}[] = [
  {
    status: '已联系',
    label: '已联系',
    icon: Check,
    activeClass: 'bg-success-500 text-white',
    hoverClass: 'hover:bg-success-500',
  },
  {
    status: '无人接听',
    label: '无人接听',
    icon: PhoneOff,
    activeClass: 'bg-warm-400 text-white',
    hoverClass: 'hover:bg-warm-400',
  },
  {
    status: '改约',
    label: '改约',
    icon: CalendarClock,
    activeClass: 'bg-primary-500 text-white',
    hoverClass: 'hover:bg-primary-500',
  },
  {
    status: '疼痛需提前就诊',
    label: '疼痛需提前',
    icon: AlertTriangle,
    activeClass: 'bg-danger-500 text-white',
    hoverClass: 'hover:bg-danger-500',
  },
]

interface ContactActionProps {
  patientId: string
  currentStatus: ContactStatus
}

export default function ContactAction({ patientId, currentStatus }: ContactActionProps) {
  const addContactRecord = useStore((s) => s.addContactRecord)

  function handleClick(status: ContactStatus) {
    addContactRecord({
      patientId,
      status,
      contactDate: getTodayStr(),
      remark: '',
    })
  }

  return (
    <div className="flex flex-row gap-2">
      {ACTION_BUTTONS.map(({ status, label, icon: Icon, activeClass, hoverClass }) => {
        const isActive = currentStatus === status
        const IconEl = Icon

        return (
          <button
            key={status}
            onClick={() => handleClick(status)}
            className={cn(
              'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs transition-colors',
              isActive
                ? activeClass
                : cn('border border-warm-200 text-gray-600', hoverClass, 'hover:text-white')
            )}
          >
            <IconEl className="h-3.5 w-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
