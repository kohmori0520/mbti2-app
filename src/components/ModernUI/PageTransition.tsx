import React, { useEffect, useState } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
  type?: 'slide' | 'fade' | 'scale' | 'rotate' | 'elastic'
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  delay?: number
  stagger?: number
  className?: string
}

export default function PageTransition({
  children,
  type = 'fade',
  direction = 'up',
  duration = 400,
  delay = 0,
  stagger = 100,
  className = ''
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getTransitionStyle = () => {
    const baseStyle = {
      transition: `all ${duration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
      transitionDelay: `${delay}ms`
    }

    if (!isVisible) {
      switch (type) {
        case 'slide':
          return {
            ...baseStyle,
            transform: `translate${direction === 'up' || direction === 'down' ? 'Y' : 'X'}(${
              direction === 'up' ? '30px' : 
              direction === 'down' ? '-30px' :
              direction === 'left' ? '30px' : '-30px'
            })`,
            opacity: 0
          }
        
        case 'scale':
          return {
            ...baseStyle,
            transform: 'scale(0.95)',
            opacity: 0
          }
        
        case 'rotate':
          return {
            ...baseStyle,
            transform: 'rotate(-5deg) scale(0.95)',
            opacity: 0,
            transformOrigin: 'center center'
          }
        
        case 'elastic':
          return {
            ...baseStyle,
            transform: 'scale(0.8) translateY(20px)',
            opacity: 0,
            transition: `all ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`
          }
        
        case 'fade':
        default:
          return {
            ...baseStyle,
            opacity: 0
          }
      }
    }

    return {
      ...baseStyle,
      transform: 'none',
      opacity: 1
    }
  }

  return (
    <div 
      className={`page-transition ${className}`}
      style={getTransitionStyle()}
    >
      {children}
      
      <style jsx>{`
        .page-transition {
          will-change: transform, opacity;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .page-transition {
            transition: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}

// Staggered children animation component
interface StaggeredChildrenProps {
  children: React.ReactNode
  stagger?: number
  className?: string
}

export function StaggeredChildren({
  children,
  stagger = 100,
  className = ''
}: StaggeredChildrenProps) {
  const childArray = React.Children.toArray(children)

  return (
    <div className={`staggered-children ${className}`}>
      {childArray.map((child, index) => (
        <PageTransition
          key={index}
          type="slide"
          direction="up"
          delay={index * stagger}
          duration={400}
        >
          {child}
        </PageTransition>
      ))}
    </div>
  )
}

// Page load animation hook
export function usePageAnimation(trigger?: any) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [trigger])

  return { isLoading, setIsLoading }
}