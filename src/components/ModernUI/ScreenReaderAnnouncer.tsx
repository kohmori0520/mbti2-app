import React, { useEffect, useRef } from 'react'

interface ScreenReaderAnnouncerProps {
  message: string
  priority?: 'polite' | 'assertive'
  clear?: boolean
}

export default function ScreenReaderAnnouncer({
  message,
  priority = 'polite',
  clear = false
}: ScreenReaderAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (announcerRef.current) {
      if (clear) {
        announcerRef.current.textContent = ''
        // Small delay to ensure screen readers notice the change
        setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = message
          }
        }, 100)
      } else {
        announcerRef.current.textContent = message
      }
    }
  }, [message, clear])

  return (
    <div
      ref={announcerRef}
      aria-live={priority}
      aria-atomic="true"
      className="screen-reader-announcer"
    >
      <style jsx>{`
        .screen-reader-announcer {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  )
}

// Hook for managing announcements
export function useScreenReader() {
  const [announcement, setAnnouncement] = React.useState('')
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite')

  const announce = (message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPriority(level)
    setAnnouncement(message)
  }

  const clear = () => {
    setAnnouncement('')
  }

  return {
    announcement,
    priority,
    announce,
    clear,
    ScreenReaderAnnouncer: () => (
      <ScreenReaderAnnouncer 
        message={announcement} 
        priority={priority} 
        clear={true}
      />
    )
  }
}