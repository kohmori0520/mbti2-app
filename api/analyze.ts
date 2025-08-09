// Vercel Serverless Function: /api/analyze
const CACHE_TTL_MS = Number(process.env.ANALYZE_CACHE_TTL_MS || 60 * 60 * 1000) // 1h
const RETRY_ATTEMPTS = Number(process.env.ANALYZE_RETRY_ATTEMPTS || 3)
const TIMEOUT_MS = Number(process.env.ANALYZE_TIMEOUT_MS || 15000)

const cache = new Map<string, { data: any; expires: number }>()

function getCache(key: string) {
  const v = cache.get(key)
  if (!v) return null
  if (Date.now() > v.expires) { cache.delete(key); return null }
  return v.data
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS })
}

async function fetchOpenAIWithRetry(body: unknown, apiKey: string) {
  const url = 'https://api.openai.com/v1/chat/completions'
  let lastErr: any
  for (let i = 0; i < RETRY_ATTEMPTS; i++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
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
    if (i < RETRY_ATTEMPTS - 1) {
      const backoff = 500 * Math.pow(2, i)
      await new Promise(res => setTimeout(res, backoff))
    }
  }
  throw lastErr
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  try {
    const { personaCode, axes, secondaryCode } = req.body || {}
    if (!personaCode || !axes) return res.status(400).json({ error: 'invalid request' })

    const key = JSON.stringify({ personaCode, axes, secondaryCode })
    const cached = getCache(key)
    if (cached) return res.status(200).json(cached)

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return res.status(501).json({ error: 'OPENAI_API_KEY not configured' })

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
      axes,
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

    const r = await fetchOpenAIWithRetry(body, apiKey)
    const data = await r.json()
    const txt = data.choices?.[0]?.message?.content || '{}'
    const match = (txt as string).match(/\{[\s\S]*\}/)
    const json = match ? JSON.parse(match[0]) : JSON.parse(txt)
    setCache(key, json)
    res.status(200).json(json)
  } catch (e: any) {
    res.status(500).json({ error: 'internal_error', detail: String(e?.message || e) })
  }
}


