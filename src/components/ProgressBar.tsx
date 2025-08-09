import React from 'react'

export default function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)))
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="進捗状況">
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}
