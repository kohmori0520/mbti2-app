import React, { useState, useEffect } from 'react'

interface NavigationStep {
  id: string
  label: string
  description?: string
  completed?: boolean
  current?: boolean
  disabled?: boolean
}

interface EnhancedNavigationProps {
  steps: NavigationStep[]
  currentStep: string
  onStepClick?: (stepId: string) => void
  showProgress?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export default function EnhancedNavigation({
  steps,
  currentStep,
  onStepClick,
  showProgress = true,
  orientation = 'horizontal',
  className = ''
}: EnhancedNavigationProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null)
  const currentIndex = steps.findIndex(step => step.id === currentStep)
  const completedSteps = steps.filter(step => step.completed).length
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  return (
    <nav className={`enhanced-navigation ${orientation} ${className}`}>
      {showProgress && (
        <div className="navigation-progress">
          <div className="progress-label">
            進捗: {completedSteps}/{steps.length} ({Math.round(progress)}%)
          </div>
          <div className="progress-bar-nav">
            <div 
              className="progress-fill-nav"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="navigation-steps">
        {steps.map((step, index) => {
          const isCompleted = step.completed
          const isCurrent = step.id === currentStep
          const isDisabled = step.disabled
          const isPrevious = index < currentIndex
          const isHovered = hoveredStep === step.id
          
          return (
            <div
              key={step.id}
              className={`navigation-step ${
                isCompleted ? 'completed' : ''
              } ${
                isCurrent ? 'current' : ''
              } ${
                isDisabled ? 'disabled' : ''
              } ${
                isPrevious ? 'previous' : ''
              } ${
                isHovered ? 'hovered' : ''
              }`}
              onClick={() => !isDisabled && onStepClick?.(step.id)}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-current={isCurrent ? 'step' : undefined}
              aria-disabled={isDisabled}
            >
              <div className="step-indicator">
                <div className="step-number">
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </div>
              
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                {step.description && (
                  <div className="step-description">{step.description}</div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="step-connector" />
              )}
            </div>
          )
        })}
      </div>
      
      <style jsx>{`
        .enhanced-navigation {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
        }
        
        .navigation-progress {
          margin-bottom: 1.5rem;
        }
        
        .progress-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .progress-bar-nav {
          height: 6px;
          background: var(--color-border);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill-nav {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .navigation-steps {
          display: flex;
          gap: 1rem;
        }
        
        .horizontal .navigation-steps {
          flex-direction: row;
          align-items: center;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        
        .vertical .navigation-steps {
          flex-direction: column;
          align-items: stretch;
        }
        
        .navigation-step {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
          min-width: fit-content;
        }
        
        .navigation-step:hover:not(.disabled) {
          background: rgba(0, 122, 255, 0.05);
          transform: translateY(-1px);
        }
        
        .navigation-step.current {
          background: rgba(0, 122, 255, 0.1);
          border: 1px solid rgba(0, 122, 255, 0.2);
        }
        
        .navigation-step.completed {
          background: rgba(40, 167, 69, 0.05);
        }
        
        .navigation-step.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .step-indicator {
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }
        
        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-border);
          color: var(--color-text-secondary);
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .navigation-step.current .step-number {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
        }
        
        .navigation-step.completed .step-number {
          background: #28a745;
          color: white;
        }
        
        .navigation-step.hovered:not(.disabled) .step-number {
          transform: scale(1.1);
        }
        
        .step-content {
          flex: 1;
          min-width: 0;
        }
        
        .step-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .step-description {
          font-size: 12px;
          color: var(--color-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .navigation-step.current .step-label {
          color: var(--color-accent);
        }
        
        .step-connector {
          position: absolute;
          background: var(--color-border);
          transition: background-color 0.2s ease;
        }
        
        .horizontal .step-connector {
          right: -1rem;
          top: 50%;
          width: 1rem;
          height: 2px;
          transform: translateY(-50%);
        }
        
        .vertical .step-connector {
          bottom: -1rem;
          left: 15px;
          width: 2px;
          height: 1rem;
        }
        
        .navigation-step.completed .step-connector {
          background: #28a745;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .enhanced-navigation {
            padding: 1rem;
          }
          
          .horizontal .navigation-steps {
            gap: 0.5rem;
          }
          
          .navigation-step {
            padding: 0.5rem;
            gap: 0.5rem;
          }
          
          .step-number {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }
          
          .step-label {
            font-size: 13px;
          }
          
          .step-description {
            font-size: 11px;
          }
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .navigation-step:hover:not(.disabled) {
            background: rgba(0, 122, 255, 0.1);
          }
          
          .navigation-step.current {
            background: rgba(0, 122, 255, 0.15);
            border-color: rgba(0, 122, 255, 0.3);
          }
          
          .navigation-step.completed {
            background: rgba(40, 167, 69, 0.1);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .navigation-step {
            transition: none;
          }
          
          .step-number {
            transition: none;
          }
          
          .navigation-step.hovered:not(.disabled) .step-number {
            transform: none;
          }
          
          .progress-fill-nav {
            transition: none;
          }
        }
      `}</style>
    </nav>
  )
}