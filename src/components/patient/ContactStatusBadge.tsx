import type { ContactStatus } from '@/types'

const STATUS_STYLES: Record<ContactStatus, string> = {
  '待联系': 'bg-accent-100 text-accent-700',
  '已联系': 'bg-success-100 text-success-700',
  '无人接听': 'bg-warm-200 text-warm-500',
  '改约': 'bg-primary-100 text-primary-700',
  '疼痛需提前就诊': 'bg-danger-100 text-danger-700',
}

interface ContactStatusBadgeProps {
  status: ContactStatus
}

export default function ContactStatusBadge({ status }: ContactStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  )
}
