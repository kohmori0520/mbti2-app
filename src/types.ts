export type AxisKey = 'behavior' | 'decision' | 'relation' | 'value'

export type Option = {
  key: 'A' | 'B'
  label: string
  score: Partial<Record<AxisKey, number>>
  weight?: number
}

export type Question = {
  id: number
  axis: AxisKey
  question: string
  weight?: number
  version?: number
  options: Option[]
}

export type PersonaDetail = {
  title: string
  oneLiner: string
  summaryLong: string
  strengths: string[]
  growth: string[]
  keywords: string[]
  recommendedRoles: string[]
  famous: string[]
  color: string
}

export type PersonaDetailsMap = Record<string, PersonaDetail>

export type AiInsight = {
  oneLiner: string
  summaryLong: string
  strengths: string[]
  growth: string[]
  collaborationTips: string[]
  recommendedRoles: string[]
  keywords: string[]
}
