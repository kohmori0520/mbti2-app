import React, { useState, useCallback } from 'react'

interface MicroInteractionProps {
  children: React.ReactNode
  type?: 'hover' | 'click' | 'focus' | 'none'
  effect?: 'scale' | 'rotate' | 'slide' | 'bounce' | 'pulse' | 'glow' | 'lift'
  intensity?: 'subtle' | 'normal' | 'strong'
  duration?: number
  className?: string
  disabled?: boolean
  onTrigger?: () => void
}

export default function MicroInteraction({
  children,
  type = 'hover',
  effect = 'scale',
  intensity = 'normal',
  duration = 200,
  className = '',
  disabled = false,
  onTrigger
}: MicroInteractionProps) {
  const [isActive, setIsActive] = useState(false)
  const [isTriggered, setIsTriggered] = useState(false)

  const intensityScale = {
    subtle: 0.5,
    normal: 1,
    strong: 1.5
  }[intensity]

  const triggers = {
    hover: {
      onMouseEnter: () => {
        if (!disabled) {
          setIsActive(true)
          onTrigger?.()
        }
      },
      onMouseLeave: () => setIsActive(false)
    },
    click: {
      onClick: () => {
        if (!disabled) {
          setIsTriggered(true)
          onTrigger?.()
          setTimeout(() => setIsTriggered(false), duration)
        }
      }
    },
    focus: {
      onFocus: () => {
        if (!disabled) {
          setIsActive(true)
          onTrigger?.()
        }
      },
      onBlur: () => setIsActive(false)
    },
    none: {}
  }

  const getTransform = useCallback(() => {
    const active = type === 'click' ? isTriggered : isActive
    if (!active || disabled) return 'none'

    switch (effect) {
      case 'scale':
        return `scale(${1 + 0.05 * intensityScale})`
      case 'rotate':
        return `rotate(${5 * intensityScale}deg)`
      case 'slide':
        return `translateX(${4 * intensityScale}px)`
      case 'bounce':
        return `translateY(${-4 * intensityScale}px)`
      case 'lift':
        return `translateY(${-2 * intensityScale}px)`
      default:
        return 'none'
    }
  }, [isActive, isTriggered, effect, intensityScale, disabled, type])

  const getFilterEffect = useCallback(() => {
    const active = type === 'click' ? isTriggered : isActive
    if (!active || disabled) return 'none'

    switch (effect) {
      case 'glow':
        return `drop-shadow(0 0 ${8 * intensityScale}px rgba(0, 122, 255, 0.5))`
      case 'pulse':
        return `brightness(${1 + 0.1 * intensityScale})`
      default:
        return 'none'
    }
  }, [isActive, isTriggered, effect, intensityScale, disabled, type])

  return (
    <div
      className={`micro-interaction ${className}`}
      {...triggers[type]}
      style={{
        '--duration': `${duration}ms`,
        '--transform': getTransform(),
        '--filter': getFilterEffect()
      } as React.CSSProperties}
    >
      {children}
      
      <style>{`
        .micro-interaction {
          display: inline-block;
          transition: 
            transform var(--duration) cubic-bezier(0.22, 0.61, 0.36, 1),
            filter var(--duration) cubic-bezier(0.22, 0.61, 0.36, 1),
            box-shadow var(--duration) cubic-bezier(0.22, 0.61, 0.36, 1);
          transform: var(--transform);
          filter: var(--filter);
        }
        
        .micro-interaction:hover {
          ${effect === 'lift' ? `box-shadow: 0 ${4 * intensityScale}px ${12 * intensityScale}px rgba(0, 0, 0, 0.15);` : ''}
        }
        
        @media (prefers-reduced-motion: reduce) {
          .micro-interaction {
            transition: none;
            transform: none;
            filter: none;
          }
        }
      `}</style>
    </div>
  )
}