import React, { useEffect, useMemo, useState } from 'react'
import { DatabaseService } from '../services/database'
import { GlassCard, GradientText, MicroInteraction, AnimatedBackground, SmartTooltip } from './ModernUI'
import Header from './Header'
import Footer from './Footer'

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

export default function ModernAnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
  const [typeDistribution30d, setTypeDistribution30d] = useState<TypeDistribution[]>([])
  const [dailyCompleted, setDailyCompleted] = useState<{ day: string; completed: number }[]>([])
  const [completionStats, setCompletionStats] = useState<{ p50_ms: number; p90_ms: number } | null>(null)
  const [axisRatio, setAxisRatio] = useState<{ axis: string; a_cnt: number; b_cnt: number; a_ratio: number }[]>([])
  const [latencyHist, setLatencyHist] = useState<{ bucket: number; cnt: number }[]>([])
  const [typeDistribution7d, setTypeDistribution7d] = useState<TypeDistribution[]>([])
  const [typeDistribution90d, setTypeDistribution90d] = useState<TypeDistribution[]>([])
  const [srcReferrer, setSrcReferrer] = useState<Array<{ referrer: string | null; type: string; cnt: number }>>([])
  const [srcUtm, setSrcUtm] = useState<Array<{ utm_source: string; type: string; cnt: number }>>([])
  const [questionSkewTop5, setQuestionSkewTop5] = useState<Array<{ question_id: number; a_cnt: number; b_cnt: number; skew: number }>>([])
  const [questionLatencyTop5, setQuestionLatencyTop5] = useState<Array<{ question_id: number; avg_latency_ms: number; samples: number }>>([])

  // UI state: period and source filters
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'>('30d')
  const [sourceKind, setSourceKind] = useState<'none'|'referrer'|'utm'>('none')
  const [sourceValue, setSourceValue] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        // タイムアウト設定（10秒）
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 10000)
        })

        const dataPromise = Promise.all([
          DatabaseService.getStats(),
          DatabaseService.getTypeDistribution(),
          DatabaseService.fetchTypeDistribution7d(),
          DatabaseService.fetchTypeDistribution30d(),
          DatabaseService.fetchTypeDistribution90d(),
          DatabaseService.fetchDailyCompleted(),
          DatabaseService.fetchCompletionTimeStats(),
          DatabaseService.fetchAxisAbRatio(),
          DatabaseService.fetchLatencyHist(),
          DatabaseService.fetchTypeDistributionByReferrer30d(),
          DatabaseService.fetchTypeDistributionByUtm30d(),
          DatabaseService.fetchQuestionAbSkewTop5(),
          DatabaseService.fetchQuestionLatencyTop5()
        ])

        const [statsData, distributionData, distribution7d, distribution30d, distribution90d, daily, compStats, ratio, hist, refDist, utmDist, skewTop5, latencyTop5] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [
          Stats,
          TypeDistribution[],
          Array<{ type: string; cnt: number }>,
          Array<{ type: string; cnt: number }>,
          Array<{ type: string; cnt: number }>,
          Array<{ day: string; completed: number }>,
          Array<{ p50_ms: number; p90_ms: number }>,
          Array<{ axis: string; a_cnt: number; b_cnt: number; a_ratio: number }>,
          Array<{ bucket: number; cnt: number }>,
          Array<{ referrer: string | null; type: string; cnt: number }>,
          Array<{ utm_source: string; type: string; cnt: number }>,
          Array<{ question_id: number; a_cnt: number; b_cnt: number; skew: number }>,
          Array<{ question_id: number; avg_latency_ms: number; samples: number }>
        ]

        setStats(statsData)
        setTypeDistribution(distributionData)
        setTypeDistribution7d((distribution7d || []).map(d => ({ type: d.type, count: (d as any).cnt })))
        setTypeDistribution30d((distribution30d || []).map(d => ({ type: d.type, count: (d as any).cnt })))
        setTypeDistribution90d((distribution90d || []).map(d => ({ type: d.type, count: (d as any).cnt })))
        setDailyCompleted(daily || [])
        setCompletionStats((compStats && compStats[0]) || null)
        setAxisRatio(ratio || [])
        setLatencyHist(hist || [])
        setSrcReferrer(refDist || [])
        setSrcUtm(utmDist || [])
        setQuestionSkewTop5(skewTop5 || [])
        setQuestionLatencyTop5(latencyTop5 || [])
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error && err.message === 'Timeout' 
          ? 'データの読み込みがタイムアウトしました。Supabaseの設定を確認してください。'
          : 'データの読み込みに失敗しました'
        setError(errorMessage)
        console.error('Analytics loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    // 少し遅延してから実行（初期描画を優先）
    const timer = setTimeout(loadAnalytics, 500)
    return () => clearTimeout(timer)
  }, [])

  // Derived distributions by selected period - MUST be before early returns
  const periodDistribution: TypeDistribution[] = useMemo(() => {
    if (period === '7d') return typeDistribution7d
    if (period === '90d') return typeDistribution90d
    return typeDistribution30d
  }, [period, typeDistribution7d, typeDistribution30d, typeDistribution90d])

  // Source options and filtered distribution (30d basis) - MUST be before early returns
  const referrerOptions = useMemo(() => {
    const s = new Set((srcReferrer || []).map(r => r.referrer || '(none)'))
    return Array.from(s)
  }, [srcReferrer])
  
  const utmOptions = useMemo(() => {
    const s = new Set((srcUtm || []).map(r => r.utm_source || '(none)'))
    return Array.from(s)
  }, [srcUtm])
  
  const sourceDistribution = useMemo(() => {
    if (sourceKind === 'referrer') {
      const key = sourceValue || referrerOptions[0]
      const rows = (srcReferrer || []).filter(r => (r.referrer || '(none)') === key)
      return rows.map(r => ({ type: r.type, count: r.cnt }))
    } else if (sourceKind === 'utm') {
      const key = sourceValue || utmOptions[0]
      const rows = (srcUtm || []).filter(r => (r.utm_source || '(none)') === key)
      return rows.map(r => ({ type: r.type, count: r.cnt }))
    }
    return []
  }, [sourceKind, sourceValue, srcReferrer, srcUtm, referrerOptions, utmOptions])

  const completionRate = stats ? (stats.completedSessions / Math.max(stats.totalSessions, 1)) * 100 : 0

  // Early returns AFTER all hooks
  if (loading) {
    return (
      <div className="app-layout">
        <Header variant="frosted" />
        <main className="app-main">
          <div className="container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>分析データを読み込み中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-layout">
        <Header variant="frosted" />
        <main className="app-main">
          <div className="container">
            <div className="error-state">
              <p className="error-message">{error}</p>
              <button onClick={() => window.location.reload()}>再読み込み</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Header variant="frosted" />
      
      <main className="app-main">
        <div className="container analytics-container">
          <AnimatedBackground 
            variant="particles" 
            intensity="subtle" 
            speed="slow"
            colors={['#667eea', '#764ba2', '#f093fb']}
          />
          
          <div className="dashboard-header">
            <MicroInteraction type="hover" effect="bounce" intensity="subtle">
              <div className="analytics-badge">
                <span className="badge-text">分析</span>
                <div className="badge-icon">📊</div>
              </div>
            </MicroInteraction>
            
            <GradientText 
              size="xxl"
              weight="bold"
              gradient="primary"
              animate={true}
              className="dashboard-title"
            >
              分析ダッシュボード
            </GradientText>
            
            <p className="dashboard-description">
              PersonalType診断アプリの利用統計と分析データです
            </p>
          </div>

          {/* 基本統計 */}
          <div className="stats-grid">
            <MicroInteraction type="hover" effect="lift" intensity="subtle">
              <GlassCard className="stat-card-modern">
                <SmartTooltip content="アプリを開始したユーザー数" theme="glass" position="top">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{stats?.totalSessions.toLocaleString() || 0}</div>
                  <div className="stat-label">総セッション数</div>
                </SmartTooltip>
              </GlassCard>
            </MicroInteraction>
            
            <MicroInteraction type="hover" effect="lift" intensity="subtle">
              <GlassCard className="stat-card-modern">
                <SmartTooltip content="診断を最後まで完了したユーザー数" theme="glass" position="top">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{stats?.completedSessions.toLocaleString() || 0}</div>
                  <div className="stat-label">完了セッション数</div>
                </SmartTooltip>
              </GlassCard>
            </MicroInteraction>
            
            <MicroInteraction type="hover" effect="lift" intensity="subtle">
              <GlassCard className="stat-card-modern">
                <SmartTooltip content="開始したユーザーのうち完了したユーザーの割合" theme="glass" position="top">
                  <div className="stat-icon">📈</div>
                  <div className="stat-value">{completionRate.toFixed(1)}%</div>
                  <div className="stat-label">完了率</div>
                </SmartTooltip>
              </GlassCard>
            </MicroInteraction>
            
            <MicroInteraction type="hover" effect="lift" intensity="subtle">
              <GlassCard className="stat-card-modern">
                <SmartTooltip content="すべてのユーザーの回答総数" theme="glass" position="top">
                  <div className="stat-icon">💬</div>
                  <div className="stat-value">{stats?.totalAnswers.toLocaleString() || 0}</div>
                  <div className="stat-label">総回答数</div>
                </SmartTooltip>
              </GlassCard>
            </MicroInteraction>
          </div>

          {/* タイプ分布 */}
          <div className="chart-section">
            <MicroInteraction type="hover" effect="lift" intensity="subtle">
              <GlassCard className="chart-card-modern">
                <div className="section-header">
                  <GradientText size="xl" weight="semibold" gradient="primary">
                    性格タイプ分布
                  </GradientText>
                  <p className="section-description">
                    最も多い性格タイプ: <strong>{stats?.mostCommonType || 'N/A'}</strong>
                  </p>
                </div>
                
                <div className="type-distribution-chart">
                  {typeDistribution.map((item) => {
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

                {/* 期間別タイプ分布 */}
                <div style={{marginTop:32}}>
                  <div className="section-header">
                    <GradientText size="lg" weight="medium" gradient="secondary">
                      期間別分析
                    </GradientText>
                    <div className="period-buttons">
                      <button 
                        className={`period-btn ${period==='7d'?'active':''}`} 
                        onClick={()=>setPeriod('7d')}
                      >
                        7日間
                      </button>
                      <button 
                        className={`period-btn ${period==='30d'?'active':''}`} 
                        onClick={()=>setPeriod('30d')}
                      >
                        30日間
                      </button>
                      <button 
                        className={`period-btn ${period==='90d'?'active':''}`} 
                        onClick={()=>setPeriod('90d')}
                      >
                        90日間
                      </button>
                    </div>
                  </div>
                  <div className="type-distribution-chart">
                    {periodDistribution.map((item) => {
                      const maxCount = Math.max(...periodDistribution.map(d => d.count))
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
              </GlassCard>
            </MicroInteraction>
          </div>

          {/* 分析メトリクス */}
          <div className="metrics-section">
            <MicroInteraction type="hover" effect="lift" intensity="subtle">
              <GlassCard className="metrics-card-modern">
                <div className="section-header">
                  <GradientText size="xl" weight="semibold" gradient="primary">
                    分析メトリクス
                  </GradientText>
                  <p className="section-description">
                    アプリの利用状況とユーザー行動の分析
                  </p>
                </div>
                
                <div className="metrics-grid">
                  <MicroInteraction type="hover" effect="pulse" intensity="subtle">
                    <div className="metric-item modern">
                      <div className="metric-icon">⚖️</div>
                      <div className="metric-label">平均回答数/セッション</div>
                      <div className="metric-value">
                        {stats && stats.totalSessions > 0 
                          ? (stats.totalAnswers / stats.totalSessions).toFixed(1)
                          : '0'
                        }
                      </div>
                    </div>
                  </MicroInteraction>
                  
                  <MicroInteraction type="hover" effect="pulse" intensity="subtle">
                    <div className="metric-item modern">
                      <div className="metric-icon">🎯</div>
                      <div className="metric-label">診断完了率</div>
                      <div className="metric-value">{completionRate.toFixed(1)}%</div>
                    </div>
                  </MicroInteraction>
                  
                  <MicroInteraction type="hover" effect="pulse" intensity="subtle">
                    <div className="metric-item modern">
                      <div className="metric-icon">⏱️</div>
                      <div className="metric-label">完了時間 中央値 / P90</div>
                      <div className="metric-value">
                        {completionStats 
                          ? `${(completionStats.p50_ms/1000).toFixed(1)}s / ${(completionStats.p90_ms/1000).toFixed(1)}s` 
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </MicroInteraction>
                </div>
              </GlassCard>
            </MicroInteraction>
          </div>

          {/* 日次完了数推移 */}
          <div className="chart-section">
            <MicroInteraction type="hover" effect="lift" intensity="subtle">
              <GlassCard className="chart-card-modern">
                <div className="section-header">
                  <GradientText size="xl" weight="semibold" gradient="primary">
                    日次完了数推移
                  </GradientText>
                  <p className="section-description">
                    診断を完了したユーザー数の日別推移
                  </p>
                </div>
                <div className="type-distribution-chart">
                  {dailyCompleted.map(row => (
                    <div key={row.day} className="chart-bar">
                      <div className="bar-label">
                        <span className="type-code">{row.day}</span>
                        <span className="count">{row.completed}</span>
                      </div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${Math.min(100, (row.completed / Math.max(...dailyCompleted.map(d => d.completed))) * 100)}%` 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </MicroInteraction>
          </div>
        </div>
      </main>
      
      <Footer variant="result" />

      <style>{`
        .analytics-container {
          position: relative;
          min-height: 100vh;
          padding: 2rem 0;
        }
        
        .analytics-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 8px 16px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .badge-icon {
          font-size: 16px;
        }
        
        .dashboard-title {
          margin: 16px 0;
          text-align: center;
        }
        
        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-description {
          color: var(--text-secondary);
          margin-top: 0.5rem;
          font-size: 1.1rem;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
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
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .stat-card-modern {
          text-align: center;
          padding: 2rem;
          transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
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
          font-weight: 500;
        }
        
        .chart-section {
          margin-bottom: 3rem;
        }
        
        .chart-card-modern,
        .metrics-card-modern {
          padding: 2.5rem;
          transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .section-header {
          margin-bottom: 2rem;
        }

        .section-description {
          color: var(--text-secondary);
          margin-top: 1rem;
          font-size: 1rem;
        }
        
        .period-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: center;
        }
        
        .period-btn {
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .period-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .period-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
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
          padding: 0.75rem;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        
        .chart-bar:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }
        
        .bar-label {
          min-width: 140px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .type-code {
          font-weight: 600;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .count {
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .bar-container {
          flex: 1;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, 
            var(--primary), 
            var(--primary-light, var(--primary)));
          border-radius: 12px;
          transition: all 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
          box-shadow: 0 2px 8px rgba(var(--primary-rgb, 0, 122, 255), 0.3);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }
        
        .metric-item.modern {
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
          text-align: center;
        }
        
        .metric-item.modern:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .metric-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          display: block;
        }
        
        .metric-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }
        
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
        }
        
        @media (max-width: 768px) {
          .analytics-container {
            padding: 1rem 0;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .stat-card-modern {
            padding: 1.5rem;
          }
          
          .chart-card-modern,
          .metrics-card-modern {
            padding: 1.5rem;
          }
          
          .period-buttons {
            flex-wrap: wrap;
          }
          
          .bar-label {
            min-width: 120px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .stat-card-modern,
          .chart-card-modern,
          .metrics-card-modern,
          .chart-bar,
          .bar-fill,
          .period-btn,
          .metric-item.modern {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}