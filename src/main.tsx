import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
const TypesIndex = lazy(() => import('./pages/TypesIndex'))
const TypeDetail = lazy(() => import('./pages/TypeDetail'))
const Analytics = lazy(() => import('./pages/Analytics'))
import './styles.css'
import { z } from 'zod'
import q from './data/personality_questions.json'
import d from './data/persona_details.json'

// 開発時のみ: JSONスキーマ簡易検証（エラーはconsoleに出すだけ）
if (import.meta.env.DEV) {
  const Option = z.object({
    key: z.union([z.literal('A'), z.literal('B')]),
    label: z.string(),
    score: z.record(z.string(), z.number()),
    weight: z.number().optional()
  })
  const Question = z.object({
    id: z.number(), axis: z.union([z.literal('behavior'), z.literal('decision'), z.literal('relation'), z.literal('value')]),
    question: z.string(), version: z.number().optional(), weight: z.number().optional(),
    options: z.array(Option).length(2)
  })
  const Questions = z.array(Question)
  const Detail = z.object({
    title: z.string(), oneLiner: z.string(), summaryLong: z.string(), color: z.string(),
    strengths: z.array(z.string()), growth: z.array(z.string()), keywords: z.array(z.string()),
    recommendedRoles: z.array(z.string()), famous: z.array(z.string())
  }).passthrough()
  const DetailsMap = z.record(z.string(), Detail)
  const resultQ = Questions.safeParse(q as unknown)
  const resultD = DetailsMap.safeParse(d as unknown)
  if (!resultQ.success) console.warn('[schema] personality_questions.json invalid:', JSON.stringify(resultQ.error.format(), null, 2))
  if (!resultD.success) console.warn('[schema] persona_details.json invalid:', JSON.stringify(resultD.error.format(), null, 2))
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <BrowserRouter>
    <Suspense fallback={<div className="container">Loading...</div>}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/types" element={<TypesIndex />} />
        <Route path="/types/:code" element={<TypeDetail />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)
