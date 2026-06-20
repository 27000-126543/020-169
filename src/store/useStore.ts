import { create } from 'zustand'
import type { Patient, TreatmentStage, ContactRecord, TreatmentStep, ContactStatus, Staff } from '@/types'
import { DEFAULT_STAFFS } from '@/types'
import { getDaysOverdue, formatDate, formatTime, isOverdue } from '@/utils/date'

const STORAGE_KEY = 'root-canal-tracker'

interface StoreData {
  patients: Patient[]
  treatmentStages: TreatmentStage[]
  contactRecords: ContactRecord[]
  staffs: Staff[]
}

function loadData(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* empty */ }
  return generateSeedData()
}

function generateSeedData(): StoreData {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const threeDaysAgo = new Date(now.getTime() - 3 * 86400000).toISOString().split('T')[0]
  const fiveDaysAgo = new Date(now.getTime() - 5 * 86400000).toISOString().split('T')[0]
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]
  const twoDaysLater = new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0]
  const threeDaysLater = new Date(now.getTime() + 3 * 86400000).toISOString().split('T')[0]
  const fiveDaysLater = new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

  const todayMorning = new Date()
  todayMorning.setHours(9, 30, 0, 0)
  const todayAfternoon = new Date()
  todayAfternoon.setHours(15, 30, 0, 0)

  const patients: Patient[] = [
    { id: 'seed1', name: '王建华', phone: '13800138001', tooth: '16', currentStep: '已封药待复诊', contactStatus: '待联系', suggestedFollowUpDate: fiveDaysAgo, assignedTo: 'staff1', createdAt: sevenDaysAgo, updatedAt: threeDaysAgo },
    { id: 'seed2', name: '李美玲', phone: '13900139002', tooth: '36', currentStep: '已预备待充填', contactStatus: '待联系', suggestedFollowUpDate: threeDaysAgo, assignedTo: 'staff1', createdAt: sevenDaysAgo, updatedAt: threeDaysAgo },
    { id: 'seed5', name: '刘大明', phone: '13500135005', tooth: '14', currentStep: '开髓引流', contactStatus: '无人接听', suggestedFollowUpDate: yesterday, nextContactAt: todayAfternoon.toISOString(), assignedTo: 'staff2', createdAt: threeDaysAgo, updatedAt: yesterday },
    { id: 'seed6', name: '赵雅芳', phone: '13400134006', tooth: '26', currentStep: '已封药待复诊', contactStatus: '待联系', suggestedFollowUpDate: today, assignedTo: 'staff2', createdAt: fiveDaysAgo, updatedAt: twoDaysLater },
    { id: 'seed7', name: '钱建国', phone: '13300133007', tooth: '46', currentStep: '已预备待充填', contactStatus: '待联系', suggestedFollowUpDate: today, assignedTo: 'staff3', createdAt: fiveDaysAgo, updatedAt: twoDaysLater },
    { id: 'seed3', name: '张伟', phone: '13700137003', tooth: '24', currentStep: '已封药待复诊', contactStatus: '改约', suggestedFollowUpDate: twoDaysLater, assignedTo: 'staff1', createdAt: fiveDaysAgo, updatedAt: yesterday },
    { id: 'seed8', name: '孙丽华', phone: '13200132008', tooth: '37', currentStep: '已充填待冠修复', contactStatus: '待联系', suggestedFollowUpDate: threeDaysLater, assignedTo: 'staff2', createdAt: sevenDaysAgo, updatedAt: yesterday },
    { id: 'seed4', name: '陈晓红', phone: '13600136004', tooth: '47', currentStep: '已充填待冠修复', contactStatus: '待联系', suggestedFollowUpDate: fiveDaysLater, assignedTo: 'staff3', createdAt: sevenDaysAgo, updatedAt: yesterday },
  ]

  const treatmentStages: TreatmentStage[] = [
    { id: 'ts1', patientId: 'seed1', step: '开髓引流', date: sevenDaysAgo, suggestedFollowUpDate: fiveDaysAgo, notes: '急性牙髓炎，开髓引流', sealingMaterial: '', painLevel: '剧烈', doctorInstructions: '观察引流情况，3天后复诊封药', createdAt: sevenDaysAgo },
    { id: 'ts2', patientId: 'seed1', step: '已封药待复诊', date: threeDaysAgo, suggestedFollowUpDate: fiveDaysAgo, notes: '封药后疼痛明显缓解', sealingMaterial: '氢氧化钙', painLevel: '轻微', doctorInstructions: '按时复诊进行根管预备', createdAt: threeDaysAgo },
    { id: 'ts3', patientId: 'seed2', step: '开髓引流', date: sevenDaysAgo, suggestedFollowUpDate: fiveDaysAgo, notes: '慢性根尖周炎', sealingMaterial: '', painLevel: '中度', doctorInstructions: '复诊进行根管预备', createdAt: sevenDaysAgo },
    { id: 'ts4', patientId: 'seed2', step: '已封药待复诊', date: fiveDaysAgo, suggestedFollowUpDate: threeDaysAgo, notes: '封药观察', sealingMaterial: '甲醛甲酚', painLevel: '轻微', doctorInstructions: '', createdAt: fiveDaysAgo },
    { id: 'ts5', patientId: 'seed2', step: '已预备待充填', date: threeDaysAgo, suggestedFollowUpDate: threeDaysAgo, notes: '根管预备完成，工作长度确定', sealingMaterial: '', painLevel: '无痛', doctorInstructions: '尽快安排充填', createdAt: threeDaysAgo },
    { id: 'ts6', patientId: 'seed3', step: '开髓引流', date: fiveDaysAgo, suggestedFollowUpDate: threeDaysAgo, notes: '', sealingMaterial: '', painLevel: '中度', doctorInstructions: '', createdAt: fiveDaysAgo },
    { id: 'ts7', patientId: 'seed3', step: '已封药待复诊', date: threeDaysAgo, suggestedFollowUpDate: twoDaysLater, notes: '封药后反应良好', sealingMaterial: '氢氧化钙', painLevel: '无痛', doctorInstructions: '2天后复诊', createdAt: threeDaysAgo },
    { id: 'ts8', patientId: 'seed4', step: '开髓引流', date: sevenDaysAgo, suggestedFollowUpDate: fiveDaysAgo, notes: '', sealingMaterial: '', painLevel: '剧烈', doctorInstructions: '', createdAt: sevenDaysAgo },
    { id: 'ts9', patientId: 'seed4', step: '已封药待复诊', date: fiveDaysAgo, suggestedFollowUpDate: threeDaysAgo, notes: '', sealingMaterial: '甲醛甲酚', painLevel: '轻微', doctorInstructions: '', createdAt: fiveDaysAgo },
    { id: 'ts10', patientId: 'seed4', step: '已预备待充填', date: threeDaysAgo, suggestedFollowUpDate: yesterday, notes: '根管预备完成', sealingMaterial: '', painLevel: '无痛', doctorInstructions: '', createdAt: threeDaysAgo },
    { id: 'ts11', patientId: 'seed4', step: '已充填待冠修复', date: yesterday, suggestedFollowUpDate: fiveDaysLater, notes: '根管充填完成', sealingMaterial: '', painLevel: '无痛', doctorInstructions: '建议2周内安排牙冠修复', createdAt: yesterday },
    { id: 'ts12', patientId: 'seed5', step: '开髓引流', date: threeDaysAgo, suggestedFollowUpDate: yesterday, notes: '急性根尖周脓肿', sealingMaterial: '', painLevel: '剧烈', doctorInstructions: '引流后观察，复诊封药', createdAt: threeDaysAgo },
    { id: 'ts13', patientId: 'seed6', step: '开髓引流', date: fiveDaysAgo, suggestedFollowUpDate: twoDaysLater, notes: '右上6牙髓炎', sealingMaterial: '', painLevel: '中度', doctorInstructions: '', createdAt: fiveDaysAgo },
    { id: 'ts14', patientId: 'seed6', step: '已封药待复诊', date: twoDaysLater, suggestedFollowUpDate: today, notes: '封药情况良好', sealingMaterial: '氢氧化钙', painLevel: '轻微', doctorInstructions: '今日复诊预备', createdAt: twoDaysLater },
    { id: 'ts15', patientId: 'seed7', step: '开髓引流', date: fiveDaysAgo, suggestedFollowUpDate: twoDaysLater, notes: '', sealingMaterial: '', painLevel: '剧烈', doctorInstructions: '', createdAt: fiveDaysAgo },
    { id: 'ts16', patientId: 'seed7', step: '已封药待复诊', date: twoDaysLater, suggestedFollowUpDate: today, notes: '', sealingMaterial: '甲醛甲酚', painLevel: '无痛', doctorInstructions: '', createdAt: twoDaysLater },
    { id: 'ts17', patientId: 'seed8', step: '开髓引流', date: sevenDaysAgo, suggestedFollowUpDate: fiveDaysAgo, notes: '', sealingMaterial: '', painLevel: '中度', doctorInstructions: '', createdAt: sevenDaysAgo },
    { id: 'ts18', patientId: 'seed8', step: '已封药待复诊', date: fiveDaysAgo, suggestedFollowUpDate: threeDaysLater, notes: '', sealingMaterial: '氢氧化钙', painLevel: '轻微', doctorInstructions: '', createdAt: fiveDaysAgo },
    { id: 'ts19', patientId: 'seed8', step: '已充填待冠修复', date: yesterday, suggestedFollowUpDate: threeDaysLater, notes: '根充完成，X线显示恰填', sealingMaterial: '', painLevel: '无痛', doctorInstructions: '注意勿咬硬物，建议做冠保护', createdAt: yesterday },
  ]

  const contactRecords: ContactRecord[] = [
    { id: 'cr1', patientId: 'seed3', status: '改约', contactDate: yesterday, remark: '', callNotes: '患者出差，改约到后天', nextContactAt: new Date(new Date(twoDaysLater).setHours(10, 0, 0, 0)).toISOString(), rescheduledFollowUpDate: twoDaysLater },
    { id: 'cr2', patientId: 'seed5', status: '无人接听', contactDate: yesterday, remark: '', callNotes: '上午未接，下午15:30再打', nextContactAt: todayAfternoon.toISOString() },
  ]

  return { patients, treatmentStages, contactRecords, staffs: [...DEFAULT_STAFFS] }
}

