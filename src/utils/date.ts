export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateCN(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function getDaysOverdue(dateStr: string): number {
  if (!dateStr) return 0
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
}

export function isOverdue(dateStr: string): boolean {
  return getDaysOverdue(dateStr) > 0
}

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
}

export function getTodayStr(): string {
  return formatDate(new Date().toISOString())
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export function getRelativeDateLabel(dateStr: string): string {
  const days = getDaysOverdue(dateStr)
  if (days > 0) return `已超期${days}天`
  if (days === 0) return '今日复诊'
  if (days === -1) return '明日复诊'
  return `${Math.abs(days)}天后复诊`
}
