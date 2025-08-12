import React, { Suspense, lazy, ComponentType } from 'react'

interface LazyComponentProps {
  fallback?: React.ReactNode
  errorBoundary?: boolean
  className?: string
}

interface LazyLoadOptions {
  delay?: number
  retries?: number
  timeout?: number
}

// Enhanced error boundary for lazy components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponent Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="lazy-error-fallback">
          <div className="error-content">
            <h3>コンポーネントの読み込みに失敗しました</h3>
            <p>ページを再読み込みしてもう一度お試しください。</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn outline"
            >
              再読み込み
            </button>
          </div>
          
          <style>{`
            .lazy-error-fallback {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 200px;
              background: var(--color-surface);
              border-radius: 12px;
              border: 1px solid var(--color-border);
              padding: 2rem;
              text-align: center;
            }
            
            .error-content h3 {
              color: var(--color-text);
              margin-bottom: 0.5rem;
            }
            
            .error-content p {
              color: var(--color-text-secondary);
              margin-bottom: 1rem;
            }
          `}</style>
        </div>
      )
    }

    return this.props.children
  }
}

// Default loading component
const DefaultLoadingComponent = () => (
  <div className="lazy-loading">
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-text">読み込み中...</p>
    
    <style>{`
      .lazy-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        gap: 1rem;
      }
      
      .loading-spinner {
        position: relative;
        width: 40px;
        height: 40px;
      }
      
      .spinner-ring {
        width: 100%;
        height: 100%;
        border: 3px solid var(--color-border);
        border-top: 3px solid var(--color-accent);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-text {
        color: var(--color-text-secondary);
        font-size: 14px;
        margin: 0;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .spinner-ring {
          animation: none;
          border-top-color: var(--color-border);
        }
      }
    `}</style>
  </div>
)

// Enhanced lazy with retry logic
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const { delay = 0, retries = 3, timeout = 10000 } = options

  return lazy(async () => {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add artificial delay if specified
        if (delay > 0 && attempt === 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        // Implement timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Component load timeout')), timeout)
        })

        const loadPromise = importFunc()
        const result = await Promise.race([loadPromise, timeoutPromise])

        return result
      } catch (error) {
        lastError = error as Error
        console.warn(`LazyComponent load attempt ${attempt + 1} failed:`, error)

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Component failed to load after all retries')
  })
}

// Main LazyComponent wrapper
export default function LazyComponent({
  children,
  fallback = <DefaultLoadingComponent />,
  errorBoundary = true,
  className = ''
}: LazyComponentProps & { children: React.ReactNode }) {
  const content = (
    <div className={`lazy-component-wrapper ${className}`}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  )

  return errorBoundary ? (
    <LazyErrorBoundary>
      {content}
    </LazyErrorBoundary>
  ) : content
}

// Intersection Observer based lazy loading
export function LazyLoadOnVisible({
  children,
  fallback = <DefaultLoadingComponent />,
  rootMargin = '50px',
  threshold = 0.1,
  className = ''
}: LazyComponentProps & {
  children: React.ReactNode
  rootMargin?: string
  threshold?: number
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold])

  React.useEffect(() => {
    if (isVisible && !isLoaded) {
      // Small delay to ensure smooth loading
      const timer = setTimeout(() => setIsLoaded(true), 100)
      return () => clearTimeout(timer)
    }
  }, [isVisible, isLoaded])

  return (
    <div ref={ref} className={`lazy-load-container ${className}`}>
      {isLoaded ? (
        <LazyComponent fallback={fallback}>
          {children}
        </LazyComponent>
      ) : (
        isVisible && fallback
      )}
      
      <style>{`
        .lazy-load-container {
          min-height: 100px;
        }
      `}</style>
    </div>
  )
}