import React, { useEffect, useState } from 'react'

interface CompletionAnimationProps {
  onComplete?: () => void
  totalQuestions: number
}

export default function CompletionAnimation({ onComplete, totalQuestions }: CompletionAnimationProps) {
  const [phase, setPhase] = useState<'initial' | 'counting' | 'celebration' | 'complete'>('initial')
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('counting'), 300)
    return () => clearTimeout(timer1)
  }, [])

  useEffect(() => {
    if (phase === 'counting') {
      let currentCount = 0
      const increment = totalQuestions / 20 // 20ステップで完了
      
      const countingInterval = setInterval(() => {
        currentCount += increment
        if (currentCount >= totalQuestions) {
          currentCount = totalQuestions
          clearInterval(countingInterval)
          setTimeout(() => setPhase('celebration'), 200)
        }
        setCount(Math.floor(currentCount))
      }, 50)

      return () => clearInterval(countingInterval)
    }
  }, [phase, totalQuestions])

  useEffect(() => {
    if (phase === 'celebration') {
      const timer = setTimeout(() => {
        setPhase('complete')
        setTimeout(() => onComplete?.(), 500)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <div className={`completion-overlay ${phase}`}>
      <div className="completion-content">
        <div className="completion-animation">
          {/* メインアニメーション */}
          <div className="completion-circle">
            <div className="completion-checkmark">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  stroke="var(--color-accent)"
                  strokeWidth="3"
                  fill="none"
                  className="check-circle"
                />
                <path
                  d="M16 30L26 40L44 22"
                  stroke="var(--color-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="check-path"
                />
              </svg>
            </div>
          </div>

          {/* パーティクルエフェクト */}
          <div className="celebration-particles">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  '--delay': `${i * 100}ms`,
                  '--angle': `${i * 30}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* テキスト */}
        <div className="completion-text">
          <h2 className="completion-title">
            {phase === 'initial' && '分析中...'}
            {phase === 'counting' && `${count} / ${totalQuestions} 問完了`}
            {(phase === 'celebration' || phase === 'complete') && '診断完了！'}
          </h2>
          <p className="completion-subtitle">
            {phase === 'initial' && 'あなたの回答を処理しています'}
            {phase === 'counting' && '回答データを集計中'}
            {(phase === 'celebration' || phase === 'complete') && 'あなたの性格タイプが決定しました'}
          </p>
        </div>

        {/* プログレスインジケーター */}
        {phase === 'counting' && (
          <div className="completion-progress">
            <div 
              className="completion-progress-bar"
              style={{ width: `${(count / totalQuestions) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* 背景グラデーション */}
      <div className="completion-background" />
    </div>
  )
}