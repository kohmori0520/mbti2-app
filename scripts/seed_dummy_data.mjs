#!/usr/bin/env node
// ローカル開発用のダミーデータを投入
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.development.local' })

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

// 使用可能なタイプ
const PERSONA_CODES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

// 軸の定義
const AXES = ['EI', 'SN', 'TF', 'JP']

// ランダム要素生成関数
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomFloat = (min, max) => Math.random() * (max - min) + min
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomBool = () => Math.random() > 0.5

// User Agentのサンプル
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0'
]

const REFERRERS = [
  'https://google.com/search',
  'https://twitter.com',
  'https://facebook.com',
  'https://linkedin.com',
  'direct',
  null
]

const UTM_SOURCES = [
  'google',
  'twitter',
  'facebook',
  'linkedin',
  'email',
  'direct',
  null
]

// 過去30日間のランダムなタイムスタンプ生成
const randomTimestamp = () => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
  const randomTime = new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()))
  return randomTime.toISOString()
}

// 軸スコア生成（-1〜1の範囲で、タイプに応じて調整）
const generateAxesScores = (personaCode) => {
  const scores = {}
  const letters = personaCode.split('')
  
  // E/I
  scores.EI = letters[0] === 'E' ? randomFloat(0.1, 0.9) : randomFloat(-0.9, -0.1)
  // S/N  
  scores.SN = letters[1] === 'S' ? randomFloat(-0.9, -0.1) : randomFloat(0.1, 0.9)
  // T/F
  scores.TF = letters[2] === 'T' ? randomFloat(0.1, 0.9) : randomFloat(-0.9, -0.1)
  // J/P
  scores.JP = letters[3] === 'J' ? randomFloat(0.1, 0.9) : randomFloat(-0.9, -0.1)
  
  return scores
}

// 質問数（実際の質問数に合わせて調整）
const TOTAL_QUESTIONS = 48

async function generateDummySessions() {
  console.log('Generating dummy sessions...')
  
  const sessions = []
  const answers = []
  const results = []
  
  // 100セッション生成
  for (let i = 0; i < 100; i++) {
    const sessionTimestamp = randomTimestamp()
    const completionTime = randomInt(120000, 300000) // 2-5分
    
    // セッション作成
    const sessionId = randomUUID()
    const session = {
      id: sessionId,
      user_agent: randomChoice(USER_AGENTS),
      created_at: sessionTimestamp,
      completed_at: new Date(new Date(sessionTimestamp).getTime() + completionTime).toISOString(),
      completed_ms: completionTime,
      referrer: randomChoice(REFERRERS),
      utm_source: randomChoice(UTM_SOURCES),
      utm_medium: randomBool() ? randomChoice(['cpc', 'social', 'email', 'organic']) : null,
      utm_campaign: randomBool() ? `campaign-${randomInt(1, 10)}` : null,
      locale: randomChoice(['ja', 'ja-JP', 'en-US']),
      device_type: randomChoice(['desktop', 'mobile', 'tablet'])
    }
    sessions.push(session)
    
    // ランダムなタイプを選択
    const primaryType = randomChoice(PERSONA_CODES)
    const secondaryType = randomChoice(PERSONA_CODES.filter(c => c !== primaryType))
    
    // 軸スコア生成
    const axesScores = generateAxesScores(primaryType)
    
    // 回答生成（全質問に回答したと仮定）
    for (let qId = 1; qId <= TOTAL_QUESTIONS; qId++) {
      const axis = AXES[Math.floor((qId - 1) / 12)] // 12問ずつ各軸に対応
      const answerChoice = randomChoice(['A', 'B'])
      const latency = randomInt(800, 5000) // 0.8-5秒の思考時間
      
      answers.push({
        id: randomUUID(),
        session_id: sessionId,
        question_id: qId,
        answer: answerChoice,
        axis: axis,
        weight: randomFloat(0.8, 1.2),
        version: 1,
        timestamp: new Date(new Date(sessionTimestamp).getTime() + (qId * randomInt(2000, 8000))).toISOString(),
        latency_ms: latency
      })
    }
    
    // 結果生成
    const confidence = randomFloat(0.7, 0.95)
    results.push({
      id: randomUUID(),
      session_id: sessionId,
      primary_type: primaryType,
      secondary_type: secondaryType,
      confidence: confidence,
      axes_scores: axesScores,
      timestamp: session.completed_at
    })
    
    if ((i + 1) % 20 === 0) {
      console.log(`Generated ${i + 1}/100 sessions...`)
    }
  }
  
  return { sessions, answers, results }
}

async function insertDummyData() {
  try {
    console.log('🎭 Generating dummy data for local development...')
    
    const { sessions, answers, results } = await generateDummySessions()
    
    console.log('📝 Inserting sessions...')
    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert(sessions, { onConflict: 'id' })
    
    if (sessionError) throw sessionError
    console.log(`✅ Inserted ${sessions.length} sessions`)
    
    console.log('📊 Inserting answers...')
    // 回答データを分割して挿入（大量データのため）
    const chunkSize = 500
    for (let i = 0; i < answers.length; i += chunkSize) {
      const chunk = answers.slice(i, i + chunkSize)
      const { error: answerError } = await supabase
        .from('answers')
        .upsert(chunk, { onConflict: 'id' })
      
      if (answerError) throw answerError
      console.log(`✅ Inserted answers ${i + 1}-${Math.min(i + chunkSize, answers.length)}/${answers.length}`)
    }
    
    console.log('🎯 Inserting results...')
    const { error: resultError } = await supabase
      .from('results')
      .upsert(results, { onConflict: 'id' })
    
    if (resultError) throw resultError
    console.log(`✅ Inserted ${results.length} results`)
    
    console.log('📈 Verifying data...')
    const { data: sessionCount } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
    
    const { data: answerCount } = await supabase
      .from('answers')
      .select('id', { count: 'exact', head: true })
    
    const { data: resultCount } = await supabase
      .from('results')
      .select('id', { count: 'exact', head: true })
    
    console.log('🎉 Dummy data insertion completed!')
    console.log(`📊 Summary:`)
    console.log(`   Sessions: ${sessionCount?.count || 0}`)
    console.log(`   Answers: ${answerCount?.count || 0}`)
    console.log(`   Results: ${resultCount?.count || 0}`)
    console.log('')
    console.log('🔗 View data at: http://127.0.0.1:54323')
    console.log('📈 Test analytics at: http://localhost:5175/analytics')
    
  } catch (error) {
    console.error('❌ Failed to insert dummy data:', error)
    process.exit(1)
  }
}

// メイン実行
insertDummyData()