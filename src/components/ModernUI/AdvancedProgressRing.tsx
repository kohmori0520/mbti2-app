import React from 'react'

interface AdvancedProgressRingProps {
  progress: number // 0-1
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  animated?: boolean
  gradient?: boolean
  glowEffect?: boolean
  className?: string
}

export default function AdvancedProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'var(--color-accent)',
  backgroundColor = 'var(--color-border)',
  showPercentage = true,
  animated = true,
  gradient = false,
  glowEffect = false,
  className = ''
}: AdvancedProgressRingProps) {
  const center = size / 2
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress * circumference)
  
  const percentage = Math.round(progress * 100)
  
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`
  const glowId = `progress-glow-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`progress-ring-container ${className}`}>
      <svg 
        width={size} 
        height={size} 
        className="progress-ring"
        style={{
          transform: 'rotate(-90deg)',
          filter: glowEffect ? `url(#${glowId})` : 'none'
        }}
      >
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#f093fb" />
            </linearGradient>
          )}
          {glowEffect && (
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={animated ? 'progress-circle-animated' : ''}
        />
        
        {/* Animated dots at progress end */}
        {animated && progress > 0 && (
          <circle
            cx={center + radius * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
            cy={center + radius * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
            r={strokeWidth / 3}
            fill={gradient ? `url(#${gradientId})` : color}
            className="progress-dot"
          />
        )}
      </svg>
      
      {showPercentage && (
        <div className="progress-percentage">
          <span className="percentage-number">{percentage}</span>
          <span className="percentage-symbol">%</span>
        </div>
      )}
      
      <style jsx>{`
        .progress-ring-container {
          position: relative;
          display: inline-block;
        }
        
        .progress-ring {
          overflow: visible;
        }
        
        .progress-circle-animated {
          transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .progress-dot {
          animation: ${animated ? 'pulse 2s infinite' : 'none'};
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
        
        .progress-percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          font-weight: 700;
          color: var(--color-text);
          pointer-events: none;
        }
        
        .percentage-number {
          font-size: ${size * 0.2}px;
          line-height: 1;
        }
        
        .percentage-symbol {
          font-size: ${size * 0.12}px;
          opacity: 0.7;
          margin-left: 2px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .percentage-number {
            font-size: ${Math.min(size * 0.2, 24)}px;
          }
          
          .percentage-symbol {
            font-size: ${Math.min(size * 0.12, 14)}px;
          }
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .progress-percentage {
            color: var(--color-text);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .progress-circle-animated {
            transition: none;
          }
          
          .progress-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}