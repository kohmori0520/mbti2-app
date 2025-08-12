import React from 'react'

interface GradientTextProps {
  children: React.ReactNode
  gradient?: 'primary' | 'secondary' | 'accent' | 'custom'
  customGradient?: string
  className?: string
  animate?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
}

export default function GradientText({
  children,
  gradient = 'primary',
  customGradient,
  className = '',
  animate = false,
  size = 'md',
  weight = 'semibold'
}: GradientTextProps) {
  const gradients = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    custom: customGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }

  const sizeClass = {
    sm: 'gradient-text-sm',
    md: 'gradient-text-md',
    lg: 'gradient-text-lg', 
    xl: 'gradient-text-xl',
    xxl: 'gradient-text-xxl'
  }[size]

  const weightClass = {
    normal: 'gradient-weight-normal',
    medium: 'gradient-weight-medium',
    semibold: 'gradient-weight-semibold',
    bold: 'gradient-weight-bold'
  }[weight]

  return (
    <span 
      className={`gradient-text ${sizeClass} ${weightClass} ${animate ? 'animated' : ''} ${className}`}
      style={{
        '--gradient': gradients[gradient]
      } as React.CSSProperties}
    >
      {children}
      
      <style>{`
        .gradient-text {
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
          position: relative;
        }
        
        .gradient-text.animated {
          background-size: 200% 200%;
          animation: gradientShift 3s ease-in-out infinite;
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        /* Sizes */
        .gradient-text-sm {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .gradient-text-md {
          font-size: 16px;
          line-height: 1.4;
        }
        
        .gradient-text-lg {
          font-size: 20px;
          line-height: 1.3;
        }
        
        .gradient-text-xl {
          font-size: 28px;
          line-height: 1.2;
        }
        
        .gradient-text-xxl {
          font-size: 36px;
          line-height: 1.1;
        }
        
        /* Weights */
        .gradient-weight-normal {
          font-weight: 400;
        }
        
        .gradient-weight-medium {
          font-weight: 500;
        }
        
        .gradient-weight-semibold {
          font-weight: 600;
        }
        
        .gradient-weight-bold {
          font-weight: 700;
        }
        
        /* Fallback for browsers that don't support background-clip */
        @supports not (-webkit-background-clip: text) {
          .gradient-text {
            color: var(--color-accent);
            background: none;
          }
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .gradient-text {
            filter: brightness(1.1);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .gradient-text.animated {
            animation: none;
            background-size: 100% 100%;
          }
        }
      `}</style>
    </span>
  )
}