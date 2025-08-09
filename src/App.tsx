import React, { useEffect, useMemo, useState } from 'react'
import type { Question } from './types'
import questions from './data/personality_questions.json'
import QuestionCard from './components/QuestionCard'
import ProgressBar from './components/ProgressBar'
import Header from './components/Header'
import Footer from './components/Footer'
import { Link } from 'react-router-dom'
import { makeTypeAvatar } from './utils/avatar'
import details from './data/persona_details.json'
import type { PersonaDetailsMap } from './types'
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
    <div className="app-layout">
      <Header 
        progress={!done ? progress : undefined} 
        showTitle={true}
        variant="default"
      />
      
      <main className="app-main">
        <div className="container">
          {!done ? (
            <>
              <div className="intro-section">
                <h1 className="text-title-1">次世代タイプ診断</h1>
                <div className="intro-meta">
                  <span className="question-count">全{qs.length}問</span>
                  <span className="time-estimate">3〜5分で完了</span>
                </div>
                <p className="intro-description">
                  あなたの本当の性格を科学的に分析します。
                  直感で答えるだけで、詳細な結果を得られます。
                </p>
              </div>
              
              <div className="question-section">
                <ProgressBar progress={progress} />
                <div style={{height: 24}} />
                <QuestionCard 
                  q={qs[index]} 
                  onPick={handlePick} 
                  onBack={handleBack} 
                  onSkip={handleSkip} 
                  canBack={index>0} 
                />
              </div>
              
              <div className="help-section">
                <div className="card help-card">
                  <div className="help-content">
                    <div className="help-icon">💡</div>
                    <div>
                      <div className="text-headline">Tips</div>
                      <div className="small">
                        直感で選んでOK。考えすぎずに、自然な反応を選んでください。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="result-section">
                <ResultView 
                  persona={primaryPersona!} 
                  axes={axes!} 
                  secondary={secondaryPersona!} 
                  conf={conf} 
                />
              </div>
              
              <div className="personas-section">
                <div className="card">
                  <div className="section-header">
                    <h2 className="text-title-2">全タイプ一覧</h2>
                    <p className="section-description small">
                      気になるタイプをクリックして詳細を確認してみましょう
                    </p>
                  </div>
                  <div className="type-cards-grid">
                    {PERSONAS.map(p => {
                      const map = details as unknown as PersonaDetailsMap
                      const detail = map[p.code]
                      const avatar = detail ? makeTypeAvatar(p.code, detail.color) : null
                      
                      return (
                        <Link 
                          key={p.code} 
                          to={`/types/${p.code}`} 
                          className="type-card"
                          style={detail?.color ? ({ ['--type-accent' as any]: detail.color } as React.CSSProperties) : undefined}
                        >
                          {avatar && (
                            <div className="type-card-avatar">
                              <img src={avatar} alt={p.name} />
                            </div>
                          )}
                          <div className="type-card-content">
                            <div className="type-card-code">{p.code}</div>
                            <div className="type-card-name">{p.name}</div>
                            <div className="type-card-summary small">{detail?.oneLiner || p.summary}</div>
                            {detail?.keywords?.slice(0, 3).map((keyword, i) => (
                              <span key={i} className="type-card-tag">{keyword}</span>
                            ))}
                          </div>
                          <div className="type-card-arrow">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer 
        showDetails={done}
        variant={done ? 'result' : 'default'}
      />
    </div>
  )
}

import ResultView from './components/ResultView'
