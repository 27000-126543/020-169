export type TreatmentStep =
  | "开髓引流"
  | "已封药待复诊"
  | "已预备待充填"
  | "已充填待冠修复"
  | "已完成"

export type ContactStatus =
  | "待联系"
  | "已联系"
  | "无人接听"
  | "改约"
  | "疼痛需提前就诊"

export type PainLevel = "无痛" | "轻微" | "中度" | "剧烈"

export interface Staff {
  id: string
  name: string
  role: string
  color: string
  active: boolean
}

export interface Patient {
  id: string
  name: string
  phone: string
  tooth: string
  currentStep: TreatmentStep
  contactStatus: ContactStatus
  suggestedFollowUpDate: string
  nextContactAt?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface TreatmentStage {
  id: string
  patientId: string
  step: TreatmentStep
  date: string
  suggestedFollowUpDate: string
  notes: string
  sealingMaterial: string
  painLevel: PainLevel
  doctorInstructions: string
  createdAt: string
}

export interface ContactRecord {
  id: string
  patientId: string
  status: ContactStatus
  contactDate: string
  remark: string
  callNotes?: string
  nextContactAt?: string
  rescheduledFollowUpDate?: string
}

export const TREATMENT_STEPS: TreatmentStep[] = [
  "开髓引流",
  "已封药待复诊",
  "已预备待充填",
  "已充填待冠修复",
  "已完成",
]

export const CONTACT_STATUSES: ContactStatus[] = [
  "待联系",
  "已联系",
  "无人接听",
  "改约",
  "疼痛需提前就诊",
]

export const PAIN_LEVELS: PainLevel[] = ["无痛", "轻微", "中度", "剧烈"]

export const DEFAULT_STAFFS: Staff[] = [
  { id: "staff1", name: "小王", role: "前台", color: "#10b981", active: true },
  { id: "staff2", name: "小李", role: "前台", color: "#f59e0b", active: true },
  { id: "staff3", name: "张护士", role: "护士助理", color: "#8b5cf6", active: true },
]
