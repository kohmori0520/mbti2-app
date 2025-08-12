import React, { useEffect, useMemo, useState } from 'react'
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
          <div style={{marginTop:24}}>
            <div className="section-header">
              <h3 className="text-title-3">期間別タイプ分布</h3>
              <div style={{display:'flex', gap:8}}>
                <button className={`btn ${period==='7d'?'primary':''}`} onClick={()=>setPeriod('7d')}>7日</button>
                <button className={`btn ${period==='30d'?'primary':''}`} onClick={()=>setPeriod('30d')}>30日</button>
                <button className={`btn ${period==='90d'?'primary':''}`} onClick={()=>setPeriod('90d')}>90日</button>
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

          <div style={{marginTop:24}}>
            <div className="section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
              <h3 className="text-title-3">参照元別タイプ分布（直近30日）</h3>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <select value={sourceKind} onChange={e=>{ setSourceKind(e.target.value as any); setSourceValue('') }}>
                  <option value="none">参照元なし</option>
                  <option value="referrer">referrer</option>
                  <option value="utm">utm_source</option>
                </select>
                {sourceKind==='referrer' && (
                  <select value={sourceValue} onChange={e=>setSourceValue(e.target.value)}>
                    {referrerOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {sourceKind==='utm' && (
                  <select value={sourceValue} onChange={e=>setSourceValue(e.target.value)}>
                    {utmOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            {sourceKind !== 'none' && (
              <div className="type-distribution-chart">
                {sourceDistribution.length === 0 ? (
                  <div className="small" style={{color:'var(--text-secondary)'}}>データがありません</div>
                ) : (
                  sourceDistribution.map(item => {
                    const maxCount = Math.max(...sourceDistribution.map(d => d.count))
                    const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                    return (
                      <div key={item.type} className="chart-bar">
                        <div className="bar-label">
                          <span className="type-code">{item.type}</span>
                          <span className="count">{item.count}</span>
                        </div>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
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
            <div className="metric-item">
              <div className="metric-label">完了時間中央値 / P90</div>
              <div className="metric-value">
                {completionStats ? `${(completionStats.p50_ms/1000).toFixed(1)}s / ${(completionStats.p90_ms/1000).toFixed(1)}s` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日次コンバージョン推移（簡易） */}
      <div className="chart-section">
        <div className="card">
          <div className="section-header">
            <h2 className="text-title-2">日次コンバージョン（完了数）</h2>
          </div>
          <div className="type-distribution-chart">
            {dailyCompleted.map(row => (
              <div key={row.day} className="chart-bar">
                <div className="bar-label">
                  <span className="type-code">{row.day}</span>
                  <span className="count">{row.completed}</span>
                </div>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${Math.min(100, row.completed)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 軸別A/B比率 */}
      <div className="chart-section">
        <div className="card">
          <div className="section-header">
            <h2 className="text-title-2">軸別 A/B 比率</h2>
          </div>
          <div className="type-distribution-chart">
            {axisRatio.map(item => (
              <div key={item.axis} className="chart-bar">
                <div className="bar-label">
                  <span className="type-code">{item.axis}</span>
                  <span className="count">A:{item.a_cnt} / B:{item.b_cnt}</span>
                </div>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${item.a_ratio * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* レイテンシ ヒストグラム */}
      <div className="chart-section">
        <div className="card">
          <div className="section-header">
            <h2 className="text-title-2">回答レイテンシ（0–8s, 5分割）</h2>
          </div>
          <div className="type-distribution-chart">
            {latencyHist.map(item => (
              <div key={item.bucket} className="chart-bar">
                <div className="bar-label">
                  <span className="type-code">B{item.bucket}</span>
                  <span className="count">{item.cnt}</span>
                </div>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${Math.min(100, item.cnt)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 設問ランキング */}
      <div className="chart-section">
        <div className="card">
          <div className="section-header">
            <h2 className="text-title-2">設問ランキング（直近30日）</h2>
          </div>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">A/B偏り Top5（|A-B|率）</div>
              <div className="small">
                {questionSkewTop5.map(row => (
                  <div key={row.question_id} style={{display:'flex', justifyContent:'space-between'}}>
                    <span>#Q{row.question_id}</span>
                    <span>A:{row.a_cnt} / B:{row.b_cnt} (skew {(row.skew*100).toFixed(1)}%)</span>
                  </div>
                ))}
                {questionSkewTop5.length===0 && <div>データがありません</div>}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">回答レイテンシ Top5（平均）</div>
              <div className="small">
                {questionLatencyTop5.map(row => (
                  <div key={row.question_id} style={{display:'flex', justifyContent:'space-between'}}>
                    <span>#Q{row.question_id}</span>
                    <span>{(row.avg_latency_ms/1000).toFixed(2)}s（n={row.samples}）</span>
                  </div>
                ))}
                {questionLatencyTop5.length===0 && <div>データがありません</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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