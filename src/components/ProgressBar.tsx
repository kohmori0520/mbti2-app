import React, { useEffect, useState } from 'react'

interface ProgressBarProps {
  progress: number
  totalQuestions?: number
  currentQuestion?: number
  animated?: boolean
  showPercentage?: boolean
}

export default function ProgressBar({ 
  progress, 
  totalQuestions, 
  currentQuestion, 
  animated = true, 
  showPercentage = true 
}: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)))

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(pct)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedProgress(pct)
    }
  }, [pct, animated])

  return (
    <div className="progress-container">
      {/* 進捗情報 */}
      <div className="progress-info">
        <div className="progress-labels">
          {totalQuestions && currentQuestion && (
            <span className="progress-fraction">
              {currentQuestion} / {totalQuestions}
            </span>
          )}
          {showPercentage && (
            <span className="progress-percentage">
              {animatedProgress}% 完了
            </span>
          )}
        </div>
      </div>
      
      {/* プログレスバー */}
      <div 
        className="progress enhanced" 
        role="progressbar" 
        aria-valuenow={animatedProgress} 
        aria-valuemin={0} 
        aria-valuemax={100} 
        aria-label={`進捗状況 ${animatedProgress}%`}
      >
        <div 
          className="progress-fill" 
          style={{ width: `${animatedProgress}%` }}
        />
        <div className="progress-glow" style={{ width: `${animatedProgress}%` }} />
      </div>
      
      {/* マイルストーンドット */}
      {totalQuestions && (
        <div className="progress-milestones">
          {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => {
            const milestoneProgress = ((i + 1) / totalQuestions) * 100
            const isReached = animatedProgress >= milestoneProgress
            return (
              <div 
                key={i}
                className={`milestone ${isReached ? 'reached' : ''}`}
                style={{ left: `${milestoneProgress}%` }}
                aria-hidden="true"
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// 下位互換性のためのラッパー関数
export function SimpleProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)))
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="進捗状況">
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}
