import React from 'react'
import { useParams, Link } from 'react-router-dom'
import details from '../data/persona_details.json'
import type { PersonaDetailsMap } from '../types'
import { makeTypeAvatar } from '../utils/avatar'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TypeDetail(){
  const { code = '' } = useParams()
  const map = details as unknown as PersonaDetailsMap
  const d = map[code]
  if (!d) {
    return (
      <div className="app-layout">
        <Header showTitle={true} variant="frosted" />
        <main className="app-main">
          <div className="container">
            <div className="card">
              <div className="text-title-2">タイプが見つかりません</div>
              <div className="small" style={{marginTop:8}}>
                指定のコード: {code}
              </div>
              <div style={{marginTop:12}}><Link className="btn outline" to="/types">一覧へ戻る</Link></div>
            </div>
          </div>
        </main>
        <Footer showDetails={false} variant="default" />
      </div>
    )
  }
  const img = (d as any).image || makeTypeAvatar(code, d.color)
  return (
    <div className="app-layout">
      <Header showTitle={true} variant="frosted" />
      <main className="app-main">
        <div className="container">
          <div className="type-detail-container" style={{ ['--accent-color' as any]: d.color } as React.CSSProperties}>
            <div className="type-detail-header">
              <div className="header-navigation">
                <Link className="back-button" to="/types">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  一覧へ戻る
                </Link>
              </div>
              
              <div className="hero-section">
                <div className="hero-image">
                  <img src={img} alt={d.title} />
                  <div className="hero-overlay">
                    <span className="type-code-large">{code}</span>
                  </div>
                </div>
                <div className="hero-info">
                  <h1 className="type-title">{d.title}</h1>
                  <p className="type-tagline">{d.oneLiner}</p>
                  <div className="type-keywords-header">
                    {(d.keywords || []).slice(0, 3).map((keyword, i) => (
                      <span key={i} className="keyword-pill">{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="detail-content">
              <div className="content-grid">
                <div className="main-content">
                  <section className="detail-section">
                    <h2 className="section-title">概要</h2>
                    <p className="section-text">{d.summaryLong}</p>
                  </section>
                  
                  <section className="detail-section">
                    <h2 className="section-title">特徴</h2>
                    <ul className="feature-list">
                      {(d as any).overview?.traits?.map((t:string, i:number)=>(<li key={i}>{t}</li>)) || d.keywords.map((t,i)=>(<li key={i}>{t}</li>))}
                    </ul>
                  </section>
                  
                  <div className="strengths-growth">
                    <section className="detail-section">
                      <h2 className="section-title">強み</h2>
                      <ul className="feature-list positive">
                        {d.strengths.map((s,i)=>(<li key={i}>{s}</li>))}
                      </ul>
                    </section>
                    
                    <section className="detail-section">
                      <h2 className="section-title">成長の機会</h2>
                      <ul className="feature-list growth">
                        {d.growth.map((g,i)=>(<li key={i}>{g}</li>))}
                      </ul>
                    </section>
                  </div>
                  
                  {(d as any).overview?.tips?.length ? (
                    <section className="detail-section">
                      <h2 className="section-title">相性のコツ</h2>
                      <ul className="feature-list tips">
                        {(d as any).overview.tips.map((g:string,i:number)=>(<li key={i}>{g}</li>))}
                      </ul>
                    </section>
                  ) : null}
                </div>
                
                <div className="sidebar-content">
                  <div className="info-card">
                    <h3 className="info-title">おすすめ職種</h3>
                    <div className="career-tags">
                      {d.recommendedRoles.map((role, i) => (
                        <span key={i} className="career-tag">{role}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <h3 className="info-title">著名人</h3>
                    <div className="famous-list">
                      {d.famous.map((person, i) => (
                        <div key={i} className="famous-person">{person}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="info-card">
                    <h3 className="info-title">キーワード</h3>
                    <div className="keyword-tags">
                      {d.keywords.map((k,i)=>(<span key={i} className="keyword-tag">{k}</span>))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer showDetails={false} variant="default" />
    </div>
  )
}


