import { useStore } from '@/store/useStore'
import { getDaysOverdue, isOverdue, formatDateCN, getTodayStr } from '@/utils/date'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  TrendingDown,
  Download,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'
import type { TreatmentStep } from '@/types'

export default function StatsPage() {
  const patients = useStore((s) => s.patients)
  const treatmentStages = useStore((s) => s.treatmentStages)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activePatients = patients.filter((p) => p.currentStep !== '已完成')
  const completedPatients = patients.filter((p) => p.currentStep === '已完成')
  const overduePatients = activePatients.filter((p) => isOverdue(p.suggestedFollowUpDate))
  const waitingContact = activePatients.filter((p) => p.contactStatus === '待联系')

  const avgOverdueDays =
    overduePatients.length > 0
      ? Math.round(
          overduePatients.reduce((sum, p) => sum + getDaysOverdue(p.suggestedFollowUpDate), 0) /
            overduePatients.length
        )
      : 0

  const stepDistribution: { step: TreatmentStep; count: number; color: string }[] = [
    { step: '开髓引流', count: patients.filter((p) => p.currentStep === '开髓引流').length, color: 'bg-accent-400' },
    { step: '已封药待复诊', count: patients.filter((p) => p.currentStep === '已封药待复诊').length, color: 'bg-primary-300' },
    { step: '已预备待充填', count: patients.filter((p) => p.currentStep === '已预备待充填').length, color: 'bg-primary-500' },
    { step: '已充填待冠修复', count: patients.filter((p) => p.currentStep === '已充填待冠修复').length, color: 'bg-success-400' },
    { step: '已完成', count: completedPatients.length, color: 'bg-success-600' },
  ]

  const maxStepCount = Math.max(...stepDistribution.map((s) => s.count), 1)

  const contactStatusDist = [
    { label: '待联系', count: activePatients.filter((p) => p.contactStatus === '待联系').length, color: 'text-accent-500' },
    { label: '已联系', count: activePatients.filter((p) => p.contactStatus === '已联系').length, color: 'text-success-500' },
    { label: '无人接听', count: activePatients.filter((p) => p.contactStatus === '无人接听').length, color: 'text-gray-400' },
    { label: '改约', count: activePatients.filter((p) => p.contactStatus === '改约').length, color: 'text-primary-500' },
    { label: '疼痛需提前就诊', count: activePatients.filter((p) => p.contactStatus === '疼痛需提前就诊').length, color: 'text-danger-500' },
  ]

  const recentCompleted = treatmentStages
    .filter((s) => s.step === '已完成')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `根管复诊通-备份-${getTodayStr()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      const success = importData(json)
      if (!success) {
        alert('导入失败，文件格式不正确')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据总览</h1>
          <p className="text-sm text-gray-500 mt-1">治疗进度和跟进状态概览</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm text-primary-500 bg-primary-50 px-3 py-2 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <Download size={14} />
            导出数据
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-gray-500 bg-warm-100 px-3 py-2 rounded-lg hover:bg-warm-200 transition-colors"
          >
            <Upload size={14} />
            导入数据
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-danger-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">超期未联系</p>
              <p className="text-2xl font-bold font-mono text-danger-500">
                {overduePatients.filter((p) => p.contactStatus === '待联系').length}
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            平均超期 <span className="font-mono text-danger-400">{avgOverdueDays}</span> 天
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
              <Clock size={20} className="text-accent-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">待联系患者</p>
              <p className="text-2xl font-bold font-mono text-accent-500">{waitingContact.length}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            占进行中 <span className="font-mono">{activePatients.length > 0 ? Math.round((waitingContact.length / activePatients.length) * 100) : 0}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-success-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已完成治疗</p>
              <p className="text-2xl font-bold font-mono text-success-500">{completedPatients.length}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            总病例 <span className="font-mono">{patients.length}</span> 个
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary-500" />
            治疗步骤分布
          </h3>
          <div className="space-y-3">
            {stepDistribution.map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 text-right shrink-0">{item.step}</span>
                <div className="flex-1 bg-warm-50 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${maxStepCount > 0 ? (item.count / maxStepCount) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-600 w-6 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingDown size={16} className="text-accent-500" />
            联系状态分布
          </h3>
          <div className="space-y-3">
            {contactStatusDist.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className={`text-sm font-mono font-semibold ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>

          {recentCompleted.length > 0 && (
            <div className="mt-6 pt-4 border-t border-warm-100">
              <p className="text-xs text-gray-500 mb-3">最近完成</p>
              <div className="space-y-2">
                {recentCompleted.map((stage) => {
                  const p = patients.find((pt) => pt.id === stage.patientId)
                  return (
                    <div key={stage.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{p?.name || '未知'}</span>
                      <span className="text-gray-400">{formatDateCN(stage.createdAt)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
