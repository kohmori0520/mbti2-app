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

type MetricCard = {
  title: string
  value: string
  subtitle?: string
  icon: string
  color: string
  change?: string
  trend?: 'up' | 'down' | 'stable'
}

type ChartData = {
  label: string
  value: number
  percentage: number
  color?: string
}

export default function SuperAnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
  const [dailyCompleted, setDailyCompleted] = useState<{ day: string; completed: number }[]>([])
  const [completionStats, setCompletionStats] = useState<{ p50_ms: number; p90_ms: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'trends' | 'insights'>('overview')

  const completionRate = stats ? (stats.completedSessions / Math.max(stats.totalSessions, 1)) * 100 : 0

  const metricCards: MetricCard[] = useMemo(() => [
    {
      title: '総利用者数',
      value: stats?.totalSessions.toLocaleString() || '0',
      subtitle: '診断を開始した人数',
      icon: '👥',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      change: '+12%',
      trend: 'up'
    },
    {
      title: '完了率',
      value: `${completionRate.toFixed(1)}%`,
      subtitle: '最後まで診断した割合',
      icon: '🎯',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      change: completionRate > 70 ? '+5%' : '-2%',
      trend: completionRate > 70 ? 'up' : 'down'
    },
    {
      title: '平均回答時間',
      value: completionStats ? `${(completionStats.p50_ms/1000).toFixed(1)}秒` : 'N/A',
      subtitle: '1問あたりの思考時間',
      icon: '⚡',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      change: '最適',
      trend: 'stable'
    },
    {
      title: '人気タイプ',
      value: stats?.mostCommonType || 'N/A',
      subtitle: '最も多い性格タイプ',
      icon: '🏆',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      change: '1位',
      trend: 'up'
    }
  ], [stats, completionRate, completionStats])

  const chartData: ChartData[] = useMemo(() => {
    const total = typeDistribution.reduce((sum, item) => sum + item.count, 0)
    return typeDistribution.slice(0, 8).map((item, index) => ({
      label: item.type,
      value: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
      color: [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#fa709a', '#fee140'
      ][index]
    }))
  }, [typeDistribution])

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        
        const [statsData, distributionData, daily, compStats] = await Promise.all([
          DatabaseService.getStats().catch(() => null),
          DatabaseService.getTypeDistribution().catch(() => []),
          DatabaseService.fetchDailyCompleted().catch(() => []),
          DatabaseService.fetchCompletionTimeStats().catch(() => [])
        ])

        if (statsData) setStats(statsData)
        setTypeDistribution(distributionData || [])
        setDailyCompleted(daily || [])
        setCompletionStats((compStats && compStats[0]) || null)
        setError(null)
      } catch (err) {
        setError('データの読み込みに失敗しました')
        console.error('Analytics loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadAnalytics, 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="app-layout">
        <Header variant="frosted" />
        <main className="app-main">
          <div className="container">
            <div className="super-loading">
              <div className="loading-rings">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p>高度な分析を準備中...</p>
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
            <div className="super-error">
              <div className="error-icon">⚠️</div>
              <h2>データを取得できませんでした</h2>
              <p>{error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                再試行
              </button>
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
        <div className="container super-analytics">
          <AnimatedBackground 
            variant="waves" 
            intensity="subtle" 
            speed="slow"
            colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
          />
          
          {/* ヘッダーセクション */}
          <div className="super-header">
            <div className="header-content">
              <MicroInteraction type="hover" effect="bounce" intensity="subtle">
                <div className="analytics-logo">
                  <span className="logo-icon">📊</span>
                  <span className="logo-text">Analytics</span>
                </div>
              </MicroInteraction>
              
              <GradientText 
                size="xxxl"
                weight="bold"
                gradient="rainbow"
                animate={true}
                className="super-title"
              >
                分析ダッシュボード
              </GradientText>
              
              <p className="super-subtitle">
                PersonalTypeの詳細な利用データと洞察を表示
              </p>
            </div>
            
            <div className="hero-visual">
              <div className="floating-elements">
                <div className="float-element" style={{ '--delay': '0s' } as React.CSSProperties}>📈</div>
                <div className="float-element" style={{ '--delay': '0.5s' } as React.CSSProperties}>💡</div>
                <div className="float-element" style={{ '--delay': '1s' } as React.CSSProperties}>🔮</div>
                <div className="float-element" style={{ '--delay': '1.5s' } as React.CSSProperties}>✨</div>
              </div>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="super-tabs">
            {[
              { id: 'overview', label: '概要', icon: '📊' },
              { id: 'types', label: 'タイプ分析', icon: '🧬' },
              { id: 'trends', label: 'トレンド', icon: '📈' },
              { id: 'insights', label: '洞察', icon: '🔍' }
            ].map((tab) => (
              <MicroInteraction key={tab.id} type="hover" effect="lift" intensity="subtle">
                <button
                  className={`super-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              </MicroInteraction>
            ))}
          </div>

          {/* メインコンテンツ */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              {/* メトリクスカード */}
              <div className="metrics-grid">
                {metricCards.map((metric, index) => (
                  <MicroInteraction key={metric.title} type="hover" effect="lift" intensity="normal">
                    <GlassCard className="super-metric-card">
                      <div className="metric-header">
                        <div className="metric-icon" style={{ background: metric.color }}>
                          {metric.icon}
                        </div>
                        <div className="metric-trend">
                          {metric.trend === 'up' && <span className="trend-up">↗️</span>}
                          {metric.trend === 'down' && <span className="trend-down">↘️</span>}
                          {metric.trend === 'stable' && <span className="trend-stable">➡️</span>}
                          <span className="trend-value">{metric.change}</span>
                        </div>
                      </div>
                      
                      <div className="metric-body">
                        <h3 className="metric-title">{metric.title}</h3>
                        <div className="metric-value" style={{ background: metric.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {metric.value}
                        </div>
                        <p className="metric-subtitle">{metric.subtitle}</p>
                      </div>
                      
                      <div className="metric-pulse" style={{ background: metric.color }}></div>
                    </GlassCard>
                  </MicroInteraction>
                ))}
              </div>

              {/* クイック統計 */}
              <div className="quick-stats">
                <MicroInteraction type="hover" effect="lift" intensity="subtle">
                  <GlassCard className="stat-summary">
                    <h3>📝 今日のハイライト</h3>
                    <div className="highlight-grid">
                      <div className="highlight-item">
                        <span className="highlight-number">{dailyCompleted.slice(-1)[0]?.completed || 0}</span>
                        <span className="highlight-label">今日の完了数</span>
                      </div>
                      <div className="highlight-item">
                        <span className="highlight-number">{stats?.totalAnswers.toLocaleString() || 0}</span>
                        <span className="highlight-label">総回答数</span>
                      </div>
                      <div className="highlight-item">
                        <span className="highlight-number">{typeDistribution.length}</span>
                        <span className="highlight-label">検出されたタイプ</span>
                      </div>
                    </div>
                  </GlassCard>
                </MicroInteraction>
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="tab-content">
              <MicroInteraction type="hover" effect="lift" intensity="subtle">
                <GlassCard className="types-analysis">
                  <div className="section-header">
                    <GradientText size="xl" weight="semibold" gradient="primary">
                      🧬 性格タイプ分布
                    </GradientText>
                    <p className="section-desc">診断結果の詳細な分析と傾向</p>
                  </div>

                  <div className="types-grid">
                    {chartData.map((item, index) => (
                      <MicroInteraction key={item.label} type="hover" effect="pulse" intensity="subtle">
                        <div className="type-card-super">
                          <div 
                            className="type-progress"
                            style={{
                              background: `conic-gradient(${item.color} ${item.percentage * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                            }}
                          >
                            <div className="progress-inner">
                              <span className="type-code">{item.label}</span>
                            </div>
                          </div>
                          <div className="type-info">
                            <div className="type-percentage">{item.percentage.toFixed(1)}%</div>
                            <div className="type-count">{item.value}人</div>
                          </div>
                        </div>
                      </MicroInteraction>
                    ))}
                  </div>
                </GlassCard>
              </MicroInteraction>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="tab-content">
              <MicroInteraction type="hover" effect="lift" intensity="subtle">
                <GlassCard className="trends-analysis">
                  <div className="section-header">
                    <GradientText size="xl" weight="semibold" gradient="primary">
                      📈 利用トレンド
                    </GradientText>
                    <p className="section-desc">日別の利用状況推移</p>
                  </div>

                  <div className="trend-chart">
                    <div className="chart-container">
                      {dailyCompleted.slice(-14).map((day, index) => {
                        const maxValue = Math.max(...dailyCompleted.map(d => d.completed))
                        const height = maxValue > 0 ? (day.completed / maxValue) * 200 : 0
                        
                        return (
                          <MicroInteraction key={day.day} type="hover" effect="pulse" intensity="subtle">
                            <div className="trend-bar">
                              <div 
                                className="bar-fill-trend"
                                style={{ 
                                  height: `${height}px`,
                                  background: `linear-gradient(to top, #667eea, #764ba2)`
                                }}
                              />
                              <div className="bar-label">
                                <span className="bar-value">{day.completed}</span>
                                <span className="bar-date">{day.day.split('-').slice(-1)[0]}</span>
                              </div>
                            </div>
                          </MicroInteraction>
                        )
                      })}
                    </div>
                  </div>
                </GlassCard>
              </MicroInteraction>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="tab-content">
              <div className="insights-grid">
                <MicroInteraction type="hover" effect="lift" intensity="subtle">
                  <GlassCard className="insight-card">
                    <div className="insight-icon">🎯</div>
                    <h3>完了率分析</h3>
                    <p>
                      現在の完了率は{completionRate.toFixed(1)}%です。
                      {completionRate > 70 ? 
                        '優秀な数値を維持しています！' : 
                        'さらなる改善の余地があります。'
                      }
                    </p>
                  </GlassCard>
                </MicroInteraction>

                <MicroInteraction type="hover" effect="lift" intensity="subtle">
                  <GlassCard className="insight-card">
                    <div className="insight-icon">⚡</div>
                    <h3>回答速度</h3>
                    <p>
                      平均回答時間は{completionStats ? `${(completionStats.p50_ms/1000).toFixed(1)}秒` : 'N/A'}です。
                      ユーザーは適度に考えて回答しています。
                    </p>
                  </GlassCard>
                </MicroInteraction>

                <MicroInteraction type="hover" effect="lift" intensity="subtle">
                  <GlassCard className="insight-card">
                    <div className="insight-icon">🏆</div>
                    <h3>人気タイプ</h3>
                    <p>
                      最も多いタイプは{stats?.mostCommonType || 'N/A'}です。
                      このタイプの特徴を活かしたコンテンツを提供できます。
                    </p>
                  </GlassCard>
                </MicroInteraction>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer variant="analytics" />

      <style>{`
        .super-analytics {
          position: relative;
          min-height: 100vh;
          padding: 0;
        }
        
        .super-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4rem 2rem;
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }
        
        .header-content {
          flex: 1;
        }
        
        .analytics-logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          padding: 12px 20px;
          margin-bottom: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .logo-icon {
          font-size: 20px;
        }
        
        .super-title {
          margin: 20px 0;
          text-align: left;
        }
        
        .super-subtitle {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin: 0;
          max-width: 500px;
        }
        
        .hero-visual {
          position: relative;
          width: 200px;
          height: 200px;
        }
        
        .floating-elements {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .float-element {
          position: absolute;
          font-size: 24px;
          animation: float 3s ease-in-out infinite;
          animation-delay: var(--delay);
        }
        
        .float-element:nth-child(1) { top: 20%; left: 10%; }
        .float-element:nth-child(2) { top: 10%; right: 20%; }
        .float-element:nth-child(3) { bottom: 30%; left: 20%; }
        .float-element:nth-child(4) { bottom: 10%; right: 10%; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .super-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 3rem;
          padding: 0 2rem;
        }
        
        .super-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .super-tab:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .super-tab.active {
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          border-color: transparent;
          box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
        }
        
        .tab-icon {
          font-size: 16px;
        }
        
        .tab-content {
          padding: 0 2rem;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .super-metric-card {
          position: relative;
          padding: 2rem;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        
        .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .metric-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        .trend-stable { color: #6b7280; }
        
        .metric-body {
          position: relative;
          z-index: 2;
        }
        
        .metric-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        
        .metric-value {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .metric-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }
        
        .metric-pulse {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        
        .quick-stats {
          margin-bottom: 3rem;
        }
        
        .stat-summary {
          padding: 2rem;
        }
        
        .stat-summary h3 {
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .highlight-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
        }
        
        .highlight-item {
          text-align: center;
        }
        
        .highlight-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        
        .highlight-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .types-analysis,
        .trends-analysis {
          padding: 2.5rem;
        }
        
        .section-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .section-desc {
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }
        
        .types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
        }
        
        .type-card-super {
          text-align: center;
          position: relative;
        }
        
        .type-progress {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 1rem;
          position: relative;
          padding: 4px;
        }
        
        .progress-inner {
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }
        
        .type-code {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }
        
        .type-info {
          text-align: center;
        }
        
        .type-percentage {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 4px;
        }
        
        .type-count {
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .trend-chart {
          padding: 2rem 0;
        }
        
        .chart-container {
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 8px;
          height: 250px;
          overflow-x: auto;
          padding-bottom: 2rem;
        }
        
        .trend-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 40px;
        }
        
        .bar-fill-trend {
          width: 32px;
          min-height: 4px;
          border-radius: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .bar-label {
          margin-top: 8px;
          text-align: center;
        }
        
        .bar-value {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .bar-date {
          display: block;
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .insight-card {
          padding: 2rem;
          text-align: center;
        }
        
        .insight-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }
        
        .insight-card h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        
        .insight-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }
        
        .super-loading,
        .super-error {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .loading-rings {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
        }
        
        .loading-rings div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 64px;
          height: 64px;
          margin: 8px;
          border: 8px solid var(--primary);
          border-radius: 50%;
          animation: loading-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: var(--primary) transparent transparent transparent;
        }
        
        .loading-rings div:nth-child(1) { animation-delay: -0.45s; }
        .loading-rings div:nth-child(2) { animation-delay: -0.3s; }
        .loading-rings div:nth-child(3) { animation-delay: -0.15s; }
        
        @keyframes loading-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .super-error h2 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        
        .retry-button {
          margin-top: 1rem;
          padding: 12px 24px;
          border: none;
          border-radius: 25px;
          background: var(--primary);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
        }
        
        @media (max-width: 768px) {
          .super-header {
            flex-direction: column;
            text-align: center;
            padding: 2rem 1rem;
          }
          
          .hero-visual {
            margin-top: 2rem;
          }
          
          .super-tabs {
            flex-wrap: wrap;
            padding: 0 1rem;
          }
          
          .tab-content {
            padding: 0 1rem;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .highlight-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .types-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          
          .insights-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .float-element,
          .metric-pulse,
          .loading-rings div {
            animation: none;
          }
          
          .super-metric-card,
          .super-tab,
          .retry-button {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}