function saveData(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

interface RootCanalStore extends StoreData {
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Patient
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void
  assignPatient: (patientId: string, staffId: string | undefined) => void

  addTreatmentStage: (stage: Omit<TreatmentStage, 'id' | 'createdAt'>) => TreatmentStage

  addContactRecord: (record: Omit<ContactRecord, 'id'>) => void

  getOverduePatients: () => Patient[]
  getTodayDuePatients: () => Patient[]
  getFuturePatients: () => Patient[]
  getPendingContactToday: () => Patient[]
  getQueuePatients: (targetDate?: string, staffId?: string) => Patient[]
  getPatientsByStep: (step: TreatmentStep) => Patient[]
  getPatientsByDate: (date: string) => Patient[]
  getPatientsByDateRange: (startDate: string, endDate: string) => Patient[]
  getPatientStages: (patientId: string) => TreatmentStage[]
  getPatientLatestStage: (patientId: string) => TreatmentStage | undefined
  getPatientRecords: (patientId: string) => ContactRecord[]
  getPatientLatestRecord: (patientId: string) => ContactRecord | undefined
  hasContactOnDate: (patientId: string, date: string) => boolean
  getWeeklySummary: () => Array<{
    date: string
    total: number
    followUpCount: number
    callbackCount: number
    completedCount: number
    overdueCount: number
    rescheduledCount: number
  }>
  getDailyScheduleByStaff: (date: string) => Array<{
    staffId: string
    staffName: string
    staffColor: string
    morning: Patient[]
    afternoon: Patient[]
    evening: Patient[]
    total: number
  }>
  getFollowUpTimeline: (patientId: string) => Array<{
    type: 'stage' | 'contact' | 'nextContact' | 'followUp'
    date: string
    title: string
    description?: string
  }>

  addStaff: (staff: Omit<Staff, 'id'>) => Staff
  updateStaff: (id: string, updates: Partial<Staff>) => void
  toggleStaffActive: (id: string) => void

  exportData: () => string
  importData: (json: string) => boolean
}

export const useStore = create<RootCanalStore>((set, get) => ({
  ...loadData(),

  addPatient: (patientData) => {
    const now = new Date().toISOString()
    const patient: Patient = {
      ...patientData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    set((state) => {
      const newState = { patients: [...state.patients, patient] }
      saveData({ ...state, ...newState })
      return newState
    })
    return patient
  },

  updatePatient: (id, updates) => {
    set((state) => {
      const newState = {
        patients: state.patients.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
      }
      saveData({ ...state, ...newState })
      return newState
    })
  },

  deletePatient: (id) => {
    set((state) => {
      const newState = {
        patients: state.patients.filter((p) => p.id !== id),
        treatmentStages: state.treatmentStages.filter((s) => s.patientId !== id),
        contactRecords: state.contactRecords.filter((r) => r.patientId !== id),
      }
      saveData({ ...state, ...newState })
      return newState
    })
  },

  addTreatmentStage: (stageData) => {
    const stage: TreatmentStage = {
      ...stageData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const newState = {
        treatmentStages: [...state.treatmentStages, stage],
        patients: state.patients.map((p) =>
          p.id === stageData.patientId
            ? {
                ...p,
                currentStep: stageData.step,
                suggestedFollowUpDate: stageData.suggestedFollowUpDate || p.suggestedFollowUpDate,
                contactStatus: '待联系' as ContactStatus,
                nextContactAt: undefined,
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }
      saveData({ ...state, ...newState })
      return newState
    })
    return stage
  },

  addContactRecord: (recordData) => {
    const record: ContactRecord = { ...recordData, id: generateId() }
    set((state) => {
      const patientUpdates: Partial<Patient> = {
        contactStatus: recordData.status,
        updatedAt: new Date().toISOString(),
      }
      if (recordData.nextContactAt) {
        patientUpdates.nextContactAt = recordData.nextContactAt
      }
      if (recordData.rescheduledFollowUpDate) {
        patientUpdates.suggestedFollowUpDate = recordData.rescheduledFollowUpDate
        if (recordData.nextContactAt) {
          patientUpdates.nextContactAt = recordData.nextContactAt
        }
      }
      const newState = {
        contactRecords: [...state.contactRecords, record],
        patients: state.patients.map((p) =>
          p.id === recordData.patientId ? { ...p, ...patientUpdates } : p
        ),
      }
      saveData({ ...state, ...newState })
      return newState
    })
  },

  getOverduePatients: () => {
    const { patients } = get()
    const now = new Date()
    return patients
      .filter((p) => {
        if (p.currentStep === '已完成') return false
        const days = getDaysOverdue(p.suggestedFollowUpDate)
        const hasFutureContact = p.nextContactAt && new Date(p.nextContactAt) > now
        return days > 0 && !hasFutureContact
      })
      .sort((a, b) => getDaysOverdue(b.suggestedFollowUpDate) - getDaysOverdue(a.suggestedFollowUpDate))
  },

  getTodayDuePatients: () => {
    const { patients } = get()
    const now = new Date()
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    return patients
      .filter((p) => {
        if (p.currentStep === '已完成') return false
        const days = getDaysOverdue(p.suggestedFollowUpDate)
        const hasTodayContact = p.nextContactAt &&
          new Date(p.nextContactAt) <= todayEnd &&
          new Date(p.nextContactAt) >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const shouldContactToday = days === 0 || (hasTodayContact && p.contactStatus !== '已联系')
        return shouldContactToday && days <= 0
      })
      .sort((a, b) => {
        const aTime = a.nextContactAt ? new Date(a.nextContactAt).getTime() : 0
        const bTime = b.nextContactAt ? new Date(b.nextContactAt).getTime() : 0
        if (aTime !== 0 && bTime !== 0) return aTime - bTime
        if (aTime !== 0) return -1
        if (bTime !== 0) return 1
        const aPriority = a.contactStatus === '待联系' ? 0 : 1
        const bPriority = b.contactStatus === '待联系' ? 0 : 1
        return aPriority - bPriority
      })
  },

  getQueuePatients: (targetDate, staffId) => {
    const { patients } = get()
    const target = targetDate ? new Date(targetDate) : new Date()
    const targetDayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate())
    const targetDayEnd = new Date(targetDayStart)
    targetDayEnd.setHours(23, 59, 59, 999)
    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
    const isTargetToday = targetDayStart.getTime() === todayStart.getTime()

    const withPriority = patients
      .filter((p) => {
        if (p.currentStep === '已完成') return false
        if (staffId && p.assignedTo !== staffId) return false
        if (get().hasContactOnDate(p.id, formatDate(targetDayStart.toISOString()))) return false
        return true
      })
      .map((p) => {
        let priority = 0
        let sortTime = 0
        let isIncluded = false

        const daysOverdue = Math.floor(
          (targetDayStart.getTime() - new Date(p.suggestedFollowUpDate).getTime()) / (1000 * 60 * 60 * 24)
        )
        const hasNextContactOnTarget =
          p.nextContactAt &&
          new Date(p.nextContactAt) >= targetDayStart &&
          new Date(p.nextContactAt) <= targetDayEnd
        const isFollowUpOnTarget = p.suggestedFollowUpDate === formatDate(targetDayStart.toISOString())

        if (isTargetToday && daysOverdue > 0) {
          priority = 1
          sortTime = new Date(p.suggestedFollowUpDate).getTime()
          isIncluded = true
        } else if (hasNextContactOnTarget) {
          priority = 2
          sortTime = new Date(p.nextContactAt!).getTime()
          isIncluded = true
        } else if (isFollowUpOnTarget) {
          priority = 3
          sortTime = new Date(p.suggestedFollowUpDate).getTime()
          isIncluded = true
        }

        if (!isIncluded) {
          return { ...p, priority: 99, sortTime: Infinity }
        }

        return { ...p, priority, sortTime }
      })
      .filter((p) => p.priority <= 3)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return a.sortTime - b.sortTime
      })

    return withPriority
  },

  hasContactOnDate: (patientId, date) => {
    const { contactRecords } = get()
    return contactRecords.some(
      (r) => r.patientId === patientId && r.contactDate === date && r.status === '已联系'
    )
  },

  assignPatient: (patientId, staffId) => {
    set((state) => {
      const newState = {
        patients: state.patients.map((p) =>
          p.id === patientId
            ? { ...p, assignedTo: staffId, updatedAt: new Date().toISOString() }
            : p
        ),
      }
      saveData({ ...state, ...newState })
      return newState
    })
  },

  getFuturePatients: () => {
    const { patients } = get()
    return patients
      .filter((p) => {
        if (p.currentStep === '已完成') return false
        const days = getDaysOverdue(p.suggestedFollowUpDate)
        return days < 0
      })
      .sort((a, b) =>
        new Date(a.suggestedFollowUpDate).getTime() - new Date(b.suggestedFollowUpDate).getTime()
      )
  },

  getPendingContactToday: () => {
    const overdue = get().getOverduePatients()
    const today = get().getTodayDuePatients()
    return [...overdue, ...today]
  },

  getPatientLatestRecord: (patientId) => {
    return get().getPatientRecords(patientId)[0]
  },

  getWeeklySummary: () => {
    const { patients, contactRecords } = get()
    const result = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dateStr = formatDate(d.toISOString())
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const followUpPatients = patients.filter(
        (p) => p.currentStep !== '已完成' && p.suggestedFollowUpDate === dateStr
      )
      const callbackPatients = patients.filter((p) => {
        if (p.currentStep === '已完成') return false
        if (!p.nextContactAt) return false
        const nc = new Date(p.nextContactAt)
        return nc >= dayStart && nc <= dayEnd && p.suggestedFollowUpDate !== dateStr
      })
      const completedCount = contactRecords.filter(
        (r) => r.contactDate === dateStr && r.status === '已联系'
      ).length
      const overdueCount = followUpPatients.filter((p) => isOverdue(p.suggestedFollowUpDate)).length
      const rescheduledCount = contactRecords.filter(
        (r) => r.rescheduledFollowUpDate === dateStr
      ).length

      result.push({
        date: dateStr,
        total: followUpPatients.length + callbackPatients.length,
        followUpCount: followUpPatients.length,
        callbackCount: callbackPatients.length,
        completedCount,
        overdueCount,
        rescheduledCount,
      })
    }
    return result
  },

  getDailyScheduleByStaff: (date) => {
    const { patients, staffs } = get()
    const dayStart = new Date(new Date(date).getFullYear(), new Date(date).getMonth(), new Date(date).getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const dayPatients = patients.filter((p) => {
      if (p.currentStep === '已完成') return false
      const isFollowUp = p.suggestedFollowUpDate === date
      const hasCallback =
        p.nextContactAt &&
        new Date(p.nextContactAt) >= dayStart &&
        new Date(p.nextContactAt) <= dayEnd
      return isFollowUp || hasCallback
    })

    function getSlot(p: Patient): 'morning' | 'afternoon' | 'evening' {
      if (p.nextContactAt) {
        const h = new Date(p.nextContactAt).getHours()
        if (h < 12) return 'morning'
        if (h < 18) return 'afternoon'
        return 'evening'
      }
      return 'morning'
    }

    const activeStaffs = staffs.filter((s) => s.active)
    const staffMap = new Map<string, { morning: Patient[]; afternoon: Patient[]; evening: Patient[]; total: number }>()

    activeStaffs.forEach((s) => {
      staffMap.set(s.id, { morning: [], afternoon: [], evening: [], total: 0 })
    })
    staffMap.set('unassigned', { morning: [], afternoon: [], evening: [], total: 0 })

    dayPatients.forEach((p) => {
      const slot = getSlot(p)
      const key = p.assignedTo || 'unassigned'
      if (staffMap.has(key)) {
        staffMap.get(key)![slot].push(p)
        staffMap.get(key)!.total++
      } else {
        staffMap.get('unassigned')![slot].push(p)
        staffMap.get('unassigned')!.total++
      }
    })

    const result = []
    activeStaffs.forEach((s) => {
      const data = staffMap.get(s.id)!
      result.push({
        staffId: s.id,
        staffName: s.name,
        staffColor: s.color,
        ...data,
      })
    })
    if (staffMap.get('unassigned')!.total > 0) {
      result.push({
        staffId: 'unassigned',
        staffName: '未分配',
        staffColor: '#9ca3af',
        ...staffMap.get('unassigned')!,
      })
    }

    return result
  },

  getFollowUpTimeline: (patientId) => {
    const stages = get().getPatientStages(patientId)
    const records = get().getPatientRecords(patientId)
    const patient = get().patients.find((p) => p.id === patientId)
    if (!patient) return []

    const timeline: Array<{
      type: 'stage' | 'contact' | 'nextContact' | 'followUp'
      date: string
      title: string
      description?: string
    }> = []

    stages.forEach((s) => {
      timeline.push({
        type: 'stage',
        date: s.date,
        title: s.step,
        description: s.notes || undefined,
      })
    })

    records.forEach((r) => {
      timeline.push({
        type: 'contact',
        date: r.contactDate,
        title: `联系记录：${r.status}`,
        description: r.callNotes || undefined,
      })
    })

    if (patient.nextContactAt && new Date(patient.nextContactAt) > new Date()) {
      timeline.push({
        type: 'nextContact',
        date: formatDate(patient.nextContactAt),
        title: '下次联系',
        description: `计划回电时间：${formatDate(patient.nextContactAt)} ${patient.nextContactAt ? formatTime(patient.nextContactAt) : ''}`,
      })
    }

    if (patient.suggestedFollowUpDate && new Date(patient.suggestedFollowUpDate) >= new Date()) {
      timeline.push({
        type: 'followUp',
        date: patient.suggestedFollowUpDate,
        title: '建议复诊日期',
        description: `当前阶段：${patient.currentStep}`,
      })
    }

    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return timeline
  },

  addStaff: (staffData) => {
    const staff: Staff = { ...staffData, id: generateId() }
    set((state) => {
      const newState = { staffs: [...state.staffs, staff] }
      saveData({ ...state, ...newState })
      return newState
    })
    return staff
  },

  updateStaff: (id, updates) => {
    set((state) => {
      const newState = {
        staffs: state.staffs.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }
      saveData({ ...state, ...newState })
      return newState
    })
  },

  toggleStaffActive: (id) => {
    set((state) => {
      const newState = {
        staffs: state.staffs.map((s) =>
          s.id === id ? { ...s, active: !s.active } : s
        ),
      }
      saveData({ ...state, ...newState })
      return newState
    })
  },

  getPatientsByStep: (step) => {
    const { patients } = get()
    return patients.filter((p) => p.currentStep === step)
  },

  getPatientsByDate: (date) => {
    const { patients } = get()
    return patients.filter(
      (p) => p.currentStep !== '已完成' && p.suggestedFollowUpDate === date
    )
  },

  getPatientsByDateRange: (startDate, endDate) => {
    const { patients } = get()
    return patients
      .filter(
        (p) =>
          p.currentStep !== '已完成' &&
          p.suggestedFollowUpDate >= startDate &&
          p.suggestedFollowUpDate <= endDate
      )
      .sort(
        (a, b) =>
          new Date(a.suggestedFollowUpDate).getTime() -
          new Date(b.suggestedFollowUpDate).getTime()
      )
  },

  getPatientStages: (patientId) => {
    const { treatmentStages } = get()
    return treatmentStages
      .filter((s) => s.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  getPatientLatestStage: (patientId) => {
    return get().getPatientStages(patientId)[0]
  },

  getPatientRecords: (patientId) => {
    const { contactRecords } = get()
    return contactRecords
      .filter((r) => r.patientId === patientId)
      .sort((a, b) => new Date(b.contactDate).getTime() - new Date(a.contactDate).getTime())
  },

  exportData: () => {
    const { patients, treatmentStages, contactRecords } = get()
    return JSON.stringify({ patients, treatmentStages, contactRecords }, null, 2)
  },

  importData: (json) => {
    try {
      const data = JSON.parse(json) as StoreData
      if (data.patients && Array.isArray(data.patients)) {
        set({
          patients: data.patients,
          treatmentStages: data.treatmentStages || [],
          contactRecords: data.contactRecords || [],
        })
        saveData(data)
        return true
      }
      return false
    } catch {
      return false
    }
  },
}))
