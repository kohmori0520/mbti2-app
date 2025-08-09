import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// ヘルスチェック
app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// ダミー解析（まずは雛形）。本番はOpenAI等を呼ぶ
app.post('/api/analyze', (req, res) => {
  const { personaCode, axes, secondaryCode } = req.body || {}
  if (!personaCode || !axes) {
    return res.status(400).json({ error: 'invalid request' })
  }
  const mock = {
    oneLiner: 'AI解析（ダミー）: あなたの強みは一貫性と推進力です。',
    summaryLong: 'このセクションはバックエンドでLLMにより生成されます。まずは雛形のJSONを返しています。',
    strengths: ['実行力', '一貫性', '学習意欲'],
    growth: ['振り返り習慣の強化', 'リスクの見える化'],
    collaborationTips: ['役割分担を明確に', '意思決定の基準を共有'],
    recommendedRoles: ['PM', 'BizDev'],
    keywords: ['推進', '設計', '検証']
  }
  res.json(mock)
})

const port = process.env.PORT || 8787
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})


