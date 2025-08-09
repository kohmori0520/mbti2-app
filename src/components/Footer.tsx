import React from 'react'

interface FooterProps {
  /** フッターに追加情報を表示するかどうか */
  showDetails?: boolean
  /** 診断完了後に表示するアクション */
  variant?: 'default' | 'result'
}

export default function Footer({ showDetails = true, variant = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="container">
        {variant === 'result' && (
          <div className="footer-actions">
            <div className="action-group">
              <h3 className="text-headline">診断結果を活用しよう</h3>
              <div className="action-buttons">
                <button 
                  className="btn outline"
                  onClick={() => {
                    const text = `PersonalType診断を受けました！\n${window.location.href}`
                    if (navigator.share) {
                      navigator.share({ title: '診断結果', text }).catch(() => {})
                    } else {
                      navigator.clipboard?.writeText(text).catch(() => {})
                      alert('結果をコピーしました')
                    }
                  }}
                >
                  結果をシェア
                </button>
                <button 
                  className="btn"
                  onClick={() => {
                    localStorage.removeItem('answers')
                    localStorage.removeItem('answerLogs')
                    localStorage.removeItem('resultLogs')
                    window.location.reload()
                  }}
                >
                  もう一度診断
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetails && (
          <div className="footer-content">
            <div className="footer-section">
              <h4 className="footer-title">PersonalType について</h4>
              <p className="footer-text">
                最新の心理学研究に基づいた、次世代のパーソナリティ診断ツールです。
                個人の行動パターン、価値観、対人関係の特性を多角的に分析します。
              </p>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">診断の特徴</h4>
              <ul className="footer-list">
                <li>✨ AI による高精度分析</li>
                <li>🎯 個人に最適化された結果</li>
                <li>📊 詳細なスコア分析</li>
                <li>🔒 プライバシー保護</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">プライバシー</h4>
              <p className="footer-text small">
                あなたの回答は匿名で処理され、個人を特定できる情報は収集していません。
                診断結果は端末内に保存され、外部に送信されることはありません。
              </p>
            </div>
          </div>
        )}

        <div className="footer-bottom">
          <div className="footer-copyright">
            <span>© {currentYear} PersonalType. </span>
            <span className="footer-note">診断結果は参考情報として活用してください。</span>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>
              プライバシーポリシー
            </a>
            <span className="footer-separator">•</span>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>
              利用規約
            </a>
            <span className="footer-separator">•</span>
            <a href="#" className="footer-link" onClick={(e) => e.preventDefault()}>
              お問い合わせ
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}