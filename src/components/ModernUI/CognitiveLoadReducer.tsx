import React, { useState, useEffect, useRef } from 'react'

// Progressive disclosure component
interface ProgressiveDisclosureProps {
  children: React.ReactNode
  summary: string
  defaultOpen?: boolean
  icon?: React.ReactNode
  className?: string
}

export function ProgressiveDisclosure({
  children,
  summary,
  defaultOpen = false,
  icon,
  className = ''
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [children, isOpen])

  return (
    <div className={`progressive-disclosure ${className}`}>
      <button
        className="disclosure-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="disclosure-content"
      >
        <div className="trigger-content">
          {icon && <span className="trigger-icon">{icon}</span>}
          <span className="trigger-text">{summary}</span>
        </div>
        <div className={`trigger-arrow ${isOpen ? 'open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      
      <div
        id="disclosure-content"
        className="disclosure-content"
        style={{
          height: isOpen ? `${contentHeight}px` : '0px',
          opacity: isOpen ? 1 : 0
        }}
      >
        <div ref={contentRef} className="content-inner">
          {children}
        </div>
      </div>
      
      <style>{`
        .progressive-disclosure {
          border: 1px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        
        .progressive-disclosure:hover {
          border-color: var(--color-accent);
        }
        
        .disclosure-trigger {
          width: 100%;
          background: var(--color-surface);
          border: none;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .disclosure-trigger:hover {
          background: rgba(0, 122, 255, 0.02);
        }
        
        .trigger-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
        }
        
        .trigger-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: var(--color-accent);
        }
        
        .trigger-text {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text);
        }
        
        .trigger-arrow {
          color: var(--color-text-secondary);
          transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .trigger-arrow.open {
          transform: rotate(180deg);
        }
        
        .disclosure-content {
          overflow: hidden;
          transition: height 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
                      opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
          background: var(--color-bg);
        }
        
        .content-inner {
          padding: 1rem;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .disclosure-content {
            transition: none;
          }
          
          .trigger-arrow {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}

// Information chunking component
interface InformationChunkProps {
  title: string
  children: React.ReactNode
  priority?: 'high' | 'medium' | 'low'
  icon?: React.ReactNode
  collapsible?: boolean
  className?: string
}

export function InformationChunk({
  title,
  children,
  priority = 'medium',
  icon,
  collapsible = false,
  className = ''
}: InformationChunkProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const priorityStyles = {
    high: {
      border: '2px solid var(--color-accent)',
      background: 'rgba(0, 122, 255, 0.02)'
    },
    medium: {
      border: '1px solid var(--color-border)',
      background: 'var(--color-surface)'
    },
    low: {
      border: '1px solid rgba(0, 0, 0, 0.05)',
      background: 'var(--color-bg)'
    }
  }

  return (
    <div
      className={`information-chunk priority-${priority} ${className}`}
      style={priorityStyles[priority]}
    >
      <div className="chunk-header">
        {icon && <span className="chunk-icon">{icon}</span>}
        <h3 className="chunk-title">{title}</h3>
        {collapsible && (
          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? '展開' : '折りたたむ'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="chunk-content">
          {children}
        </div>
      )}
      
      <style>{`
        .information-chunk {
          border-radius: 12px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .information-chunk.priority-high {
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.1);
        }
        
        .chunk-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.5);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .chunk-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          color: var(--color-accent);
        }
        
        .chunk-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }
        
        .collapse-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .collapse-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--color-text);
        }
        
        .chunk-content {
          padding: 1rem;
          line-height: 1.6;
        }
        
        .priority-high .chunk-title {
          color: var(--color-accent);
        }
        
        .priority-low {
          opacity: 0.8;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .information-chunk {
            transition: none;
          }
          
          .collapse-btn svg {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}

// Context-aware help component
interface ContextualHelpProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click' | 'focus'
  delay?: number
  className?: string
}

export function ContextualHelp({
  content,
  position = 'top',
  trigger = 'hover',
  delay = 500,
  className = ''
}: ContextualHelpProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showHelp = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    const id = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    setTimeoutId(id)
  }

  const hideHelp = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    setIsVisible(false)
  }

  const triggerProps = {
    hover: {
      onMouseEnter: showHelp,
      onMouseLeave: hideHelp
    },
    click: {
      onClick: () => setIsVisible(!isVisible)
    },
    focus: {
      onFocus: showHelp,
      onBlur: hideHelp
    }
  }

  return (
    <div className={`contextual-help ${className}`}>
      <button
        className="help-trigger"
        aria-label="ヘルプを表示"
        {...triggerProps[trigger]}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 12V12.01M8 5.5C8 5.5 8 4 6.5 4C5.5 4 5 4.5 5 5.5H8V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      
      {isVisible && (
        <div className={`help-tooltip position-${position}`}>
          <div className="tooltip-content">
            {content}
          </div>
          <div className="tooltip-arrow" />
        </div>
      )}
      
      <style>{`
        .contextual-help {
          position: relative;
          display: inline-block;
        }
        
        .help-trigger {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .help-trigger:hover {
          color: var(--color-accent);
          background: rgba(0, 122, 255, 0.1);
        }
        
        .help-tooltip {
          position: absolute;
          z-index: 1000;
          background: var(--color-text);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.4;
          white-space: nowrap;
          max-width: 200px;
          white-space: normal;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: tooltipFadeIn 0.2s ease;
        }
        
        @keyframes tooltipFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .tooltip-arrow {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--color-text);
          transform: rotate(45deg);
        }
        
        .position-top {
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }
        
        .position-top .tooltip-arrow {
          top: 100%;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
        }
        
        .position-bottom {
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }
        
        .position-bottom .tooltip-arrow {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
        }
        
        .position-left {
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }
        
        .position-left .tooltip-arrow {
          left: 100%;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        }
        
        .position-right {
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }
        
        .position-right .tooltip-arrow {
          right: 100%;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .help-tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

// Focus management component
interface FocusGuideProps {
  children: React.ReactNode
  currentStep?: number
  totalSteps?: number
  onStepChange?: (step: number) => void
  className?: string
}

export function FocusGuide({
  children,
  currentStep = 0,
  totalSteps = 1,
  onStepChange,
  className = ''
}: FocusGuideProps) {
  const childArray = React.Children.toArray(children)
  const activeChild = childArray[currentStep]

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      onStepChange?.(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1)
    }
  }

  return (
    <div className={`focus-guide ${className}`}>
      <div className="focus-content">
        {activeChild}
      </div>
      
      {totalSteps > 1 && (
        <div className="focus-navigation">
          <button
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            aria-label="前のステップ"
          >
            ←
          </button>
          
          <div className="step-indicators">
            {Array.from({ length: totalSteps }, (_, index) => (
              <button
                key={index}
                className={`step-indicator ${index === currentStep ? 'active' : ''}`}
                onClick={() => onStepChange?.(index)}
                aria-label={`ステップ ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            className="nav-btn"
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            aria-label="次のステップ"
          >
            →
          </button>
        </div>
      )}
      
      <style>{`
        .focus-guide {
          border: 2px solid var(--color-accent);
          border-radius: 16px;
          padding: 1.5rem;
          background: rgba(0, 122, 255, 0.02);
        }
        
        .focus-content {
          margin-bottom: 1rem;
        }
        
        .focus-navigation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        
        .nav-btn {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          color: var(--color-text);
          font-size: 16px;
          transition: all 0.2s ease;
        }
        
        .nav-btn:hover:not(:disabled) {
          background: var(--color-accent);
          color: white;
          border-color: var(--color-accent);
        }
        
        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .step-indicators {
          display: flex;
          gap: 0.5rem;
        }
        
        .step-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          background: var(--color-surface);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .step-indicator.active {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
        
        .step-indicator:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}