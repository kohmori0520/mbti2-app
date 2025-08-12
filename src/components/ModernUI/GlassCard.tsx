import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  blur?: number
  opacity?: number
  border?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function GlassCard({
  children,
  className = '',
  blur = 10,
  opacity = 0.8,
  border = true,
  shadow = 'md',
  padding = 'md',
  rounded = 'lg'
}: GlassCardProps) {
  const shadowClass = {
    none: '',
    sm: 'glass-shadow-sm',
    md: 'glass-shadow-md',
    lg: 'glass-shadow-lg'
  }[shadow]

  const paddingClass = {
    sm: 'glass-padding-sm',
    md: 'glass-padding-md', 
    lg: 'glass-padding-lg'
  }[padding]

  const roundedClass = {
    sm: 'glass-rounded-sm',
    md: 'glass-rounded-md',
    lg: 'glass-rounded-lg',
    xl: 'glass-rounded-xl'
  }[rounded]

  return (
    <div 
      className={`glass-card ${shadowClass} ${paddingClass} ${roundedClass} ${className}`}
      style={{
        '--glass-blur': `${blur}px`,
        '--glass-opacity': opacity,
        '--glass-border': border ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'
      } as React.CSSProperties}
    >
      <div className="glass-content">
        {children}
      </div>
      
      <style>{`
        .glass-card {
          position: relative;
          background: rgba(255, 255, 255, var(--glass-opacity));
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          border: var(--glass-border);
          transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
          overflow: hidden;
        }
        
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
        }
        
        .glass-content {
          position: relative;
          z-index: 1;
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, calc(var(--glass-opacity) + 0.1));
          transform: translateY(-2px);
        }
        
        .glass-shadow-sm {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .glass-shadow-md {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .glass-shadow-lg {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .glass-padding-sm { padding: 1rem; }
        .glass-padding-md { padding: 1.5rem; }
        .glass-padding-lg { padding: 2rem; }
        
        .glass-rounded-sm { border-radius: 8px; }
        .glass-rounded-md { border-radius: 12px; }
        .glass-rounded-lg { border-radius: 16px; }
        .glass-rounded-xl { border-radius: 24px; }
        
        @media (prefers-color-scheme: dark) {
          .glass-card {
            background: rgba(28, 28, 30, var(--glass-opacity));
            border: var(--glass-border);
          }
          
          .glass-card::before {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.05) 0%, 
              rgba(255, 255, 255, 0.02) 100%);
          }
          
          .glass-card:hover {
            background: rgba(28, 28, 30, calc(var(--glass-opacity) + 0.1));
          }
        }
      `}</style>
    </div>
  )
}