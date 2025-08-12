import React, { useState } from 'react'
import detailedInsights from '../data/detailed_insights.json'

type Props = {
  typeCode: string
}

type InsightTab = 'cognitive' | 'stress' | 'growth' | 'relationships' | 'work' | 'learning' | 'development'

export default function DetailedInsights({ typeCode }: Props) {
  const [activeTab, setActiveTab] = useState<InsightTab>('cognitive')
  
  const insights = detailedInsights[typeCode as keyof typeof detailedInsights]
  
  if (!insights) {
    return <div>このタイプの詳細情報は準備中です。</div>
  }

  const tabs: Array<{ id: InsightTab; label: string; icon: string }> = [
    { id: 'cognitive', label: '認知機能', icon: '🧠' },
    { id: 'stress', label: 'ストレス', icon: '⚡' },
    { id: 'growth', label: '成長段階', icon: '📈' },
    { id: 'relationships', label: '人間関係', icon: '💕' },
    { id: 'work', label: '仕事', icon: '💼' },
    { id: 'learning', label: '学習', icon: '📚' },
    { id: 'development', label: '成長計画', icon: '🎯' }
  ]

  return (
    <div className="detailed-insights">
      <div className="insights-header">
        <h2 className="text-title-2">詳細分析</h2>
        <p className="insights-description">
          認知科学に基づいた深い洞察で、あなたの性格をより深く理解しましょう
        </p>
      </div>

      {/* タブナビゲーション */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="tab-content">
        {activeTab === 'cognitive' && insights.cognitive_functions && (
          <div className="cognitive-tab">
            <div className="cognitive-overview">
              <h3>認知機能スタック</h3>
              <p className="function-description">{insights.cognitive_functions.description}</p>
            </div>
            
            <div className="functions-grid">
              <div className="function-card dominant">
                <div className="function-header">
                  <h4>主機能 (Dominant)</h4>
                  <div className="function-name">{insights.cognitive_functions.dominant}</div>
                </div>
                <p>最も発達した機能。自然に使える「得意技」</p>
              </div>
              
              <div className="function-card auxiliary">
                <div className="function-header">
                  <h4>補助機能 (Auxiliary)</h4>
                  <div className="function-name">{insights.cognitive_functions.auxiliary}</div>
                </div>
                <p>主機能をバランスよく支える「パートナー」</p>
              </div>
              
              <div className="function-card tertiary">
                <div className="function-header">
                  <h4>第3機能 (Tertiary)</h4>
                  <div className="function-name">{insights.cognitive_functions.tertiary}</div>
                </div>
                <p>中年期に発達する「隠れた才能」</p>
              </div>
              
              <div className="function-card inferior">
                <div className="function-header">
                  <h4>劣勢機能 (Inferior)</h4>
                  <div className="function-name">{insights.cognitive_functions.inferior}</div>
                </div>
                <p>ストレス時に現れる「アキレス腱」</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stress' && insights.stress_patterns && (
          <div className="stress-tab">
            <div className="stress-section">
              <h3>⚠️ ストレスの引き金</h3>
              <div className="stress-triggers">
                {insights.stress_patterns.triggers.map((trigger, i) => (
                  <div key={i} className="trigger-item">
                    <span className="trigger-icon">🔥</span>
                    <span>{trigger}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stress-section">
              <h3>😰 ストレス症状</h3>
              <div className="stress-symptoms">
                {insights.stress_patterns.symptoms.map((symptom, i) => (
                  <div key={i} className="symptom-item">
                    <span className="symptom-icon">💢</span>
                    <span>{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stress-section">
              <h3>💚 対処方法</h3>
              <div className="coping-strategies">
                {insights.stress_patterns.coping_strategies.map((strategy, i) => (
                  <div key={i} className="strategy-item">
                    <span className="strategy-icon">✨</span>
                    <span>{strategy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'growth' && insights.growth_stages && (
          <div className="growth-tab">
            <div className="growth-stage">
              <div className="stage-header">
                <h3>🌱 青年期 (20-35歳)</h3>
              </div>
              <p>{insights.growth_stages.early}</p>
            </div>
            
            <div className="growth-stage">
              <div className="stage-header">
                <h3>🌳 中年期 (35-55歳)</h3>
              </div>
              <p>{insights.growth_stages.middle}</p>
            </div>
            
            <div className="growth-stage">
              <div className="stage-header">
                <h3>🍃 成熟期 (55歳以上)</h3>
              </div>
              <p>{insights.growth_stages.mature}</p>
            </div>
          </div>
        )}

        {activeTab === 'relationships' && insights.life_applications?.relationships && (
          <div className="relationships-tab">
            <div className="application-section">
              <h3>💪 人間関係での強み</h3>
              <ul className="strengths-list">
                {insights.life_applications.relationships.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="application-section">
              <h3>⚠️ 注意すべき点</h3>
              <ul className="challenges-list">
                {insights.life_applications.relationships.challenges.map((challenge, i) => (
                  <li key={i}>{challenge}</li>
                ))}
              </ul>
            </div>

            <div className="application-section">
              <h3>💡 アドバイス</h3>
              <div className="advice-card">
                <p>{insights.life_applications.relationships.advice}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'work' && insights.life_applications?.work && (
          <div className="work-tab">
            <div className="application-section">
              <h3>🌟 理想的な職場環境</h3>
              <div className="environment-grid">
                {insights.life_applications.work.ideal_environments?.map((env, i) => (
                  <div key={i} className="environment-item">
                    <span className="env-icon">✅</span>
                    <span>{env}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="application-section">
              <h3>👑 リーダーシップスタイル</h3>
              <div className="leadership-card">
                <p>{insights.life_applications.work.leadership_style}</p>
              </div>
            </div>

            <div className="application-section">
              <h3>🤝 協働のコツ</h3>
              <div className="advice-card">
                <p>{insights.life_applications.work.collaboration_tips}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'learning' && insights.life_applications?.learning && (
          <div className="learning-tab">
            <div className="application-section">
              <h3>🎯 最適な学習スタイル</h3>
              <div className="learning-style">
                <p>{insights.life_applications.learning.preferred_style}</p>
              </div>
            </div>

            <div className="application-section">
              <h3>📋 効果的な学習方法</h3>
              <div className="methods-grid">
                {insights.life_applications.learning.effective_methods?.map((method, i) => (
                  <div key={i} className="method-item">
                    <span className="method-icon">📝</span>
                    <span>{method}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="application-section">
              <h3>💡 学習のコツ</h3>
              <div className="advice-card">
                <p>{insights.life_applications.learning.tips}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'development' && insights.development_roadmap && (
          <div className="development-tab">
            <div className="roadmap-section">
              <h3>🎯 1ヶ月プラン</h3>
              <div className="plan-list">
                {insights.development_roadmap['1_month']?.map((item, i) => (
                  <div key={i} className="plan-item">
                    <span className="plan-icon">✅</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="roadmap-section">
              <h3>🚀 3ヶ月プラン</h3>
              <div className="plan-list">
                {insights.development_roadmap['3_months']?.map((item, i) => (
                  <div key={i} className="plan-item">
                    <span className="plan-icon">🎪</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="roadmap-section">
              <h3>🌟 1年プラン</h3>
              <div className="plan-list">
                {insights.development_roadmap['1_year']?.map((item, i) => (
                  <div key={i} className="plan-item">
                    <span className="plan-icon">🏆</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .detailed-insights {
          max-width: 1000px;
          margin: 0 auto;
        }

        .insights-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .insights-description {
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding: 0.5rem;
          background: var(--surface-variant);
          border-radius: 12px;
        }

        .tab-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 70px;
          font-size: 0.8rem;
        }

        .tab-button:hover {
          background: var(--surface-hover);
        }

        .tab-button.active {
          background: var(--primary);
          color: white;
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-content {
          background: var(--surface);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .functions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .functions-grid {
            grid-template-columns: 1fr;
          }
        }

        .function-card {
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid transparent;
        }

        .function-card.dominant {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .function-card.auxiliary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .function-card.tertiary {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .function-card.inferior {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }

        .function-header {
          margin-bottom: 0.5rem;
        }

        .function-header h4 {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .function-name {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: monospace;
        }

        .stress-section, .application-section, .roadmap-section {
          margin-bottom: 2rem;
        }

        .stress-triggers, .stress-symptoms, .coping-strategies,
        .environment-grid, .methods-grid, .plan-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .trigger-item, .symptom-item, .strategy-item,
        .environment-item, .method-item, .plan-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--surface-variant);
          border-radius: 8px;
        }

        .trigger-icon, .symptom-icon, .strategy-icon,
        .env-icon, .method-icon, .plan-icon {
          font-size: 1.1rem;
        }

        .growth-stage {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--surface-variant);
          border-radius: 12px;
        }

        .stage-header {
          margin-bottom: 1rem;
        }

        .strengths-list, .challenges-list {
          list-style: none;
          padding: 0;
          margin-top: 1rem;
        }

        .strengths-list li, .challenges-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-light);
        }

        .strengths-list li:before {
          content: "✅ ";
          margin-right: 0.5rem;
        }

        .challenges-list li:before {
          content: "⚠️ ";
          margin-right: 0.5rem;
        }

        .advice-card, .leadership-card, .learning-style {
          background: var(--primary-light);
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 4px solid var(--primary);
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .tab-navigation {
            flex-wrap: wrap;
          }
          
          .tab-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}