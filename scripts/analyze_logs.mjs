#!/usr/bin/env node
import fs from 'fs'

function parseCsvSections(text) {
  const lines = text.split(/\r?\n/)
  const header = 'ts,id,axis,version,weight,pick'
  const idxHeader = lines.findIndex(l => l.trim().startsWith(header))
  if (idxHeader === -1) throw new Error('answers header not found')
  const idxResultsHeader = lines.findIndex(l => l.trim().startsWith('results:'))
  const answerLines = lines.slice(idxHeader + 1, idxResultsHeader === -1 ? undefined : idxResultsHeader)
    .map(l => l.trim()).filter(Boolean)
  const resultsHeader = 'results: ts,primary,secondary,conf'
  const resultLines = idxResultsHeader === -1 ? [] : lines.slice(idxResultsHeader + 1)
    .filter(l => l.trim() && !l.startsWith('results:'))
  return { answerLines, resultLines }
}

function toNum(x) { const n = Number(x); return Number.isFinite(n) ? n : 0 }

function analyzeAnswers(answerLines, minN) {
  // fields: ts,id,axis,version,weight,pick
  const perQ = new Map() // id -> stats
  for (const l of answerLines) {
    const [ts, id, axis, version, weight, pick] = l.split(',')
    const qid = toNum(id)
    if (!perQ.has(qid)) perQ.set(qid, { id: qid, axis, version: toNum(version)||1, n:0, a:0, b:0, wSum:0 })
    const s = perQ.get(qid)
    s.n += 1
    s.wSum += Number(weight) || 1
    if (pick === 'A') s.a += 1
    else if (pick === 'B') s.b += 1
  }
  // compute derived
  for (const s of perQ.values()) {
    const pA = s.n ? s.a / s.n : 0
    const pB = 1 - pA
    // information score (Gini-based): 4*p*(1-p) ∈ [0,1]
    const info = 4 * pA * pB
    const skew = Math.abs(0.5 - pA) * 2 // 0..1
    // weight suggestion: base 1.0, bump when info高い＆サンプル十分
    let suggested = null
    if (s.n >= minN) {
      const raw = 1 + (info - 0.5) * 0.6 // info=0.5→1.0, info=1→1.3, info=0→0.7
      suggested = Math.max(0.75, Math.min(1.5, Math.round(raw * 100) / 100))
    }
    s.pA = +(pA.toFixed(3))
    s.info = +(info.toFixed(3))
    s.skew = +(skew.toFixed(3))
    s.weightSuggested = suggested
    s.weightAvg = +(s.wSum / Math.max(1, s.n)).toFixed(2)
  }
  return Array.from(perQ.values())
}

function analyzeResults(resultLines) {
  // fields: ts,primary,secondary,conf
  const rows = resultLines.map(l => {
    const [ts, primary, secondary, conf] = l.split(',')
    return { ts: toNum(ts), primary, secondary, conf: Number(conf)||0 }
  })
  const n = rows.length
  const avgConf = n ? rows.reduce((a,r)=>a+r.conf,0)/n : 0
  return { n, avgConf: +avgConf.toFixed(3) }
}

function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: node scripts/analyze_logs.mjs <path/to/personality_logs.csv> [minN]')
    process.exit(1)
  }
  const minN = Number(process.env.MIN_N || process.argv[3] || 20)
  const text = fs.readFileSync(file, 'utf8')
  const { answerLines, resultLines } = parseCsvSections(text)
  const answers = analyzeAnswers(answerLines, minN)
  const results = analyzeResults(resultLines)

  // sort by info desc, then by sample size
  answers.sort((a,b)=> (b.info - a.info) || (b.n - a.n))

  console.log('Overall results:', results)
  console.log(`minN for suggestions: ${minN}`)
  console.log('\nPer-question summary (top 20 by info):')
  console.log('id\taxis\tver\tn\tpA\tinfo\tskew\tweight(avg→suggest)')
  for (const s of answers.slice(0,20)) {
    console.log(`${s.id}\t${s.axis}\t${s.version}\t${s.n}\t${s.pA}\t${s.info}\t${s.skew}\t${s.weightAvg}→${s.weightSuggested ?? '-'}`)
  }

  const suggestions = answers.filter(s => s.weightSuggested != null)
    .map(s => ({ id: s.id, axis: s.axis, version: s.version, suggested: s.weightSuggested }))
  const outPath = 'weight_suggestions.json'
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results, suggestions }, null, 2))
  console.log(`\nSaved suggestions → ${outPath}`)
}

main()


