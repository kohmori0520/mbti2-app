import React, { useEffect } from 'react'
import type { Question } from '../types'

type Props = {
  q: Question
  onPick: (key: 'A'|'B') => void
  onBack: () => void
  onSkip: () => void
  canBack?: boolean
}

export default function QuestionCard({ q, onPick, onBack, onSkip, canBack = false }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const key = e.key
      if (key === 'ArrowLeft') {
        e.preventDefault()
        if (canBack) onBack()
        return
      }
      if (key === 'ArrowRight') {
        e.preventDefault()
        onSkip()
        return
      }
      if (key === '1') {
        e.preventDefault()
        onPick('A')
        return
      }
      if (key === '2') {
        e.preventDefault()
        onPick('B')
        return
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onBack, onSkip, onPick, canBack, q.id])

  return (
    <div className="card">
      <div className="text-caption">Q{q.id}</div>
      <h2 className="text-title-2">{q.question}</h2>
      <div className="grid two" style={{marginTop: 16}}>
        {q.options.map(opt => {
          const shortcut = opt.key === 'A' ? '1' : '2'
          return (
            <button
              key={opt.key}
              className="option"
              onClick={()=>onPick(opt.key)}
              aria-keyshortcuts={shortcut}
              title={`ショートカット: ${shortcut}`}
            >
              <div className="text-caption" style={{marginBottom: 6}}>{shortcut}</div>
              <div className="text-body" style={{marginBottom: 0}}>{opt.label}</div>
            </button>
          )
        })}
      </div>
      <div style={{display:'flex', gap:8, justifyContent:'space-between', marginTop:16}}>
        <button type="button" className="btn outline" onClick={onBack} disabled={!canBack} aria-label="前の質問に戻る" aria-keyshortcuts="ArrowLeft" title="戻る（←）">戻る（←）</button>
        <button type="button" className="btn outline" onClick={onSkip} aria-label="この質問をスキップする" aria-keyshortcuts="ArrowRight" title="スキップ（→）">スキップ（→）</button>
      </div>
    </div>
  )
}
