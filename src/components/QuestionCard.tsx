import React, { useEffect, useState } from 'react'
import type { Question } from '../types'

type Props = {
  q: Question
  onPick: (key: 'A'|'B') => void
  onBack: () => void
  onSkip: () => void
  canBack?: boolean
}

export default function QuestionCard({ q, onPick, onBack, onSkip, canBack = false }: Props) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [cardKey, setCardKey] = useState(0)

  // 質問が変わったときのアニメーションリセット
  useEffect(() => {
    setSelectedOption(null)
    setIsAnimating(false)
    setCardKey(prev => prev + 1)
  }, [q.id])

  const handleOptionClick = async (key: 'A' | 'B') => {
    if (isAnimating) return
    
    setSelectedOption(key)
    setIsAnimating(true)
    
    // 短いアニメーションの後にコールバック実行
    setTimeout(() => {
      onPick(key)
    }, 200)
  }

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
    <div className="question-card-container" key={cardKey}>
      <div className="card question-card">
        <div className="question-header">
          <div className="question-number">
            <span className="question-label">質問</span>
            <span className="question-id">#{q.id}</span>
          </div>
        </div>
        
        <div className="question-content">
          <h2 className="text-title-2 question-text">{q.question}</h2>
        </div>
        
        <div className="options-grid">
          {q.options.map((opt, index) => {
            const shortcut = opt.key === 'A' ? '1' : '2'
            const isSelected = selectedOption === opt.key
            const shouldAnimate = isAnimating && isSelected
            
            return (
              <button
                key={opt.key}
                className={`option enhanced ${
                  isSelected ? 'selected' : ''
                } ${
                  shouldAnimate ? 'animating' : ''
                } ${
                  isAnimating && !isSelected ? 'fading' : ''
                }`}
                onClick={() => handleOptionClick(opt.key)}
                disabled={isAnimating}
                aria-keyshortcuts={shortcut}
                aria-describedby={`option-${opt.key}-desc`}
                aria-pressed={isSelected}
                role="option"
                title={`選択肢${opt.key}: ${opt.label} (ショートカット: ${shortcut})`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="option-header">
                  <span className="option-key">{shortcut}</span>
                  <div className="option-indicator" />
                </div>
                <div className="option-content">
                  <div className="option-text">{opt.label}</div>
                </div>
                <div className="option-ripple" />
              </button>
            )
          })}
        </div>
        
        <div className="question-actions">
          <button 
            type="button" 
            className="btn outline action-btn" 
            onClick={onBack} 
            disabled={!canBack || isAnimating} 
            aria-label="前の質問に戻る" 
            aria-keyshortcuts="ArrowLeft" 
            title="戻る（←）"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            戻る
          </button>
          <button 
            type="button" 
            className="btn outline action-btn" 
            onClick={onSkip} 
            disabled={isAnimating}
            aria-label="この質問をスキップする" 
            aria-keyshortcuts="ArrowRight" 
            title="スキップ（→）"
          >
            スキップ
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* キーボードショートカットヒント */}
        <div className="keyboard-hints">
          <div className="hint-group">
            <kbd>1</kbd><span>または</span><kbd>2</kbd><span>で選択</span>
          </div>
          <div className="hint-group">
            <kbd>←</kbd><span>戻る</span>
            <kbd>→</kbd><span>スキップ</span>
          </div>
        </div>
      </div>
    </div>
  )
}
