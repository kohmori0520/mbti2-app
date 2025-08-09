#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')) }
function writeJson(p,o){ fs.writeFileSync(p, JSON.stringify(o, null, 2)+'\n') }

function main(){
  const suggestionsPath = process.argv[2] || 'weight_suggestions.json'
  const questionsPath = process.argv[3] || 'src/data/personality_questions.json'
  if(!fs.existsSync(suggestionsPath)){
    console.error(`Suggestions not found: ${suggestionsPath}`)
    process.exit(1)
  }
  if(!fs.existsSync(questionsPath)){
    console.error(`Questions not found: ${questionsPath}`)
    process.exit(1)
  }
  const { suggestions } = readJson(suggestionsPath)
  if(!Array.isArray(suggestions) || suggestions.length===0){
    console.error('No suggestions to apply')
    process.exit(1)
  }
  const questions = readJson(questionsPath)
  const byId = new Map(suggestions.map(s=>[Number(s.id), s]))

  let updated = 0
  for(const q of questions){
    const s = byId.get(Number(q.id))
    if(!s) continue
    // 軸やversionがある場合は一致を軽く確認
    if(s.axis && q.axis && s.axis !== q.axis) continue
    if(s.version && q.version && Number(s.version) !== Number(q.version)) continue
    const val = Number(s.suggested)
    if(!Number.isFinite(val)) continue
    // option.weight は尊重。question.weight のみ更新
    q.weight = Math.max(0.5, Math.min(2.0, Math.round(val*100)/100))
    updated++
  }

  // バックアップ
  const dir = path.dirname(questionsPath)
  const base = path.basename(questionsPath, '.json')
  const backup = path.join(dir, `${base}.backup.${Date.now()}.json`)
  writeJson(backup, questions)
  // 本体書き込み
  writeJson(questionsPath, questions)
  console.log(`Applied ${updated} suggestion(s). Backup saved to: ${backup}`)
}

main()


