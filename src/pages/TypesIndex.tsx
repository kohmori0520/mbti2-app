import React from 'react'
import details from '../data/persona_details.json'
import type { PersonaDetailsMap } from '../types'
import { Link } from 'react-router-dom'
import { makeTypeAvatar } from '../utils/avatar'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TypesIndex(){
  const map = details as unknown as PersonaDetailsMap
  const entries = Object.entries(map).sort(([a],[b])=>a.localeCompare(b))
  return (
    <div className="app-layout">
      <Header showTitle={true} variant="frosted" />
      <main className="app-main">
        <div className="container">
          <div className="types-header">
            <div className="header-content">
              <h1 className="types-title">タイプ辞典</h1>
              <p className="types-subtitle">
                16の性格タイプを探索し、自分や他人をより深く理解しましょう
              </p>
            </div>
          </div>
          
          <div className="types-grid-container">
            <div className="types-grid">
              {entries.map(([code, d])=>{
                const img = (d as any).image || makeTypeAvatar(code, d.color)
                return (
                  <Link 
                    key={code} 
                    to={`/types/${code}`} 
                    className="type-card-modern"
                    style={{
                      '--accent-color': d.color
                    } as React.CSSProperties}
                  >
                    <div className="type-card-image">
                      <img src={img} alt={d.title} />
                      <div className="type-card-overlay">
                        <span className="type-code">{code}</span>
                      </div>
                    </div>
                    <div className="type-card-content">
                      <h3 className="type-card-title">{d.title}</h3>
                      <p className="type-card-description">{d.oneLiner}</p>
                      <div className="type-card-keywords">
                        {(d.keywords || []).slice(0, 2).map((keyword, i) => (
                          <span key={i} className="keyword-chip">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    <div className="type-card-arrow">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer showDetails={false} variant="default" />
    </div>
  )
}


