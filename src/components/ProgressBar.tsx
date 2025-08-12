import React, { useEffect, useState } from 'react'
import { AdvancedProgressRing, GlassCard } from './ModernUI'

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
    <GlassCard 
      className="progress-container-modern"
      blur={10}
      opacity={0.9}
      shadow="sm"
      padding="md"
      rounded="lg"
    >
      <div className="progress-layout">
        <div className="progress-info-modern">
          <div className="progress-text-info">
            {totalQuestions && currentQuestion && (
              <div className="progress-fraction-modern">
                <span className="current-question">{currentQuestion}</span>
                <span className="divider">/</span>
                <span className="total-questions">{totalQuestions}</span>
              </div>
            )}
            <div className="progress-status">
              進行状況
            </div>
          </div>
          
          <div className="progress-ring-container">
            <AdvancedProgressRing
              progress={progress}
              size={80}
              strokeWidth={6}
              showPercentage={showPercentage}
              animated={animated}
              gradient={true}
              glowEffect={true}
            />
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div 
            className="progress enhanced modern"
            role="progressbar" 
            aria-valuenow={animatedProgress} 
            aria-valuemin={0} 
            aria-valuemax={100} 
            aria-label={`進捗状況 ${animatedProgress}%`}
          >
            <div 
              className="progress-fill modern"
              style={{ width: `${animatedProgress}%` }}
            />
            <div className="progress-glow modern" style={{ width: `${animatedProgress}%` }} />
            
            {/* マイルストーンドット */}
            {totalQuestions && (
              <div className="progress-milestones">
                {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => {
                  const milestoneProgress = ((i + 1) / totalQuestions) * 100
                  const isReached = animatedProgress >= milestoneProgress
                  return (
                    <div 
                      key={i}
                      className={`milestone modern ${isReached ? 'reached' : ''}`}
                      style={{ left: `${milestoneProgress}%` }}
                      aria-hidden="true"
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .progress-container-modern {
          margin-bottom: 16px;
        }
        
        .progress-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .progress-info-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .progress-text-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .progress-fraction-modern {
          display: flex;
          align-items: baseline;
          gap: 4px;
          font-weight: 700;
          color: var(--color-text);
        }
        
        .current-question {
          font-size: 24px;
          color: var(--color-accent);
        }
        
        .divider {
          font-size: 18px;
          color: var(--color-text-secondary);
          opacity: 0.7;
        }
        
        .total-questions {
          font-size: 18px;
          color: var(--color-text-secondary);
        }
        
        .progress-status {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        
        .progress-ring-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .progress-bar-container {
          width: 100%;
        }
        
        .progress.enhanced.modern {
          height: 8px;
          position: relative;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .progress-fill.modern {
          height: 100%;
          background: linear-gradient(90deg, 
            #667eea 0%, 
            #764ba2 50%, 
            #f093fb 100%);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
          position: relative;
          overflow: hidden;
        }
        
        .progress-glow.modern {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            transparent 100%);
          border-radius: 4px;
          animation: progress-shimmer 2s infinite;
        }
        
        @keyframes progress-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .progress-milestones {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .milestone.modern {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.7);
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
          top: 50%;
          z-index: 2;
        }
        
        .milestone.modern.reached {
          background: #ffd700;
          border-color: #ffd700;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
          transform: translate(-50%, -50%) scale(1.3);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .progress-info-modern {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          
          .progress-ring-container {
            order: -1;
          }
          
          .current-question {
            font-size: 20px;
          }
          
          .total-questions {
            font-size: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .progress-layout {
            gap: 16px;
          }
          
          .progress-info-modern {
            gap: 12px;
          }
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .progress.enhanced.modern {
            background: rgba(255, 255, 255, 0.1);
          }
          
          .milestone.modern {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .progress-fill.modern {
            transition: none;
          }
          
          .progress-glow.modern {
            animation: none;
          }
          
          .milestone.modern {
            transition: none;
          }
        }
      `}</style>
    </GlassCard>
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
