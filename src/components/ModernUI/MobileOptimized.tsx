import React, { useState, useEffect, useRef, TouchEvent } from 'react'

interface SwipeGestureProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export function SwipeGesture({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = ''
}: SwipeGestureProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft()
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight()
      }
    } else {
      // Vertical swipe
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp()
      }
      if (isDownSwipe && onSwipeDown) {
        onSwipeDown()
      }
    }
  }

  return (
    <div
      className={`swipe-gesture ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      {children}
      
      <style jsx>{`
        .swipe-gesture {
          touch-action: pan-y;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className = ''
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && startY > 0) {
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, (currentY - startY) * 0.5)
      setPullDistance(Math.min(distance, threshold * 1.5))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
    setStartY(0)
  }

  const pullProgress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="pull-indicator"
        style={{
          height: `${pullDistance}px`,
          opacity: pullProgress
        }}
      >
        <div className="pull-content">
          {isRefreshing ? (
            <div className="refresh-spinner" />
          ) : (
            <div 
              className="pull-arrow"
              style={{
                transform: `rotate(${pullProgress >= 1 ? 180 : 0}deg)`
              }}
            >
              ↓
            </div>
          )}
          <span className="pull-text">
            {isRefreshing ? '更新中...' : pullProgress >= 1 ? '離して更新' : '下に引いて更新'}
          </span>
        </div>
      </div>
      
      <div 
        className="pull-content-wrapper"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
      
      <style jsx>{`
        .pull-to-refresh {
          overflow-y: auto;
          position: relative;
          height: 100%;
        }
        
        .pull-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
          transition: opacity 0.2s ease;
        }
        
        .pull-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
        }
        
        .pull-arrow {
          font-size: 1.5rem;
          color: var(--color-accent);
          transition: transform 0.3s ease;
        }
        
        .refresh-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--color-border);
          border-top: 2px solid var(--color-accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .pull-text {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        
        .pull-content-wrapper {
          transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
      `}</style>
    </div>
  )
}

// Mobile-specific button component
interface MobileButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  haptic?: boolean
  className?: string
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  haptic = true,
  className = ''
}: MobileButtonProps) {
  const handleClick = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
    onClick?.()
  }

  return (
    <button
      className={`mobile-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${className}`}
      onClick={handleClick}
    >
      {children}
      
      <style jsx>{`
        .mobile-button {
          border: none;
          border-radius: 12px;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
        }
        
        .mobile-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .mobile-button:active::before {
          width: 300px;
          height: 300px;
        }
        
        /* Variants */
        .mobile-button.primary {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }
        
        .mobile-button.primary:active {
          background: #0056cc;
          transform: translateY(1px);
        }
        
        .mobile-button.secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .mobile-button.secondary:active {
          background: var(--color-bg);
          transform: translateY(1px);
        }
        
        .mobile-button.ghost {
          background: transparent;
          color: var(--color-accent);
        }
        
        .mobile-button.ghost:active {
          background: rgba(0, 122, 255, 0.1);
        }
        
        /* Sizes */
        .mobile-button.sm {
          padding: 8px 16px;
          font-size: 14px;
          min-height: 36px;
        }
        
        .mobile-button.md {
          padding: 12px 24px;
          font-size: 16px;
          min-height: 48px;
        }
        
        .mobile-button.lg {
          padding: 16px 32px;
          font-size: 18px;
          min-height: 56px;
        }
        
        .mobile-button.full-width {
          width: 100%;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .mobile-button {
            transition: none;
          }
          
          .mobile-button::before {
            transition: none;
          }
          
          .mobile-button:active {
            transform: none;
          }
        }
      `}</style>
    </button>
  )
}

// Safe area support component
interface SafeAreaProps {
  children: React.ReactNode
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
  className?: string
}

export function SafeArea({
  children,
  edges = ['top', 'bottom'],
  className = ''
}: SafeAreaProps) {
  const paddingStyle = edges.reduce((acc, edge) => {
    acc[`padding-${edge}`] = `env(safe-area-inset-${edge})`
    return acc
  }, {} as Record<string, string>)

  return (
    <div className={`safe-area ${className}`} style={paddingStyle}>
      {children}
    </div>
  )
}

// Hook for detecting mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}