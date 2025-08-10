import React, { useEffect, useState } from 'react'
import { DatabaseService } from '../services/database'

type Stats = {
  totalSessions: number
  completedSessions: number
  totalAnswers: number
  mostCommonType: string
}

type TypeDistribution = {
  type: string
  count: number
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        const [statsData, distributionData] = await Promise.all([
          DatabaseService.getStats(),
          DatabaseService.getTypeDistribution()
        ])
        setStats(statsData)
        setTypeDistribution(distributionData)
        setError(null)
      } catch (err) {
        setError('データの読み込みに失敗しました')
        console.error('Analytics loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>分析データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>再読み込み</button>
        </div>
      </div>
    )
  }

  const completionRate = stats ? (stats.completedSessions / Math.max(stats.totalSessions, 1)) * 100 : 0

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1 className="text-title-1">分析ダッシュボード</h1>
        <p className="dashboard-description">
          MBTIアプリの利用統計と分析データです
        </p>
      </div>

      {/* 基本統計 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalSessions.toLocaleString() || 0}</div>
          <div className="stat-label">総セッション数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.completedSessions.toLocaleString() || 0}</div>
          <div className="stat-label">完了セッション数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completionRate.toFixed(1)}%</div>
          <div className="stat-label">完了率</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalAnswers.toLocaleString() || 0}</div>
          <div className="stat-label">総回答数</div>
        </div>
      </div>

      {/* タイプ分布 */}
      <div className="chart-section">
        <div className="card">
          <div className="section-header">
            <h2 className="text-title-2">タイプ分布</h2>
            <p className="section-description">
              最も多い性格タイプ: <strong>{stats?.mostCommonType || 'N/A'}</strong>
            </p>
          </div>
          
          <div className="type-distribution-chart">
            {typeDistribution.map((item, index) => {
              const maxCount = Math.max(...typeDistribution.map(d => d.count))
              const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              
              return (
                <div key={item.type} className="chart-bar">
                  <div className="bar-label">
                    <span className="type-code">{item.type}</span>
                    <span className="count">{item.count}</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 分析メトリクス */}
      <div className="metrics-section">
        <div className="card">
          <div className="section-header">
            <h2 className="text-title-2">分析メトリクス</h2>
            <p className="section-description">
              アプリの利用状況とユーザー行動の分析
            </p>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">平均回答数/セッション</div>
              <div className="metric-value">
                {stats && stats.totalSessions > 0 
                  ? (stats.totalAnswers / stats.totalSessions).toFixed(1)
                  : '0'
                }
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">診断完了率</div>
              <div className="metric-value">{completionRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-description {
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          color: #e74c3c;
          margin-bottom: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .chart-section {
          margin-bottom: 3rem;
        }

        .type-distribution-chart {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chart-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bar-label {
          min-width: 120px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .type-code {
          font-weight: 600;
          font-family: monospace;
          background: var(--surface-variant);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .count {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .bar-container {
          flex: 1;
          height: 20px;
          background: var(--surface-variant);
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-dark));
          border-radius: 10px;
          transition: width 0.6s ease;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .metric-item {
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .metric-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .card {
          background: var(--surface);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-description {
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
}