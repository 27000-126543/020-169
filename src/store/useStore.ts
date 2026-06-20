import { create } from 'zustand'
import type { Patient, TreatmentStage, ContactRecord, TreatmentStep, ContactStatus } from '@/types'
import { getDaysOverdue } from '@/utils/date'

const STORAGE_KEY = 'root-canal-tracker'

interface StoreData {
  patients: Patient[]
  treatmentStages: TreatmentStage[]
  contactRecords: ContactRecord[]
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
  const fiveDaysLater = new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

  const patients: Patient[] = [
    { id: 'seed1', name: '王建华', phone: '13800138001', tooth: '16', currentStep: '已封药待复诊', contactStatus: '待联系', suggestedFollowUpDate: fiveDaysAgo, createdAt: sevenDaysAgo, updatedAt: threeDaysAgo },
    { id: 'seed2', name: '李美玲', phone: '13900139002', tooth: '36', currentStep: '已预备待充填', contactStatus: '待联系', suggestedFollowUpDate: threeDaysAgo, createdAt: sevenDaysAgo, updatedAt: threeDaysAgo },
    { id: 'seed3', name: '张伟', phone: '13700137003', tooth: '24', currentStep: '已封药待复诊', contactStatus: '已联系', suggestedFollowUpDate: twoDaysLater, createdAt: fiveDaysAgo, updatedAt: yesterday },
    { id: 'seed4', name: '陈晓红', phone: '13600136004', tooth: '47', currentStep: '已充填待冠修复', contactStatus: '待联系', suggestedFollowUpDate: fiveDaysLater, createdAt: sevenDaysAgo, updatedAt: yesterday },
    { id: 'seed5', name: '刘大明', phone: '13500135005', tooth: '14', currentStep: '开髓引流', contactStatus: '待联系', suggestedFollowUpDate: yesterday, createdAt: threeDaysAgo, updatedAt: threeDaysAgo },
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
  ]

  const contactRecords: ContactRecord[] = [
    { id: 'cr1', patientId: 'seed3', status: '已联系', contactDate: yesterday, remark: '' },
  ]

  return { patients, treatmentStages, contactRecords }
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

  addTreatmentStage: (stage: Omit<TreatmentStage, 'id' | 'createdAt'>) => TreatmentStage

  addContactRecord: (record: Omit<ContactRecord, 'id'>) => void

  getOverduePatients: () => Patient[]
  getTodayContactList: () => Patient[]
  getPatientsByStep: (step: TreatmentStep) => Patient[]
  getPatientStages: (patientId: string) => TreatmentStage[]
  getPatientRecords: (patientId: string) => ContactRecord[]

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
      const newState = {
        patients: [...state.patients, patient],
      }
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
    const record: ContactRecord = {
      ...recordData,
      id: generateId(),
    }
    set((state) => {
      const newState = {
        contactRecords: [...state.contactRecords, record],
        patients: state.patients.map((p) =>
          p.id === recordData.patientId
            ? { ...p, contactStatus: recordData.status, updatedAt: new Date().toISOString() }
            : p
        ),
      }
      saveData({ ...state, ...newState })
      return newState
    })
  },

  getOverduePatients: () => {
    const { patients } = get()
    return patients
      .filter((p) => p.currentStep !== '已完成' && getDaysOverdue(p.suggestedFollowUpDate) > 0)
      .sort((a, b) => getDaysOverdue(b.suggestedFollowUpDate) - getDaysOverdue(a.suggestedFollowUpDate))
  },

  getTodayContactList: () => {
    const { patients } = get()
    return patients
      .filter((p) => p.currentStep !== '已完成' && p.contactStatus === '待联系')
      .sort((a, b) => getDaysOverdue(b.suggestedFollowUpDate) - getDaysOverdue(a.suggestedFollowUpDate))
  },

  getPatientsByStep: (step) => {
    const { patients } = get()
    return patients.filter((p) => p.currentStep === step)
  },

  getPatientStages: (patientId) => {
    const { treatmentStages } = get()
    return treatmentStages
      .filter((s) => s.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
