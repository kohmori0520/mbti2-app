import React, { useState, useEffect, useRef } from 'react'

interface FeedbackMessage {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface LiveFeedbackProps {
  messages: FeedbackMessage[]
  position?: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxVisible?: number
  className?: string
}

interface FeedbackItemProps {
  message: FeedbackMessage
  onDismiss: (id: string) => void
  isExiting?: boolean
}

function FeedbackItem({ message, onDismiss, isExiting }: FeedbackItemProps) {
  const [progress, setProgress] = useState(100)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (message.duration && message.duration > 0) {
      const interval = 50
      const decrement = (interval / message.duration) * 100
      
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - decrement
          if (newProgress <= 0) {
            onDismiss(message.id)
            return 0
          }
          return newProgress
        })
      }, interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [message.duration, message.id, onDismiss])

  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (message.duration && message.duration > 0) {
      const interval = 50
      const decrement = (interval / message.duration) * 100
      
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - decrement
          if (newProgress <= 0) {
            onDismiss(message.id)
            return 0
          }
          return newProgress
        })
      }, interval)
    }
  }

  const iconMap = {
    success: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 11V15M10 5V5.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M8.257 3.099C9.054 1.634 10.946 1.634 11.743 3.099L18.25 15.902C19.047 17.367 17.952 19 16.507 19H3.493C2.048 19 0.953 17.367 1.75 15.902L8.257 3.099ZM10 8V12M10 16H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 8V12M10 16H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }

  return (
    <div 
      className={`feedback-item ${message.type} ${isExiting ? 'exiting' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="assertive"
    >
      <div className="feedback-content">
        <div className="feedback-icon">
          {iconMap[message.type]}
        </div>
        
        <div className="feedback-text">
          <div className="feedback-title">{message.title}</div>
          {message.description && (
            <div className="feedback-description">{message.description}</div>
          )}
        </div>
        
        <div className="feedback-actions">
          {message.action && (
            <button
              className="feedback-action-btn"
              onClick={message.action.onClick}
            >
              {message.action.label}
            </button>
          )}
          <button
            className="feedback-close-btn"
            onClick={() => onDismiss(message.id)}
            aria-label="フィードバックを閉じる"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {message.duration && message.duration > 0 && (
        <div className="feedback-progress">
          <div 
            className="feedback-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <style>{`
        .feedback-item {
          background: var(--color-surface);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid var(--color-border);
          overflow: hidden;
          margin-bottom: 0.75rem;
          animation: feedbackSlideIn 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
          transform-origin: right center;
          max-width: 400px;
          min-width: 320px;
        }
        
        .feedback-item.exiting {
          animation: feedbackSlideOut 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        @keyframes feedbackSlideIn {
          0% {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes feedbackSlideOut {
          0% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
        
        .feedback-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
        }
        
        .feedback-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }
        
        .feedback-item.success .feedback-icon {
          color: #28a745;
          background: rgba(40, 167, 69, 0.1);
        }
        
        .feedback-item.info .feedback-icon {
          color: #007bff;
          background: rgba(0, 123, 255, 0.1);
        }
        
        .feedback-item.warning .feedback-icon {
          color: #ffc107;
          background: rgba(255, 193, 7, 0.1);
        }
        
        .feedback-item.error .feedback-icon {
          color: #dc3545;
          background: rgba(220, 53, 69, 0.1);
        }
        
        .feedback-text {
          flex: 1;
          min-width: 0;
        }
        
        .feedback-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 2px;
        }
        
        .feedback-description {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }
        
        .feedback-actions {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        
        .feedback-action-btn {
          background: none;
          border: 1px solid var(--color-accent);
          color: var(--color-accent);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .feedback-action-btn:hover {
          background: var(--color-accent);
          color: white;
        }
        
        .feedback-close-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          padding: 2px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .feedback-close-btn:hover {
          color: var(--color-text);
          background: rgba(0, 0, 0, 0.05);
        }
        
        .feedback-progress {
          height: 3px;
          background: rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .feedback-progress-bar {
          height: 100%;
          transition: width 0.1s linear;
        }
        
        .feedback-item.success .feedback-progress-bar {
          background: #28a745;
        }
        
        .feedback-item.info .feedback-progress-bar {
          background: #007bff;
        }
        
        .feedback-item.warning .feedback-progress-bar {
          background: #ffc107;
        }
        
        .feedback-item.error .feedback-progress-bar {
          background: #dc3545;
        }
        
        /* Mobile adjustments */
        @media (max-width: 480px) {
          .feedback-item {
            min-width: 280px;
            max-width: calc(100vw - 2rem);
          }
          
          .feedback-content {
            padding: 0.75rem;
            gap: 0.5rem;
          }
          
          .feedback-title {
            font-size: 13px;
          }
          
          .feedback-description {
            font-size: 12px;
          }
        }
        
        /* Dark mode adjustments */
        @media (prefers-color-scheme: dark) {
          .feedback-item {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          
          .feedback-close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .feedback-item {
            animation: none;
          }
          
          .feedback-item.exiting {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default function LiveFeedback({
  messages,
  position = 'top-right',
  maxVisible = 5,
  className = ''
}: LiveFeedbackProps) {
  const [displayedMessages, setDisplayedMessages] = useState<FeedbackMessage[]>([])
  const [exitingMessages, setExitingMessages] = useState<Set<string>>(new Set())

  useEffect(() => {
    setDisplayedMessages(messages.slice(-maxVisible))
  }, [messages, maxVisible])

  const handleDismiss = (id: string) => {
    setExitingMessages(prev => new Set([...prev, id]))
    
    setTimeout(() => {
      setDisplayedMessages(prev => prev.filter(msg => msg.id !== id))
      setExitingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 200)
  }

  const positionClass = `feedback-position-${position}`

  return (
    <div className={`live-feedback ${positionClass} ${className}`}>
      {displayedMessages.map(message => (
        <FeedbackItem
          key={message.id}
          message={message}
          onDismiss={handleDismiss}
          isExiting={exitingMessages.has(message.id)}
        />
      ))}
      
      <style>{`
        .live-feedback {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
        }
        
        .live-feedback > * {
          pointer-events: auto;
        }
        
        .feedback-position-top {
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .feedback-position-bottom {
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .feedback-position-top-right {
          top: 1rem;
          right: 1rem;
        }
        
        .feedback-position-top-left {
          top: 1rem;
          left: 1rem;
        }
        
        .feedback-position-bottom-right {
          bottom: 1rem;
          right: 1rem;
        }
        
        .feedback-position-bottom-left {
          bottom: 1rem;
          left: 1rem;
        }
        
        /* Mobile adjustments */
        @media (max-width: 480px) {
          .live-feedback {
            left: 1rem !important;
            right: 1rem !important;
            transform: none !important;
          }
          
          .feedback-position-top {
            top: 1rem;
          }
          
          .feedback-position-bottom {
            bottom: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

// Hook for managing feedback messages
export function useLiveFeedback() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([])

  const addMessage = (
    type: FeedbackMessage['type'],
    title: string,
    description?: string,
    options?: {
      duration?: number
      action?: FeedbackMessage['action']
    }
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const message: FeedbackMessage = {
      id,
      type,
      title,
      description,
      duration: options?.duration ?? (type === 'error' ? 0 : 5000),
      action: options?.action
    }

    setMessages(prev => [...prev, message])
    return id
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const clearAll = () => {
    setMessages([])
  }

  const success = (title: string, description?: string, options?: { duration?: number; action?: FeedbackMessage['action'] }) =>
    addMessage('success', title, description, options)

  const info = (title: string, description?: string, options?: { duration?: number; action?: FeedbackMessage['action'] }) =>
    addMessage('info', title, description, options)

  const warning = (title: string, description?: string, options?: { duration?: number; action?: FeedbackMessage['action'] }) =>
    addMessage('warning', title, description, options)

  const error = (title: string, description?: string, options?: { duration?: number; action?: FeedbackMessage['action'] }) =>
    addMessage('error', title, description, options)

  return {
    messages,
    addMessage,
    removeMessage,
    clearAll,
    success,
    info,
    warning,
    error
  }
}