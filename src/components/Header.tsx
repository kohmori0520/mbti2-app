import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface HeaderProps {
  /** ヘッダーのテーマカラー */
  variant?: 'default' | 'frosted'
  /** 診断の進行状況表示用 */
  progress?: number
  /** ページタイトルの表示 */
  showTitle?: boolean
}

function NavItems() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isTypes = location.pathname.startsWith('/types')
  const hasProgress = typeof window !== 'undefined' && !!localStorage.getItem('answers')

  return (
    <>
      {!isHome && (
        <Link to="/" className="nav-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6.5 14.5v-3.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v3.5m-5 0H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 .6-1.4l4-4a2 2 0 0 1 2.8 0l4 4a2 2 0 0 1 .6 1.4v5a2 2 0 0 1-2 2h-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-text">診断</span>
        </Link>
      )}
      <Link to="/types" className={`nav-link ${isTypes ? 'active' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zM2 8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8zM3 12a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3z" fill="currentColor"/>
        </svg>
        <span className="nav-text">図鑑</span>
      </Link>
      {/* 結果へ */}
      {hasProgress && (
        <Link to="/?show=result" className="nav-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="nav-text">結果</span>
        </Link>
      )}
      {/* 再診断 */}
      {hasProgress && (
        <Link to="/?restart=1" className="nav-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8a4.5 4.5 0 1 1 1.32 3.182" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3.5 8V5.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="nav-text">再診断</span>
        </Link>
      )}
    </>
  )
}

export default function Header({ variant = 'default', progress, showTitle = true }: HeaderProps) {
  return (
    <header className={`app-header ${variant === 'frosted' ? 'frosted' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* ロゴ・ブランド */}
          <div className="brand">
            <div className="brand-icon">🧠</div>
            {showTitle && (
              <div className="brand-text">
                <div className="brand-title">PersonalType</div>
                <div className="brand-subtitle">次世代診断</div>
              </div>
            )}
          </div>

          {/* 進行状況（診断中のみ表示） */}
          {typeof progress === 'number' && (
            <div className="header-progress">
              <div className="progress-info">
                <span className="progress-text">{Math.round(progress * 100)}% 完了</span>
              </div>
              <div className="progress-bar-mini">
                <div 
                  className="progress-fill"
                  style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* ナビゲーション */}
          <nav className="header-nav">
            <NavItems />
          </nav>
        </div>
      </div>
    </header>
  )
}