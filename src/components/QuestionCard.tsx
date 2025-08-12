import React, { useEffect, useState } from 'react'
import type { Question } from '../types'
import { GlassCard, MicroInteraction, SmartTooltip, NeomorphicButton, GradientText } from './ModernUI'

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
      <GlassCard 
        className="question-card-glass"
        blur={15}
        opacity={0.95}
        shadow="lg"
        padding="lg"
        rounded="xl"
      >
        <div className="question-header">
          <div className="question-number">
            <span className="question-label">質問</span>
            <span className="question-id">#{q.id}</span>
          </div>
        </div>
        
        <div className="question-content">
          <GradientText 
            size="lg" 
            weight="bold" 
            gradient="primary"
            animate={true}
            className="question-text"
          >
            {q.question}
          </GradientText>
        </div>
        
        <div className="options-grid">
          {q.options.map((opt, index) => {
            const shortcut = opt.key === 'A' ? '1' : '2'
            const isSelected = selectedOption === opt.key
            const shouldAnimate = isAnimating && isSelected
            
            return (
              <MicroInteraction
                key={opt.key}
                type="hover"
                effect="lift"
                intensity="normal"
                disabled={isAnimating}
              >
                <NeomorphicButton
                  onClick={() => handleOptionClick(opt.key)}
                  variant={isSelected ? 'pressed' : 'raised'}
                  size="lg"
                  disabled={isAnimating}
                  ariaLabel={`選択肢${opt.key}: ${opt.label} (ショートカット: ${shortcut})`}
                  className={`option-modern ${
                    isSelected ? 'selected' : ''
                  } ${
                    shouldAnimate ? 'animating' : ''
                  } ${
                    isAnimating && !isSelected ? 'fading' : ''
                  }`}
                >
                  <div className="option-header">
                    <SmartTooltip 
                      content={`キーボードショートカット: ${shortcut}`}
                      theme="glass"
                      position="top"
                    >
                      <span className="option-key">{shortcut}</span>
                    </SmartTooltip>
                    <div className="option-indicator" />
                  </div>
                  <div className="option-content">
                    <div className="option-text">{opt.label}</div>
                  </div>
                </NeomorphicButton>
              </MicroInteraction>
            )
          })}
        </div>
        
        <div className="question-actions">
          <MicroInteraction type="hover" effect="scale" intensity="subtle">
            <NeomorphicButton 
              onClick={onBack} 
              variant="flat"
              size="md"
              disabled={!canBack || isAnimating}
              ariaLabel="前の質問に戻る（←）" 
              className="action-btn-modern"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              戻る
            </NeomorphicButton>
          </MicroInteraction>
          <MicroInteraction type="hover" effect="scale" intensity="subtle">
            <NeomorphicButton 
              onClick={onSkip} 
              variant="flat"
              size="md"
              disabled={isAnimating}
              ariaLabel="この質問をスキップ（→）"
              className="action-btn-modern"
            >
              スキップ
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </NeomorphicButton>
          </MicroInteraction>
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
      </GlassCard>
      
      <style>{`
        .question-card-container {
          animation: questionSlideIn 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .question-card-glass {
          transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .question-card-glass:hover {
          transform: translateY(-2px);
        }
        
        @keyframes questionSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .question-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .question-number {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .question-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        
        .question-id {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-accent);
          background: rgba(0, 122, 255, 0.1);
          padding: 2px 8px;
          border-radius: 6px;
        }
        
        .question-content {
          margin-bottom: 32px;
          text-align: center;
        }
        
        .question-text {
          line-height: 1.4;
          margin: 0;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .option-modern {
          width: 100%;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          animation-delay: var(--delay, 0ms);
        }
        
        .option-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .option-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(0, 122, 255, 0.1);
          border: 1px solid rgba(0, 122, 255, 0.2);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--color-accent);
          transition: all 0.2s ease;
        }
        
        .option-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-border);
          transition: all 0.2s ease;
        }
        
        .option-modern:hover .option-indicator {
          background: var(--color-accent);
          box-shadow: 0 0 8px rgba(0, 122, 255, 0.4);
        }
        
        .option-content {
          flex: 1;
        }
        
        .option-text {
          font-size: 15px;
          line-height: 1.5;
          color: var(--color-text);
          margin: 0;
        }
        
        .option-modern.selected {
          background: rgba(0, 122, 255, 0.1) !important;
          border-color: var(--color-accent) !important;
        }
        
        .option-modern.selected .option-key {
          background: var(--color-accent);
          color: white;
        }
        
        .option-modern.selected .option-indicator {
          background: var(--color-accent);
          box-shadow: 0 0 12px rgba(0, 122, 255, 0.6);
        }
        
        .option-modern.fading {
          opacity: 0.4;
          transform: scale(0.98);
        }
        
        .question-actions {
          display: flex;
          gap: 16px;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .action-btn-modern {
          flex: 1;
          max-width: 140px;
        }
        
        .keyboard-hints {
          display: flex;
          justify-content: center;
          gap: 24px;
          padding: 16px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 8px;
        }
        
        .hint-group {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }
        
        .keyboard-hints kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          color: var(--color-text-secondary);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .options-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .option-modern {
            min-height: 80px;
          }
          
          .question-content {
            margin-bottom: 24px;
          }
          
          .question-actions {
            gap: 12px;
          }
          
          .keyboard-hints {
            flex-direction: column;
            gap: 12px;
          }
          
          .hint-group {
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .question-actions {
            flex-direction: column;
          }
          
          .action-btn-modern {
            max-width: none;
          }
        }
        
        /* Dark mode specific adjustments */
        @media (prefers-color-scheme: dark) {
          .option-key {
            background: rgba(0, 122, 255, 0.2);
            border-color: rgba(0, 122, 255, 0.3);
          }
          
          .keyboard-hints kbd {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .question-card-container {
            animation: none;
          }
          
          .option-modern {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
