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

// 簡易キャッシュ（プロセス内）
const cache = new Map()

app.post('/api/analyze', async (req, res) => {
  try {
    const { personaCode, axes, secondaryCode } = req.body || {}
    if (!personaCode || !axes) {
      return res.status(400).json({ error: 'invalid request' })
    }
    const key = JSON.stringify({ personaCode, axes, secondaryCode })
    if (cache.has(key)) return res.json(cache.get(key))

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
    const controller = new AbortController()
    const timeout = setTimeout(()=>controller.abort(), 15_000)
    let r
    try {
      r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal
      })
    } finally {
      clearTimeout(timeout)
    }
    if (!r.ok) {
      const t = await r.text()
      return res.status(502).json({ error: 'upstream_error', detail: t })
    }
    const data = await r.json()
    const txt = data.choices?.[0]?.message?.content || '{}'
    // JSON抽出（万一テキストが混ざっても{}で囲まれた最初の部分を取る）
    const match = txt.match(/\{[\s\S]*\}/)
    const json = match ? JSON.parse(match[0]) : JSON.parse(txt)
    cache.set(key, json)
    res.json(json)
  } catch (e) {
    res.status(500).json({ error: 'internal_error', detail: String(e?.message || e) })
  }
})

const port = process.env.PORT || 8787
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})


