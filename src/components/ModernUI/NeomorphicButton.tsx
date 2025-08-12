import React, { useState } from 'react'

interface NeomorphicButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'raised' | 'pressed' | 'flat'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

export default function NeomorphicButton({
  children,
  onClick,
  variant = 'raised',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ariaLabel
}: NeomorphicButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => setIsPressed(false)

  const variantClass = {
    raised: 'neomorphic-raised',
    pressed: 'neomorphic-pressed', 
    flat: 'neomorphic-flat'
  }[variant]

  const sizeClass = {
    sm: 'neomorphic-sm',
    md: 'neomorphic-md',
    lg: 'neomorphic-lg'
  }[size]

  return (
    <button
      type={type}
      className={`neomorphic-button ${variantClass} ${sizeClass} ${isPressed ? 'active' : ''} ${className}`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <span className="neomorphic-content">
        {children}
      </span>
      
      <style>{`
        .neomorphic-button {
          position: relative;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
          background: var(--color-surface);
          color: var(--color-text);
          overflow: hidden;
        }
        
        .neomorphic-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .neomorphic-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .neomorphic-button:hover::before {
          opacity: 1;
        }
        
        .neomorphic-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        /* Variants */
        .neomorphic-raised {
          box-shadow: 
            8px 8px 16px rgba(0, 0, 0, 0.1),
            -8px -8px 16px rgba(255, 255, 255, 0.5);
        }
        
        .neomorphic-raised:hover {
          box-shadow: 
            12px 12px 20px rgba(0, 0, 0, 0.15),
            -12px -12px 20px rgba(255, 255, 255, 0.6);
          transform: translateY(-1px);
        }
        
        .neomorphic-raised.active {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.1),
            inset -4px -4px 8px rgba(255, 255, 255, 0.5);
          transform: translateY(0);
        }
        
        .neomorphic-pressed {
          box-shadow: 
            inset 4px 4px 8px rgba(0, 0, 0, 0.1),
            inset -4px -4px 8px rgba(255, 255, 255, 0.5);
        }
        
        .neomorphic-flat {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, var(--color-surface) 0%, rgba(0, 0, 0, 0.02) 100%);
        }
        
        /* Sizes */
        .neomorphic-sm {
          padding: 8px 16px;
          font-size: 14px;
          border-radius: 8px;
          min-height: 36px;
        }
        
        .neomorphic-md {
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 12px;
          min-height: 44px;
        }
        
        .neomorphic-lg {
          padding: 16px 32px;
          font-size: 18px;
          border-radius: 16px;
          min-height: 52px;
        }
        
        /* Dark mode adaptation */
        @media (prefers-color-scheme: dark) {
          .neomorphic-raised {
            box-shadow: 
              8px 8px 16px rgba(0, 0, 0, 0.3),
              -8px -8px 16px rgba(255, 255, 255, 0.02);
          }
          
          .neomorphic-raised:hover {
            box-shadow: 
              12px 12px 20px rgba(0, 0, 0, 0.4),
              -12px -12px 20px rgba(255, 255, 255, 0.03);
          }
          
          .neomorphic-raised.active {
            box-shadow: 
              inset 4px 4px 8px rgba(0, 0, 0, 0.3),
              inset -4px -4px 8px rgba(255, 255, 255, 0.02);
          }
          
          .neomorphic-pressed {
            box-shadow: 
              inset 4px 4px 8px rgba(0, 0, 0, 0.3),
              inset -4px -4px 8px rgba(255, 255, 255, 0.02);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .neomorphic-button {
            transition: none;
          }
        }
      `}</style>
    </button>
  )
}