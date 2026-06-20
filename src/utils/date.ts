export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const datePart = formatDate(dateStr)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${datePart} ${h}:${min}`
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

export function formatDateCN(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatDateTimeCN(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const datePart = formatDateCN(dateStr)
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${datePart} ${h}:${min}`
}

export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  if (!dateStr1 || !dateStr2) return false
  const d1 = new Date(dateStr1)
  const d2 = new Date(dateStr2)
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
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

export function isTodayOrPast(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  return d.getTime() <= now.getTime()
}

export function getTodayStr(): string {
  return formatDate(new Date().toISOString())
}

export function getTodayDateTimeStr(): string {
  return new Date().toISOString()
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export function getRelativeDateLabel(dateStr: string): string {
  if (!dateStr) return ''
  const days = getDaysOverdue(dateStr)
  if (days > 0) return `已超期${days}天`
  if (days === 0) return '今日复诊'
  if (days === -1) return '明日复诊'
  return `${Math.abs(days)}天后复诊`
}

export function getRelativeDateTimeLabel(dateTimeStr: string): string {
  if (!dateTimeStr) return ''
  const days = getDaysOverdue(dateTimeStr)
  const time = formatTime(dateTimeStr)
  if (days > 0) return `已超期${days}天 ${time}`
  if (days === 0) return `今日 ${time}`
  if (days === -1) return `明日 ${time}`
  return `${Math.abs(days)}天后 ${time}`
}

export function combineDateAndTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return ''
  if (!timeStr) return new Date(dateStr).toISOString()
  const d = new Date(dateStr)
  const [h, min] = timeStr.split(':').map(Number)
  d.setHours(h || 0, min || 0, 0, 0)
  return d.toISOString()
}
