import React, { useState } from 'react'
import { PersonaDetailsMap } from '../types'
import typeRelationships from '../data/type_relationships.json'
import careerGuidance from '../data/career_guidance.json'
import { PERSONAS } from '../logic/scoring'
import { makeTypeAvatar } from '../utils/avatar'

type Props = {
  typeCode: string
  details: PersonaDetailsMap
}

type TabType = 'overview' | 'compatibility' | 'career' | 'growth'

export default function EnhancedTypeDetail({ typeCode, details }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  const typeDetail = details[typeCode]
  const persona = PERSONAS.find(p => p.code === typeCode)
  const compatibility = typeRelationships.compatibility[typeCode as keyof typeof typeRelationships.compatibility]
  const career = careerGuidance.career_paths[typeCode as keyof typeof careerGuidance.career_paths]
  const avatar = typeDetail ? makeTypeAvatar(typeCode, typeDetail.color) : null

  if (!typeDetail || !persona) {
    return <div>タイプが見つかりません</div>
  }

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'overview', label: '概要', icon: '📊' },
    { id: 'compatibility', label: '相性', icon: '💕' },
    { id: 'career', label: 'キャリア', icon: '💼' },
    { id: 'growth', label: '成長', icon: '🌱' }
  ]

  return (
    <div className="enhanced-type-detail">
      {/* ヘッダー */}
      <div className="type-header" style={{ backgroundColor: typeDetail.color + '10' }}>
        <div className="type-header-content">
          {avatar && (
            <div className="type-avatar">
              <img src={avatar} alt={typeDetail.title} />
            </div>
          )}
          <div className="type-info">
            <div className="type-code" style={{ color: typeDetail.color }}>
              {typeCode}
            </div>
            <h1 className="type-title">{typeDetail.title}</h1>
            <p className="type-oneliner">{typeDetail.oneLiner}</p>
            <div className="type-keywords">
              {typeDetail.keywords?.map((keyword, i) => (
                <span 
                  key={i} 
                  className="keyword-tag"
                  style={{ backgroundColor: typeDetail.color + '20', color: typeDetail.color }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              borderBottomColor: activeTab === tab.id ? typeDetail.color : 'transparent'
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <section className="summary-section">
              <h2>詳細な説明</h2>
              <p className="summary-text">{typeDetail.summaryLong}</p>
            </section>

            <div className="traits-grid">
              <div className="trait-card strengths">
                <h3>💪 強み</h3>
                <ul>
                  {typeDetail.strengths?.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="trait-card growth-areas">
                <h3>🎯 成長ポイント</h3>
                <ul>
                  {typeDetail.growth?.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <section className="roles-section">
              <h2>適性のある役割</h2>
              <div className="roles-list">
                {typeDetail.recommendedRoles?.map((role, i) => (
                  <span key={i} className="role-tag">{role}</span>
                ))}
              </div>
            </section>

            {typeDetail.famous && (
              <section className="famous-section">
                <h2>代表的な人物</h2>
                <div className="famous-list">
                  {typeDetail.famous.map((person, i) => (
                    <span key={i} className="famous-person">{person}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'compatibility' && compatibility && (
          <div className="compatibility-tab">
            <section className="best-matches">
              <h2>🎯 最高の相性</h2>
              <div className="compatibility-list">
                {compatibility.best_matches?.map((matchType) => {
                  const matchPersona = PERSONAS.find(p => p.code === matchType)
                  const matchDetail = details[matchType]
                  const description = compatibility.descriptions?.[matchType as keyof typeof compatibility.descriptions]
                  
                  return matchPersona && matchDetail ? (
                    <div key={matchType} className="compatibility-card best">
                      <div className="match-header">
                        <div className="match-type">
                          <span className="match-code" style={{ color: matchDetail.color }}>
                            {matchType}
                          </span>
                          <span className="match-name">{matchPersona.name}</span>
                        </div>
                        <div className="compatibility-score">★★★</div>
                      </div>
                      {description && (
                        <p className="match-description">{description}</p>
                      )}
                    </div>
                  ) : null
                })}
              </div>
            </section>

            <section className="good-matches">
              <h2>👍 良い相性</h2>
              <div className="compatibility-list">
                {compatibility.good_matches?.map((matchType) => {
                  const matchPersona = PERSONAS.find(p => p.code === matchType)
                  const matchDetail = details[matchType]
                  
                  return matchPersona && matchDetail ? (
                    <div key={matchType} className="compatibility-card good">
                      <div className="match-header">
                        <div className="match-type">
                          <span className="match-code" style={{ color: matchDetail.color }}>
                            {matchType}
                          </span>
                          <span className="match-name">{matchPersona.name}</span>
                        </div>
                        <div className="compatibility-score">★★</div>
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            </section>

            <section className="challenging-matches">
              <h2>⚠️ 注意が必要な相性</h2>
              <div className="compatibility-list">
                {compatibility.challenging?.map((matchType) => {
                  const matchPersona = PERSONAS.find(p => p.code === matchType)
                  const matchDetail = details[matchType]
                  
                  return matchPersona && matchDetail ? (
                    <div key={matchType} className="compatibility-card challenging">
                      <div className="match-header">
                        <div className="match-type">
                          <span className="match-code" style={{ color: matchDetail.color }}>
                            {matchType}
                          </span>
                          <span className="match-name">{matchPersona.name}</span>
                        </div>
                        <div className="compatibility-score">⚡</div>
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'career' && career && (
          <div className="career-tab">
            <section className="ideal-roles">
              <h2>💼 理想的な職業・役割</h2>
              <div className="roles-grid">
                {career.ideal_roles?.map((role, i) => (
                  <div key={i} className="role-card">
                    {role}
                  </div>
                ))}
              </div>
            </section>

            <section className="work-environment">
              <h2>🏢 最適な職場環境</h2>
              <div className="environment-info">
                <div className="environment-item best">
                  <h4>✅ 理想的な環境</h4>
                  <p>{career.work_environment?.best}</p>
                </div>
                <div className="environment-item avoid">
                  <h4>❌ 避けるべき環境</h4>
                  <p>{career.work_environment?.avoid}</p>
                </div>
                <div className="environment-item culture">
                  <h4>🎨 適した企業文化</h4>
                  <p>{career.work_environment?.culture}</p>
                </div>
              </div>
            </section>

            <section className="growth-opportunities">
              <h2>📈 成長機会</h2>
              <ul className="growth-list">
                {career.growth_opportunities?.map((opportunity, i) => (
                  <li key={i}>{opportunity}</li>
                ))}
              </ul>
            </section>

            <section className="success-metrics">
              <h2>🎯 成功指標</h2>
              <ul className="metrics-list">
                {career.success_metrics?.map((metric, i) => (
                  <li key={i}>{metric}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="growth-tab">
            <section className="development-areas">
              <h2>🌱 発達領域</h2>
              <div className="development-content">
                <div className="strength-development">
                  <h3>強みをさらに伸ばす</h3>
                  <ul>
                    {typeDetail.strengths?.map((strength, i) => (
                      <li key={i}>
                        <strong>{strength}</strong>を活かして、より専門性を深める
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="growth-development">
                  <h3>成長ポイントに取り組む</h3>
                  <ul>
                    {typeDetail.growth?.map((area, i) => (
                      <li key={i}>{area}について意識的に学ぶ・実践する</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="action-plans">
              <h2>📋 具体的なアクションプラン</h2>
              <div className="action-grid">
                <div className="action-card">
                  <h4>短期（1-3ヶ月）</h4>
                  <ul>
                    <li>自分の強みを意識的に活用する機会を増やす</li>
                    <li>成長ポイントに関する本を1冊読む</li>
                    <li>フィードバックを積極的に求める</li>
                  </ul>
                </div>
                <div className="action-card">
                  <h4>中期（6ヶ月-1年）</h4>
                  <ul>
                    <li>新しいプロジェクトや役割に挑戦する</li>
                    <li>メンターや成長パートナーを見つける</li>
                    <li>スキルアップのための研修・勉強会に参加</li>
                  </ul>
                </div>
                <div className="action-card">
                  <h4>長期（1-3年）</h4>
                  <ul>
                    <li>キャリアゴールの明確化と計画策定</li>
                    <li>専門性を活かした新しい価値創出</li>
                    <li>他者の成長支援・メンタリング</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      <style jsx>{`
        .enhanced-type-detail {
          max-width: 1000px;
          margin: 0 auto;
        }

        .type-header {
          padding: 3rem 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .type-header-content {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .type-avatar img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
        }

        .type-code {
          font-size: 1.2rem;
          font-weight: 700;
          font-family: monospace;
          margin-bottom: 0.5rem;
        }

        .type-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .type-oneliner {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .type-keywords {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .keyword-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .tab-navigation {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          font-size: 1rem;
          white-space: nowrap;
        }

        .tab-button:hover {
          background: var(--surface-hover);
        }

        .tab-button.active {
          color: var(--primary);
          background: var(--surface-hover);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-content {
          padding: 0 1rem;
        }

        .summary-section {
          margin-bottom: 2rem;
        }

        .summary-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .traits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .traits-grid {
            grid-template-columns: 1fr;
          }
        }

        .trait-card {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .trait-card h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .trait-card ul {
          list-style: none;
          padding: 0;
        }

        .trait-card li {
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-light);
        }

        .trait-card li:last-child {
          border-bottom: none;
        }

        .roles-section, .famous-section {
          margin-bottom: 2rem;
        }

        .roles-list, .famous-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .role-tag, .famous-person {
          background: var(--surface-variant);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .compatibility-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .compatibility-card {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .match-type {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .match-code {
          font-family: monospace;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .match-name {
          font-weight: 500;
        }

        .compatibility-score {
          font-size: 1.2rem;
        }

        .match-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .role-card {
          background: var(--surface-variant);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-weight: 500;
        }

        .environment-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .environment-item {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .environment-item h4 {
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .growth-list, .metrics-list {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .development-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .development-content {
            grid-template-columns: 1fr;
          }
        }

        .strength-development, .growth-development {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: var(--surface);
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .action-card h4 {
          margin-bottom: 1rem;
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .type-header {
            padding: 2rem 1rem;
          }
          
          .type-header-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          
          .tab-content {
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}