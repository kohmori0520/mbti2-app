import React from 'react'
import type { Axes, Persona } from '../logic/scoring'
import type { PersonaDetailsMap, AiInsight } from '../types'
import details from '../data/persona_details.json'
import { Link } from 'react-router-dom'
import { makeTypeAvatar } from '../utils/avatar'
import DetailedInsights from './DetailedInsights'

export default function ResultView({ persona, axes, secondary, conf } : { persona: Persona, axes: Axes, secondary?: Persona, conf?: number }) {
  const map = details as unknown as PersonaDetailsMap
  const detail = map[persona.code]
  const [ai, setAi] = React.useState<AiInsight | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let abort = false
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        setAi(null)
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaCode: persona.code, axes, secondaryCode: secondary?.code })
        })
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        if (!abort) setAi(data as AiInsight)
      } catch (e: any) {
        if (!abort) setError(e?.message ?? 'error')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    run()
    return () => { abort = true }
  }, [persona.code])
  const accent = detail?.color
  const heroImg = (detail as any)?.image || (accent ? makeTypeAvatar(persona.code, accent) : null)
  return (
    <div className="card" style={accent ? ({ ['--color-accent' as any]: accent } as React.CSSProperties) : undefined}>
      <div className="text-caption">結果</div>
      <h2 className="text-title-2" style={{marginBottom: 4}}>{detail?.title ?? persona.name}</h2>
      <div className="small" style={{marginBottom: 8, color: 'var(--color-text-secondary)'}}>{detail?.oneLiner ?? persona.summary}</div>
      {secondary && <div className="small" style={{marginBottom: 12}}>サブタイプ：{secondary.name}</div>}

      {heroImg && (
        <div style={{border:'1px solid rgba(0,0,0,0.08)', borderRadius:12, overflow:'hidden', background:'#f5f5f7', marginBottom:12}}>
          <img src={heroImg} alt={detail?.title ?? persona.name} style={{width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block'}}/>
        </div>
      )}

      {detail?.keywords?.length ? (
        <div className="chips">
          {detail.keywords.map((k, i) => (
            <span key={i} className="chip">{k}</span>
          ))}
        </div>
      ) : null}

      <div className="result-grid">
        <div>
          <div className="text-headline accent">プロフィール</div>
          <p className="text-body" style={{marginTop: 0}}>{detail?.summaryLong ?? persona.summary}</p>
          {typeof conf === 'number' && (
            <div style={{marginTop: 8}}>
              <div className="small" style={{marginBottom:6}}>信頼度 {conf.toFixed(2)}</div>
              <div className="progress"><div style={{ width: `${Math.round(Math.max(0, Math.min(1, conf))*100)}%` }} /></div>
            </div>
          )}
          <div className="text-headline accent" style={{marginTop: 8}}>スコア概要</div>
          <div className="axes-grid" style={{marginTop: 8}}>
            <AxisBar name="行動" value={axes.behavior} accent={accent} />
            <AxisBar name="意思" value={axes.decision} accent={accent} />
            <AxisBar name="対人" value={axes.relation} accent={accent} />
            <AxisBar name="価値" value={axes.value} accent={accent} />
          </div>
        </div>
        <div>
          <div className="text-headline accent">特性</div>
          <ul className="small" style={{marginTop: 0}}>
            {(detail?.strengths ?? []).map((s, i) => (<li key={i}>{s}</li>))}
          </ul>
          <div className="text-headline accent">伸びしろ</div>
          <ul className="small" style={{marginTop: 0}}>
            {(detail?.growth ?? []).map((g, i) => (<li key={i}>{g}</li>))}
          </ul>
        </div>
      </div>

      <hr />
      <div className="small" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div>
          <div className="text-headline accent">向いているロール</div>
          <div>{(detail?.recommendedRoles ?? []).join(' / ')}</div>
        </div>
        <div>
          <div className="text-headline accent">参考になる人物</div>
          <div>{(detail?.famous ?? []).join(' / ')}</div>
        </div>
      </div>

      {/* 信頼度はApp側で計算済みなので、location.state等に載せるのが理想だが、簡易にlocalStorageから割合を示す等も可能。ここでは省略。 */}

      <hr />
      <div>
        <div className="text-headline accent" style={{display:'flex', alignItems:'center', gap:8}}>
          <span>AI解析</span>
          <button className="btn outline" disabled={loading} onClick={()=>{
            if (loading) return
            setAi(null); setError(null); setLoading(true);
            fetch('/api/analyze', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ personaCode: persona.code, axes, secondaryCode: secondary?.code })
            }).then(r=>r.json()).then(d=>setAi(d as AiInsight)).catch(()=>setError('取得に失敗しました')).finally(()=>setLoading(false))
          }}>{loading ? '生成中…' : '再生成'}</button>
        </div>
        {loading && <div className="small">生成中…</div>}
        {error && <div className="small" style={{color:'#FF3B30'}}>エラー: {error}</div>}
        {ai && (
          <div className="text-body" style={{marginTop: 8}}>
            <div style={{marginBottom:8, color:'var(--color-text-secondary)'}}>{ai.oneLiner}</div>
            <p style={{marginTop:0}}>{ai.summaryLong}</p>
            <div className="ai-grid">
              <div>
                <div className="text-headline">AI推定: 強み</div>
                <ul className="small" style={{marginTop:0}}>{ai.strengths.map((s,i)=>(<li key={i}>{s}</li>))}</ul>
              </div>
              <div>
                <div className="text-headline">AI推定: 伸びしろ</div>
                <ul className="small" style={{marginTop:0}}>{ai.growth.map((g,i)=>(<li key={i}>{g}</li>))}</ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr />
      <p className="small">※ プロトタイプの推定です。精度は今後の学習で改善されます。</p>
      <div className="result-actions" style={{marginTop:8}}>
        <Link className="btn outline" to={`/types/${persona.code}`}>このタイプの詳細を見る</Link>
        <Link className="btn outline" to="/types">タイプ辞典へ</Link>
      </div>

      {/* 詳細解説セクション */}
      <hr />
      <DetailedInsights typeCode={persona.code} />
      <div className="result-actions" style={{marginTop: 16}}>
        <a className="btn outline" href="#" onClick={(e)=>{e.preventDefault();
          try {
            localStorage.removeItem('answers')
            // ログは任意で保持/削除。完全リセットにする
            localStorage.removeItem('answerLogs')
            localStorage.removeItem('resultLogs')
          } catch {}
          location.href = location.origin
        }}>もう一度</a>
        <a className="btn primary" href="#" onClick={(e)=>{e.preventDefault();
          const text = `私は${detail?.title ?? persona.name}でした！\n${location.href}`
          if (navigator.share) { navigator.share({ title: '診断結果', text }).catch(()=>{}) }
          else { navigator.clipboard?.writeText(text).catch(()=>{}); alert('結果をコピーしました') }
        }}>結果をシェア</a>
        <a className="btn outline" href="#" onClick={(e)=>{
          e.preventDefault()
          try {
            const logs = JSON.parse(localStorage.getItem('answerLogs') || '[]')
            const results = JSON.parse(localStorage.getItem('resultLogs') || '[]')
            const csv = toCsv(logs, results)
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'personality_logs.csv'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          } catch {}
        }}>ログをCSVで保存</a>
      </div>
      <style>{`
        .result-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; }
        .axes-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .result-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        @media (max-width: 640px) {
          .result-grid { grid-template-columns: 1fr; }
          .axes-grid { grid-template-columns: 1fr 1fr; }
          .ai-grid { grid-template-columns: 1fr; }
          .result-actions { flex-direction: column; }
          .result-actions .btn { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  )
}

function AxisBar({ name, value, accent }:{ name: string, value: number, accent?: string }){
  const pct = (Math.max(-7, Math.min(7, value)) + 7) / 14 * 100
  return (
    <div>
      <div className="small" style={{marginBottom:6}}>{name}</div>
      <div className="progress">
        <div style={{ width: `${pct}%`, background: accent || undefined }} />
      </div>
    </div>
  )
}

function toCsv(answerLogs: any[], resultLogs: any[]) {
  const header = 'ts,id,axis,version,weight,pick\n'
  const rows = (answerLogs || []).map(l=>[l.ts,l.id,l.axis,l.version,l.weight,l.pick].join(','))
  const header2 = '\n\nresults: ts,primary,secondary,conf\n'
  const rows2 = (resultLogs || []).map(l=>[l.ts,l.primary,l.secondary,l.conf].join(','))
  return header + rows.join('\n') + header2 + rows2.join('\n')
}
