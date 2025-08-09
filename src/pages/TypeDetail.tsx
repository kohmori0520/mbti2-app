import React from 'react'
import { useParams, Link } from 'react-router-dom'
import details from '../data/persona_details.json'
import type { PersonaDetailsMap } from '../types'
import { makeTypeAvatar } from '../utils/avatar'

export default function TypeDetail(){
  const { code = '' } = useParams()
  const map = details as unknown as PersonaDetailsMap
  const d = map[code]
  if (!d) {
    return (
      <div className="container">
        <div className="card">
          <div className="text-title-2">タイプが見つかりません</div>
          <div className="small" style={{marginTop:8}}>
            指定のコード: {code}
          </div>
          <div style={{marginTop:12}}><Link className="btn outline" to="/types">一覧へ戻る</Link></div>
        </div>
      </div>
    )
  }
  const img = (d as any).image || makeTypeAvatar(code, d.color)
  return (
    <div className="container">
      <div className="card" style={{ ['--color-accent' as any]: d.color } as React.CSSProperties}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <h2 className="text-title-2" style={{margin:0}}>{d.title}</h2>
          <Link className="btn outline" to="/types">一覧へ</Link>
        </div>
        <div className="small" style={{color:'var(--color-text-secondary)', marginTop:4}}>{d.oneLiner}</div>
        <div style={{border:'1px solid rgba(0,0,0,0.08)', borderRadius:12, overflow:'hidden', background:'#f5f5f7', marginTop:12}}>
          <img src={img} alt={d.title} style={{width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block'}}/>
        </div>

        <div className="text-headline accent" style={{marginTop:12}}>概要</div>
        <p className="text-body" style={{marginTop:0}}>{d.summaryLong}</p>

        <div className="text-headline accent">特徴</div>
        <ul className="small" style={{marginTop:0}}>
          {(d as any).overview?.traits?.map((t:string, i:number)=>(<li key={i}>{t}</li>)) || d.keywords.map((t,i)=>(<li key={i}>{t}</li>))}
        </ul>

        <div className="text-headline accent">強み</div>
        <ul className="small" style={{marginTop:0}}>
          {d.strengths.map((s,i)=>(<li key={i}>{s}</li>))}
        </ul>

        <div className="text-headline accent">伸びしろ</div>
        <ul className="small" style={{marginTop:0}}>
          {d.growth.map((g,i)=>(<li key={i}>{g}</li>))}
        </ul>

        {(d as any).overview?.tips?.length ? (
          <>
            <div className="text-headline accent">相性のコツ</div>
            <ul className="small" style={{marginTop:0}}>
              {(d as any).overview.tips.map((g:string,i:number)=>(<li key={i}>{g}</li>))}
            </ul>
          </>
        ) : null}

        <div className="text-headline accent">おすすめ職種</div>
        <div className="small">{d.recommendedRoles.join(' / ')}</div>

        <div className="text-headline accent">キーワード</div>
        <div className="chips">
          {d.keywords.map((k,i)=>(<span key={i} className="chip">{k}</span>))}
        </div>

        <div className="text-headline accent">著名人</div>
        <div className="small">{d.famous.join(' / ')}</div>
      </div>
    </div>
  )
}


