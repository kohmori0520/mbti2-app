import React from 'react'

interface AccessibleCardProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  role?: string
  ariaLabel?: string
  ariaLabelledBy?: string
  ariaDescribedBy?: string
  tabIndex?: number
  onClick?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  className?: string
  focusable?: boolean
  interactive?: boolean
}

export default function AccessibleCard({
  children,
  as: Component = 'div',
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  tabIndex,
  onClick,
  onKeyDown,
  className = '',
  focusable = false,
  interactive = false
}: AccessibleCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
    onKeyDown?.(e)
  }

  const componentProps: any = {
    className: `accessible-card ${interactive ? 'interactive' : ''} ${className}`,
    role: role || (interactive ? 'button' : undefined),
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    tabIndex: tabIndex !== undefined ? tabIndex : (focusable || interactive ? 0 : undefined),
    onClick: interactive ? onClick : undefined,
    onKeyDown: interactive ? handleKeyDown : onKeyDown
  }

  return (
    <Component {...componentProps}>
      {children}
      
      <style>{`
        .accessible-card {
          position: relative;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .accessible-card.interactive {
          cursor: pointer;
        }
        
        .accessible-card:focus-visible {
          outline: 3px solid var(--color-accent);
          outline-offset: 2px;
          box-shadow: 
            0 0 0 3px rgba(0, 122, 255, 0.3),
            0 4px 12px rgba(0, 122, 255, 0.2);
        }
        
        .accessible-card.interactive:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .accessible-card.interactive:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .accessible-card:focus-visible {
            outline: 3px solid currentColor;
            outline-offset: 2px;
            box-shadow: none;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .accessible-card {
            transition: none;
          }
          
          .accessible-card.interactive:hover {
            transform: none;
          }
          
          .accessible-card.interactive:active {
            transform: none;
          }
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .accessible-card:focus-visible {
            outline-color: #0a84ff;
            box-shadow: 
              0 0 0 3px rgba(10, 132, 255, 0.4),
              0 4px 12px rgba(10, 132, 255, 0.3);
          }
        }
      `}</style>
    </Component>
  )
}