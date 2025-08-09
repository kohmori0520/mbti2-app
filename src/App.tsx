import React, { useEffect, useMemo, useState } from 'react'
import type { Question } from './types'
import questions from './data/personality_questions.json'
import QuestionCard from './components/QuestionCard'
import ProgressBar from './components/ProgressBar'
import { aggregate, normalize, pickPersona, PERSONAS, aggregateWithCounts, normalizeByCounts, confidence } from './logic/scoring'

type Answers = Record<number, 'A'|'B'>

export default function App(){
  // 質問キーを '1'|'2' → 'A'|'B' に正規化
  const qs = (questions as Question[]).map(q => ({
    ...q,
    options: q.options.map(o => {
      const rawKey = (o as any).key as string
      const fixedKey = rawKey === '1' ? 'A' : rawKey === '2' ? 'B' : rawKey
      return { ...o, key: fixedKey as 'A'|'B' }
    })
  }))
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const done = index >= qs.length

  const handlePick = (key: 'A'|'B') => {
    const q = qs[index]
    const next = { ...answers, [q.id]: key }
    setAnswers(next)
    setIndex(i => i + 1)
    localStorage.setItem('answers', JSON.stringify(next))
    // ログ保存（簡易）
    try {
      const logs = JSON.parse(localStorage.getItem('answerLogs') || '[]') as any[]
      logs.push({ ts: Date.now(), id: q.id, axis: q.axis, version: (q as any).version ?? 1, weight: (q as any).weight ?? ((q.options.find(o=>o.key===key) as any)?.weight ?? 1), pick: key })
      localStorage.setItem('answerLogs', JSON.stringify(logs))
    } catch {}
  }

  const handleBack = () => {
    if (index === 0) return
    const prevIndex = index - 1
    const prevQ = qs[prevIndex]
    const next = { ...answers }
    delete next[prevQ.id]
    setAnswers(next)
    setIndex(prevIndex)
    localStorage.setItem('answers', JSON.stringify(next))
  }

  const handleSkip = () => {
    // 回答は保存せずインデックスのみ進める
    setIndex(i => i + 1)
  }

  const progress = index / qs.length

  const { primaryPersona, secondaryPersona, axes, conf } = useMemo(() => {
    if (!done) return { primaryPersona: null, secondaryPersona: null, axes: null } as any
    const { sums, counts, answered, total } = aggregateWithCounts(answers, qs)
    const axes = sums
    const norm = normalizeByCounts({ sums, counts })
    const { primary, secondary } = pickPersona(norm)
    const primaryPersona = PERSONAS.find(p => p.code === primary.code)!
    const secondaryPersona = PERSONAS.find(p => p.code === secondary.code)!
    const conf = confidence(primary.score, secondary.score, answered, total)
    // 結果ログ（簡易）
    try {
      const resultLogs = JSON.parse(localStorage.getItem('resultLogs') || '[]') as any[]
      resultLogs.push({ ts: Date.now(), primary: primaryPersona.code, secondary: secondaryPersona.code, conf })
      localStorage.setItem('resultLogs', JSON.stringify(resultLogs))
    } catch {}
    return { primaryPersona, secondaryPersona, axes, conf }
  }, [done])

  // 回答の自動復元（初回のみ）
  useEffect(() => {
    try {
      const saved = localStorage.getItem('answers')
      if (!saved) return
      const parsed = JSON.parse(saved) as Record<string, 'A'|'B'>
      // 文字キーを数値キーに
      const restored: Answers = {}
      for (const [k, v] of Object.entries(parsed)) {
        const id = Number(k)
        if (Number.isFinite(id) && (v === 'A' || v === 'B')) restored[id] = v
      }
      setAnswers(restored)
      // 次の未回答インデックスへ
      const answeredIds = new Set(Object.keys(restored).map(n => Number(n)))
      let nextIdx = 0
      for (let i = 0; i < qs.length; i++) {
        if (!answeredIds.has(qs[i].id)) { nextIdx = i; break }
        nextIdx = i + 1
      }
      setIndex(Math.min(nextIdx, qs.length))
    } catch {}
  // qsは固定のため初回のみ
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container">
      <header style={{marginBottom: 24}}>
        <h1 className="text-title-1">次世代タイプ診断</h1>
        <div className="small">全{qs.length}問・約3〜5分</div>
      </header>

      {!done ? (
        <>
          <ProgressBar progress={progress} />
          <div style={{height: 16}} />
          <QuestionCard q={qs[index]} onPick={handlePick} onBack={handleBack} onSkip={handleSkip} canBack={index>0} />
          <div style={{height: 16}} />
          <div className="card">
            <div className="small">A/Bは直感でOK。各ボタンは最小44pxのタッチ領域で設計。</div>
          </div>
        </>
      ) : (
        <>
          <ResultView persona={primaryPersona!} axes={axes!} secondary={secondaryPersona!} conf={conf} />
          <div style={{height: 16}} />
          <div className="card">
            <h2>タイプ一覧</h2>
            <ul>
              {PERSONAS.map(p => (
                <li key={p.code} className="small">{p.code}：{p.name} - {p.summary}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

import ResultView from './components/ResultView'
