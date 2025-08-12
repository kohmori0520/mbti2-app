import React from 'react'

interface VisualHierarchyProps {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5
  emphasis?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  contrast?: 'low' | 'medium' | 'high' | 'maximum'
  spacing?: 'tight' | 'normal' | 'relaxed' | 'loose'
  className?: string
}

export default function VisualHierarchy({
  children,
  level = 3,
  emphasis = 'primary',
  size = 'md',
  contrast = 'medium',
  spacing = 'normal',
  className = ''
}: VisualHierarchyProps) {
  const levelClass = `hierarchy-level-${level}`
  const emphasisClass = `hierarchy-${emphasis}`
  const sizeClass = `hierarchy-${size}`
  const contrastClass = `hierarchy-contrast-${contrast}`
  const spacingClass = `hierarchy-spacing-${spacing}`

  return (
    <div className={`visual-hierarchy ${levelClass} ${emphasisClass} ${sizeClass} ${contrastClass} ${spacingClass} ${className}`}>
      {children}
      
      <style>{`
        .visual-hierarchy {
          transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        /* Hierarchy Levels */
        .hierarchy-level-1 {
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        
        .hierarchy-level-2 {
          font-size: clamp(1.5rem, 3vw, 2.5rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        
        .hierarchy-level-3 {
          font-size: clamp(1.25rem, 2.5vw, 2rem);
          font-weight: 600;
          line-height: 1.3;
        }
        
        .hierarchy-level-4 {
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: 500;
          line-height: 1.4;
        }
        
        .hierarchy-level-5 {
          font-size: clamp(0.875rem, 1.5vw, 1.125rem);
          font-weight: 400;
          line-height: 1.5;
        }
        
        /* Emphasis Colors */
        .hierarchy-primary {
          color: var(--color-text);
        }
        
        .hierarchy-secondary {
          color: var(--color-text-secondary);
        }
        
        .hierarchy-accent {
          color: var(--color-accent);
        }
        
        .hierarchy-success {
          color: #28a745;
        }
        
        .hierarchy-warning {
          color: #ffc107;
        }
        
        .hierarchy-danger {
          color: #dc3545;
        }
        
        /* Size Variants */
        .hierarchy-xs {
          font-size: 0.75rem;
        }
        
        .hierarchy-sm {
          font-size: 0.875rem;
        }
        
        .hierarchy-md {
          /* Default size from levels */
        }
        
        .hierarchy-lg {
          font-size: 1.25em;
        }
        
        .hierarchy-xl {
          font-size: 1.5em;
        }
        
        .hierarchy-xxl {
          font-size: 2em;
        }
        
        /* Contrast Levels */
        .hierarchy-contrast-low {
          opacity: 0.6;
        }
        
        .hierarchy-contrast-medium {
          opacity: 0.8;
        }
        
        .hierarchy-contrast-high {
          opacity: 0.95;
        }
        
        .hierarchy-contrast-maximum {
          opacity: 1;
          text-shadow: 0 0 1px currentColor;
        }
        
        /* Spacing */
        .hierarchy-spacing-tight {
          margin-bottom: 0.5rem;
        }
        
        .hierarchy-spacing-normal {
          margin-bottom: 1rem;
        }
        
        .hierarchy-spacing-relaxed {
          margin-bottom: 1.5rem;
        }
        
        .hierarchy-spacing-loose {
          margin-bottom: 2rem;
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .hierarchy-success {
            color: #20c997;
          }
          
          .hierarchy-warning {
            color: #ffc107;
          }
          
          .hierarchy-danger {
            color: #f8d7da;
          }
          
          .hierarchy-contrast-maximum {
            text-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .hierarchy-contrast-low {
            opacity: 0.8;
          }
          
          .hierarchy-contrast-medium {
            opacity: 0.9;
          }
          
          .hierarchy-contrast-high {
            opacity: 1;
          }
          
          .hierarchy-contrast-maximum {
            font-weight: 700;
            text-shadow: 1px 1px 0 currentColor;
          }
        }
      `}</style>
    </div>
  )
}