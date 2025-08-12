import React, { useState, useRef, useEffect } from 'react'

interface SmartTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  delay?: number
  maxWidth?: number
  theme?: 'light' | 'dark' | 'glass'
  arrow?: boolean
  interactive?: boolean
  disabled?: boolean
  className?: string
}

export default function SmartTooltip({
  children,
  content,
  position = 'auto',
  delay = 500,
  maxWidth = 200,
  theme = 'dark',
  arrow = true,
  interactive = false,
  disabled = false,
  className = ''
}: SmartTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [calculatedPosition, setCalculatedPosition] = useState<string>(position)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const showTooltip = () => {
    if (disabled) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      calculatePosition()
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (!interactive) {
      setIsVisible(false)
    } else {
      // Add small delay for interactive tooltips
      setTimeout(() => setIsVisible(false), 100)
    }
  }

  const calculatePosition = () => {
    if (position !== 'auto' || !triggerRef.current || !tooltipRef.current) {
      setCalculatedPosition(position)
      return
    }

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let bestPosition = 'top'

    // Check if there's space above
    if (triggerRect.top >= tooltipRect.height + 10) {
      bestPosition = 'top'
    }
    // Check if there's space below
    else if (triggerRect.bottom + tooltipRect.height + 10 <= viewportHeight) {
      bestPosition = 'bottom'
    }
    // Check if there's space to the right
    else if (triggerRect.right + tooltipRect.width + 10 <= viewportWidth) {
      bestPosition = 'right'
    }
    // Check if there's space to the left
    else if (triggerRect.left >= tooltipRect.width + 10) {
      bestPosition = 'left'
    }

    setCalculatedPosition(bestPosition)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const themeClass = {
    light: 'tooltip-light',
    dark: 'tooltip-dark',
    glass: 'tooltip-glass'
  }[theme]

  return (
    <div 
      ref={triggerRef}
      className={`smart-tooltip-trigger ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`smart-tooltip ${themeClass} position-${calculatedPosition}`}
          onMouseEnter={interactive ? () => setIsVisible(true) : undefined}
          onMouseLeave={interactive ? hideTooltip : undefined}
          style={{ maxWidth }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          <div className="tooltip-content">
            {content}
          </div>
          {arrow && <div className="tooltip-arrow" />}
        </div>
      )}
      
      <style>{`
        .smart-tooltip-trigger {
          position: relative;
          display: inline-block;
        }
        
        .smart-tooltip {
          position: absolute;
          z-index: 1000;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
          white-space: pre-wrap;
          word-wrap: break-word;
          pointer-events: ${interactive ? 'auto' : 'none'};
          animation: tooltipFadeIn 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        @keyframes tooltipFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        /* Themes */
        .tooltip-light {
          background: white;
          color: var(--color-text);
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .tooltip-dark {
          background: #2c2c2e;
          color: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .tooltip-glass {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: var(--color-text);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Positions */
        .position-top {
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }
        
        .position-bottom {
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        }
        
        .position-left {
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }
        
        .position-right {
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        }
        
        /* Arrows */
        .tooltip-arrow {
          position: absolute;
          width: 8px;
          height: 8px;
          background: inherit;
          border: inherit;
        }
        
        .position-top .tooltip-arrow {
          top: 100%;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          border-top: none;
          border-left: none;
        }
        
        .position-bottom .tooltip-arrow {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          border-bottom: none;
          border-right: none;
        }
        
        .position-left .tooltip-arrow {
          left: 100%;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-left: none;
          border-bottom: none;
        }
        
        .position-right .tooltip-arrow {
          right: 100%;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-right: none;
          border-top: none;
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .tooltip-light {
            background: var(--color-surface);
            border-color: var(--color-border);
          }
          
          .tooltip-glass {
            background: rgba(28, 28, 30, 0.9);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .smart-tooltip {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}