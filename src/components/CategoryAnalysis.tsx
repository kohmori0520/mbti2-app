import React, { useState, useEffect } from 'react'
import { DatabaseService } from '../services/database'
import { PERSONAS } from '../logic/scoring'

type AnalysisCategory = 'temperament' | 'thinking_style' | 'work_style' | 'communication'

type CategoryData = {
  [key: string]: {
    types: string[]
    description: string
    characteristics: string[]
  }
}

const categoryDefinitions: Record<AnalysisCategory, CategoryData> = {
  temperament: {
    'NT (理性的)': {
      types: ['T1', 'T2', 'T6', 'T7'],
      description: '論理的思考と効率性を重視するタイプ',
      characteristics: ['戦略的思考', '問題解決志向', '論理性重視', '成果追求']
    },
    'NF (理想主義)': {
      types: ['F1', 'F3', 'F7', 'P1'],
      description: '人の成長と理想の実現を重視するタイプ',
      characteristics: ['人間関係重視', '価値観の追求', '成長志向', '創造性']
    },
    'SJ (保守的)': {
      types: ['T3', 'T5', 'F5', 'P3'],
      description: '安定性と継続性を重視するタイプ',
      characteristics: ['責任感', '継続性', '安定志向', '協調性']
    },
    'SP (現実主義)': {
      types: ['T8', 'P2', 'P4', 'P6', 'P8', 'F2', 'F4', 'F6', 'F8', 'P5', 'P7', 'T4'],
      description: '柔軟性と実用性を重視するタイプ',
      characteristics: ['適応力', '実用性', '柔軟性', '現実的アプローチ']
    }
  },
  thinking_style: {
    '論理重視型': {
      types: ['T1', 'T5', 'T6', 'T7'],
      description: '論理的分析と効率性を重視',
      characteristics: ['データ重視', '客観的判断', '効率性追求', '論理的思考']
    },
    '創造重視型': {
      types: ['T2', 'P1', 'P4', 'F2'],
      description: '新しいアイデアと創造性を重視',
      characteristics: ['アイデア創出', '創造性', '可能性追求', '革新志向']
    },
    '実用重視型': {
      types: ['T3', 'T8', 'P6', 'P8'],
      description: '実用性と実行可能性を重視',
      characteristics: ['実践性', '実行力', '現実的判断', '成果重視']
    },
    '価値重視型': {
      types: ['F1', 'F3', 'F4', 'F7'],
      description: '人間的価値と意義を重視',
      characteristics: ['価値観重視', '人間関係', '意義追求', '共感力']
    }
  },
  work_style: {
    'リーダータイプ': {
      types: ['T1', 'T7', 'P8', 'F1'],
      description: '主導権を取って組織を牽引',
      characteristics: ['リーダーシップ', '意思決定力', '推進力', '責任感']
    },
    '企画・創造タイプ': {
      types: ['T2', 'P1', 'P4', 'F2'],
      description: 'アイデア創出と企画立案が得意',
      characteristics: ['企画力', '創造性', '発想力', '構想力']
    },
    '実行・運営タイプ': {
      types: ['T3', 'T5', 'P6', 'P8'],
      description: '計画を確実に実行し運営管理',
      characteristics: ['実行力', '管理能力', '継続性', '効率性']
    },
    'サポート・調整タイプ': {
      types: ['F5', 'P3', 'P7', 'F8'],
      description: 'チームをサポートし調整役を担う',
      characteristics: ['サポート力', '調整能力', '協調性', '配慮']
    },
    '専門・分析タイプ': {
      types: ['T4', 'T6', 'P5', 'F7'],
      description: '専門性を深め分析・研究を行う',
      characteristics: ['専門性', '分析力', '探求心', '独立性']
    }
  },
  communication: {
    '直接・明確型': {
      types: ['T1', 'T5', 'T7', 'P8'],
      description: '直接的で明確なコミュニケーション',
      characteristics: ['明確性', '効率重視', '結果志向', '率直さ']
    },
    '創造・表現型': {
      types: ['T2', 'P1', 'P4', 'F4'],
      description: '創造的で表現豊かなコミュニケーション',
      characteristics: ['表現力', '創造性', '多様性', '柔軟性']
    },
    '協調・支援型': {
      types: ['F1', 'F5', 'P3', 'P7'],
      description: '相手に配慮し協調を重視',
      characteristics: ['配慮', '協調性', '支援姿勢', '調和重視']
    },
    '分析・慎重型': {
      types: ['T3', 'T4', 'T6', 'P5'],
      description: '分析的で慎重なコミュニケーション',
      characteristics: ['慎重性', '分析的', '論理性', '深い思考']
    },
    '実践・現実型': {
      types: ['T8', 'P2', 'P6', 'F8'],
      description: '実践的で現実的なコミュニケーション',
      characteristics: ['実用性', '現実的', '行動重視', '適応性']
    }
  }
}

