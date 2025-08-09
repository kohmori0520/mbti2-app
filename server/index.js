import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import rateLimit from 'express-rate-limit'

const app = express()
app.use(cors())
app.use(express.json())
// 簡易レート制限
app.use('/api/', rateLimit({ windowMs: 60_000, max: 60 }))

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// 簡易キャッシュ（プロセス内） + TTL
const cache = new Map()
const CACHE_TTL_MS = Number(process.env.ANALYZE_CACHE_TTL_MS || 60 * 60 * 1000) // 1h

function getCache(key) {
  const v = cache.get(key)
  if (!v) return null
  if (Date.now() > v.expires) { cache.delete(key); return null }
  return v.data
}

function setCache(key, data) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS })
}

async function fetchOpenAIWithRetry(body, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions'
  const attempts = Number(process.env.ANALYZE_RETRY_ATTEMPTS || 3)
  const timeoutMs = Number(process.env.ANALYZE_TIMEOUT_MS || 15000)
  let lastErr
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal
      })
      clearTimeout(timeout)
      if (r.ok) return r
      const t = await r.text()
      lastErr = new Error(`upstream ${r.status}: ${t}`)
    } catch (e) {
      lastErr = e
    } finally {
      clearTimeout(timeout)
    }
    if (i < attempts - 1) {
      const backoff = 500 * Math.pow(2, i)
      await new Promise(res => setTimeout(res, backoff))
    }
  }
  throw lastErr
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { personaCode, axes, secondaryCode } = req.body || {}
    if (!personaCode || !axes) {
      return res.status(400).json({ error: 'invalid request' })
    }
    const key = JSON.stringify({ personaCode, axes, secondaryCode })
    const cached = getCache(key)
    if (cached) return res.json(cached)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(501).json({ error: 'OPENAI_API_KEY not configured' })
    }

    // プロンプト（JSONのみ出力）
    const sys = 'あなたはユーザーの性格傾向を簡潔に要約するアナリストです。出力は必ずJSONのみで、日本語で書いてください。'
    const schema = {
      oneLiner: 'string',
      summaryLong: 'string',
      strengths: ['string'],
      growth: ['string'],
      collaborationTips: ['string'],
      recommendedRoles: ['string'],
      keywords: ['string']
    }
    const user = {
      personaCode,
      axes, // {behavior,decision,relation,value}
      secondaryCode,
      rules: '300-500字。重複表現を避け、実務で使える行動例を含める。トーンは端的で丁寧。'
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `以下の入力を基に、次のスキーマに完全一致するJSONのみを返してください。前後のテキストは一切禁止です。\nSchema: ${JSON.stringify(schema)}\nInput: ${JSON.stringify(user)}` }
      ],
      temperature: 0.5,
      max_tokens: 600
    }

    // タイムアウト付きfetch
    const r = await fetchOpenAIWithRetry(body, apiKey)
    if (!r.ok) {
      const t = await r.text()
      return res.status(502).json({ error: 'upstream_error', detail: t })
    }
    const data = await r.json()
    const txt = data.choices?.[0]?.message?.content || '{}'
    // JSON抽出（万一テキストが混ざっても{}で囲まれた最初の部分を取る）
    const match = txt.match(/\{[\s\S]*\}/)
    const json = match ? JSON.parse(match[0]) : JSON.parse(txt)
    setCache(key, json)
    res.json(json)
  } catch (e) {
    res.status(500).json({ error: 'internal_error', detail: String(e?.message || e) })
  }
})

const port = process.env.PORT || 8787
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})


