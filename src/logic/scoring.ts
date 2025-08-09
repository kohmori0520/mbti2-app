import type { AxisKey, Question } from '../types'

export type Axes = Record<AxisKey, number>

export type TypeCode =
  | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6'
  | 'T7' | 'T8' | 'T9' | 'T10' | 'T11' | 'T12'

export type Persona = {
  code: TypeCode
  name: string
  summary: string
}

export const PERSONAS: Persona[] = [
  { code: 'T1', name: 'リーダー型', summary: '方向性を示し、人を引っ張る' },
  { code: 'T2', name: '企画家型', summary: 'アイデアを考え、形にする' },
  { code: 'T3', name: '冒険家型', summary: '新しいことに挑戦し続ける' },
  { code: 'T4', name: 'サポーター型', summary: '周囲を支え、安心感を与える' },
  { code: 'T5', name: '戦略家型', summary: '全体を見渡し、勝ち筋を描く' },
  { code: 'T6', name: '職人型', summary: '細部までこだわり抜く' },
  { code: 'T7', name: '挑戦者型', summary: '困難に燃え、突破口を探す' },
  { code: 'T8', name: '調整役型', summary: '人と人をつなぎ調和を保つ' },
  { code: 'T9', name: '守護者型', summary: '仲間や組織を守るために動く' },
  { code: 'T10', name: '創造家型', summary: '新しい価値やデザインを生み出す' },
  { code: 'T11', name: 'ムードメーカー型', summary: '場を明るくし、空気を動かす' },
  { code: 'T12', name: '冷静分析型', summary: '感情に流されず判断する' },
]

// 4軸ベクトル（behavior, decision, relation, value）を -1..+1 の理想値で定義
// ※初期仮説。実運用で学習して更新推奨。
const CENTROIDS: Record<TypeCode, [number, number, number, number]> = {
  T1: [ +0.8,  0.0, +0.7, +0.3 ], // リーダー
  T2: [ +0.2, +0.6, -0.2, +0.5 ], // 企画家（直感・変化寄り）
  T3: [ +0.9, +0.7, +0.2, +0.9 ], // 冒険家
  T4: [ -0.3,  0.0, -0.8, -0.3 ], // サポーター（協調・安定）
  T5: [ -0.2, -0.9, -0.1, -0.2 ], // 戦略家（分析・慎重）
  T6: [ -0.6, -0.6,  0.0, -0.7 ], // 職人（精密・安定）
  T7: [ +0.9, +0.4, +0.6, +0.6 ], // 挑戦者（攻め）
  T8: [ -0.1, -0.4, -0.7, -0.1 ], // 調整役（協調・やや安定）
  T9: [ -0.5, -0.5, -0.4, -0.9 ], // 守護者（保守）
  T10:[ +0.3, +0.8, -0.1, +0.7 ], // 創造家（直感・変化）
  T11:[ +0.7, +0.5, +0.8, +0.4 ], // ムードメーカー（主導・外向）
  T12:[ -0.4, -0.8, -0.5, -0.3 ], // 冷静分析（分析・落ち着き）
}

// normalize axis scores to -1..+1 from raw totals
export function normalize(axes: Axes, maxAbsPerAxis: number): [number, number, number, number] {
  const arr: [number, number, number, number] = [
    clamp(axes.behavior / maxAbsPerAxis, -1, 1),
    clamp(axes.decision / maxAbsPerAxis, -1, 1),
    clamp(axes.relation / maxAbsPerAxis, -1, 1),
    clamp(axes.value / maxAbsPerAxis, -1, 1),
  ]
  return arr
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function dot(a: [number, number, number, number], b: [number, number, number, number]) {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3]
}

function magnitude(a: [number, number, number, number]) {
  return Math.sqrt(a[0]**2 + a[1]**2 + a[2]**2 + a[3]**2)
}

function cosineSim(a: [number, number, number, number], b: [number, number, number, number]) {
  const m = magnitude(a) * magnitude(b)
  return m === 0 ? 0 : dot(a, b) / m
}

export function pickPersona(norm: [number, number, number, number]) {
  const candidates: { code: TypeCode; score: number }[] = []
  let best: { code: TypeCode; score: number } | null = null

  const entries = Object.entries(CENTROIDS) as [TypeCode, [number, number, number, number]][]
  for (const [code, centroid] of entries) {
    const sim = cosineSim(norm, centroid)
    candidates.push({ code, score: sim })
    if (!best || sim > best.score) {
      best = { code, score: sim }
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const [primary, secondary] = candidates
  return { primary, secondary, ranked: candidates }
}

export function aggregate(answers: Record<number, 'A'|'B'>, questions: Question[]): Axes {
  const axes: Axes = { behavior: 0, decision: 0, relation: 0, value: 0 }
  for (const q of questions) {
    const ans = answers[q.id]
    if (!ans) continue
    const chosen = q.options.find(o => o.key === ans)
    if (!chosen) continue
    for (const [k, v] of Object.entries(chosen.score)) {
      axes[k as AxisKey] += v as number
    }
  }
  return axes
}

// 強化版: 軸ごとに合算と回答数（重み考慮）を返す
export type AxisTotals = Record<AxisKey, number>

export function aggregateWithCounts(
  answers: Record<number, 'A'|'B'>,
  questions: Question[]
): { sums: AxisTotals; counts: AxisTotals; answered: number; total: number } {
  const sums: AxisTotals = { behavior: 0, decision: 0, relation: 0, value: 0 }
  const counts: AxisTotals = { behavior: 0, decision: 0, relation: 0, value: 0 }
  let answered = 0
  for (const q of questions) {
    const ans = answers[q.id]
    if (!ans) continue
    const chosen = q.options.find(o => o.key === ans)
    if (!chosen) continue
    answered += 1
    const weight = (chosen as any).weight ?? (q as any).weight ?? 1
    for (const [k, v] of Object.entries(chosen.score)) {
      const axis = k as AxisKey
      const val = (v as number) * weight
      sums[axis] += val
      if (Math.abs(v as number) > 0) counts[axis] += 1 * weight
    }
  }
  return { sums, counts, answered, total: questions.length }
}

// 軸ごと回答数に応じた正規化（-1..+1）
export function normalizeByCounts({ sums, counts }: { sums: AxisTotals; counts: AxisTotals }) {
  const safe = (n: number) => (n === 0 ? 1 : n)
  const arr: [number, number, number, number] = [
    clamp(sums.behavior / safe(counts.behavior), -1, 1),
    clamp(sums.decision / safe(counts.decision), -1, 1),
    clamp(sums.relation / safe(counts.relation), -1, 1),
    clamp(sums.value / safe(counts.value), -1, 1),
  ]
  return arr
}

// 信頼度（0..1）: 類似度差と回答カバレッジの合成
export function confidence(primaryScore: number, secondaryScore: number, answered: number, total: number) {
  const gap = Math.max(0, primaryScore - secondaryScore) // 0..1想定
  const coverage = Math.min(1, answered / Math.max(1, total))
  return Math.min(1, gap * 0.7 + coverage * 0.3)
}