export default function CategoryAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory>('temperament')
  const [typeDistribution, setTypeDistribution] = useState<{ type: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const distribution = await DatabaseService.getTypeDistribution()
        setTypeDistribution(distribution)
      } catch (error) {
        console.error('Failed to load type distribution:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getCategoryAnalysis = () => {
    const categoryData = categoryDefinitions[selectedCategory]
    const analysis: Array<{
      name: string
      data: CategoryData[string]
      count: number
      percentage: number
    }> = []

    const totalCount = typeDistribution.reduce((sum, item) => sum + item.count, 0)

    Object.entries(categoryData).forEach(([categoryName, categoryInfo]) => {
      const count = categoryInfo.types.reduce((sum, typeCode) => {
        const typeData = typeDistribution.find(item => item.type === typeCode)
        return sum + (typeData?.count || 0)
      }, 0)

      const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0

      analysis.push({
        name: categoryName,
        data: categoryInfo,
        count,
        percentage
      })
    })

    return analysis.sort((a, b) => b.count - a.count)
  }

  const categories: Array<{ id: AnalysisCategory; label: string; icon: string }> = [
    { id: 'temperament', label: '気質', icon: '🧠' },
    { id: 'thinking_style', label: '思考スタイル', icon: '💭' },
    { id: 'work_style', label: 'ワークスタイル', icon: '💼' },
    { id: 'communication', label: 'コミュニケーション', icon: '💬' }
  ]

  if (loading) {
    return (
      <div className="category-analysis loading">
        <div className="loading-spinner"></div>
        <p>データを読み込み中...</p>
      </div>
    )
  }

  const analysisData = getCategoryAnalysis()

  return (
    <div className="category-analysis">
      <div className="analysis-header">
        <h1 className="text-title-1">カテゴリ別分析</h1>
        <p className="analysis-description">
          性格タイプをさまざまな観点から分析します
        </p>
      </div>

      {/* カテゴリー選択 */}
      <div className="category-selector">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      {/* 分析結果 */}
      <div className="analysis-results">
        <div className="results-header">
          <h2 className="text-title-2">
            {categories.find(c => c.id === selectedCategory)?.icon}{' '}
            {categories.find(c => c.id === selectedCategory)?.label}別分析
          </h2>
        </div>

        <div className="category-cards">
          {analysisData.map((item, index) => {
            const maxCount = Math.max(...analysisData.map(d => d.count))
            const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0

            return (
              <div key={item.name} className="category-card">
                <div className="card-header">
                  <h3 className="category-name">{item.name}</h3>
                  <div className="category-stats">
                    <span className="count">{item.count}人</span>
                    <span className="percentage">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>

                <div className="category-description">
                  {item.data.description}
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="characteristics">
                  <h4>特徴:</h4>
                  <div className="characteristic-tags">
                    {item.data.characteristics.map((char, i) => (
                      <span key={i} className="characteristic-tag">
                        {char}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="type-list">
                  <h4>該当タイプ:</h4>
                  <div className="type-codes">
                    {item.data.types.map(typeCode => {
                      const persona = PERSONAS.find(p => p.code === typeCode)
                      const typeCount = typeDistribution.find(t => t.type === typeCode)?.count || 0
                      
                      return (
                        <div key={typeCode} className="type-item">
                          <span className="type-code">{typeCode}</span>
                          <span className="type-name">{persona?.name}</span>
                          <span className="type-count">({typeCount})</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .category-analysis {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .category-analysis.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .analysis-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .analysis-description {
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .category-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          overflow-x: auto;
          padding: 0.5rem;
        }

        .category-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: 2px solid var(--border);
          background: var(--surface);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 120px;
        }

        .category-button:hover {
          background: var(--surface-hover);
        }

        .category-button.active {
          border-color: var(--primary);
          background: var(--primary-light);
          color: var(--primary);
        }

        .category-icon {
          font-size: 1.5rem;
        }

        .category-label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .results-header {
          margin-bottom: 2rem;
        }

        .category-cards {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .category-card {
          background: var(--surface);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: var(--shadow-sm);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .category-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .category-stats {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .count {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary);
        }

        .percentage {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .category-description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .progress-bar {
          height: 8px;
          background: var(--surface-variant);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-dark));
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .characteristics {
          margin-bottom: 1.5rem;
        }

        .characteristics h4 {
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .characteristic-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .characteristic-tag {
          background: var(--surface-variant);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .type-list h4 {
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .type-codes {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .type-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          background: var(--surface-variant);
          border-radius: 8px;
        }

        .type-code {
          font-family: monospace;
          font-weight: 700;
          color: var(--primary);
          min-width: 30px;
        }

        .type-name {
          flex: 1;
          font-weight: 500;
        }

        .type-count {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .category-analysis {
            padding: 1rem;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .category-selector {
            flex-direction: column;
          }

          .category-button {
            flex-direction: row;
            justify-content: flex-start;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  )
}