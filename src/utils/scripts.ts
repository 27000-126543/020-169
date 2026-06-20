import type { TreatmentStep } from '@/types'

const TOOTH_QUADRANTS = [
  { label: '上颌右侧', range: [11, 18] },
  { label: '上颌左侧', range: [21, 28] },
  { label: '下颌左侧', range: [31, 38] },
  { label: '下颌右侧', range: [41, 48] },
]

export function getToothQuadrants() {
  return TOOTH_QUADRANTS
}

export function getToothLabel(tooth: string): string {
  const num = parseInt(tooth, 10)
  if (isNaN(num)) return tooth
  const quadrant = TOOTH_QUADRANTS.find(
    (q) => num >= q.range[0] && num <= q.range[1]
  )
  return quadrant ? `${tooth}（${quadrant.label}）` : tooth
}

export function generateContactScript(
  step: TreatmentStep,
  patientName: string,
  daysAgo: number,
  followUpDate: string
): string {
  const honorific = '先生/女士'
  const dateCN = followUpDate
    ? (() => {
        const d = new Date(followUpDate)
        return `${d.getMonth() + 1}月${d.getDate()}日`
      })()
    : '近期'

  const scripts: Record<TreatmentStep, string> = {
    开髓引流: `您好，${patientName}${honorific}，我是口腔诊所前台。您${daysAgo > 0 ? daysAgo + '天前' : '最近'}在我们这里做了根管开髓引流，医生建议您尽快来复诊进行下一步治疗，请问您方便什么时候过来？`,
    已封药待复诊: `您好，${patientName}${honorific}，我是口腔诊所前台。您${daysAgo > 0 ? daysAgo + '天前' : '最近'}在我们这里做了根管封药治疗，医生建议您在${dateCN}前来复诊，请问您方便什么时候过来？`,
    已预备待充填: `您好，${patientName}${honorific}，我是口腔诊所前台。您的根管已经完成预备，现在需要安排充填，建议尽快来诊完成治疗，以免感染。请问您方便什么时候过来？`,
    已充填待冠修复: `您好，${patientName}${honorific}，我是口腔诊所前台。您的根管充填已完成，建议尽快安排牙冠修复以保护患牙，防止牙齿劈裂。请问您方便什么时候过来？`,
    已完成: `您好，${patientName}${honorific}，我是口腔诊所前台。您的根管治疗已经完成，建议定期复查，保持口腔健康。如有不适请随时联系我们。`,
  }

  return scripts[step] || scripts['已封药待复诊']
}
