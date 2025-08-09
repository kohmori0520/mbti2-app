import React from 'react'
import details from '../data/persona_details.json'
import type { PersonaDetailsMap } from '../types'
import { Link } from 'react-router-dom'
import { makeTypeAvatar } from '../utils/avatar'

export default function TypesIndex(){
  const map = details as unknown as PersonaDetailsMap
  const entries = Object.entries(map).sort(([a],[b])=>a.localeCompare(b))
  return (
    <div className="container">
      <div className="card">
        <h2 className="text-title-2" style={{marginBottom:12}}>タイプ辞典</h2>
        <div className="small" style={{marginBottom:16}}>全タイプの概要を一覧できます。カードをクリックすると詳細へ。</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:12}}>
          {entries.map(([code, d])=>{
            const img = (d as any).image || makeTypeAvatar(code, d.color)
            return (
              <Link key={code} to={`/types/${code}`} className="card" style={{padding:12, textDecoration:'none'}}>
                <div style={{border:'1px solid rgba(0,0,0,0.08)', borderRadius:12, overflow:'hidden', background:'#f5f5f7'}}>
                  <img src={img} alt={d.title} style={{width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block'}}/>
                </div>
                <div className="text-body" style={{marginTop:8}}>{d.title}</div>
                <div className="small" style={{color:'var(--color-text-secondary)'}}>{d.oneLiner}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}


