#!/usr/bin/env node
// Seed personas/career/relationships from JSON into Supabase content tables
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function loadJson(relPath) {
  const abs = path.resolve(projectRoot, relPath)
  const txt = await readFile(abs, 'utf8')
  return JSON.parse(txt)
}

async function upsertPersonas() {
  const details = await loadJson('../src/data/persona_details.json')
  // personas
  const personas = Object.entries(details).map(([code, d]) => ({
    code,
    title: d.title,
    one_liner: d.oneLiner,
    summary_long: d.summaryLong,
    color: d.color,
    image: d.image || null
  }))
  if (personas.length) {
    const { error } = await supabase.from('personas').upsert(personas, { onConflict: 'code' })
    if (error) throw error
  }
  // keywords/strengths/growth
  const keywords = []
  const strengths = []
  const growth = []
  for (const [code, d] of Object.entries(details)) {
    for (const k of d.keywords || []) keywords.push({ code, keyword: k })
    for (const s of d.strengths || []) strengths.push({ code, strength: s })
    for (const g of d.growth || []) growth.push({ code, growth: g })
  }
  if (keywords.length) {
    const { error } = await supabase.from('persona_keywords').upsert(keywords, { onConflict: 'code,keyword' })
    if (error) throw error
  }
  if (strengths.length) {
    const { error } = await supabase.from('persona_strengths').upsert(strengths, { onConflict: 'code,strength' })
    if (error) throw error
  }
  if (growth.length) {
    const { error } = await supabase.from('persona_growth').upsert(growth, { onConflict: 'code,growth' })
    if (error) throw error
  }
}

async function upsertCareer() {
  const career = await loadJson('../src/data/career_guidance.json')
  const careerRows = []
  const roles = []
  const growths = []
  const metrics = []
  for (const [code, c] of Object.entries(career.career_paths || {})) {
    const env = c.work_environment || {}
    careerRows.push({
      code,
      work_env_best: env.best || null,
      work_env_avoid: env.avoid || null,
      work_env_culture: env.culture || null
    })
    for (const r of c.ideal_roles || []) roles.push({ code, role: r })
    for (const g of c.growth_opportunities || []) growths.push({ code, item: g })
    for (const m of c.success_metrics || []) metrics.push({ code, metric: m })
  }
  if (careerRows.length) {
    const { error } = await supabase.from('career').upsert(careerRows, { onConflict: 'code' })
    if (error) throw error
  }
  if (roles.length) {
    const { error } = await supabase.from('career_ideal_roles').upsert(roles, { onConflict: 'code,role' })
    if (error) throw error
  }
  if (growths.length) {
    const { error } = await supabase.from('career_growth_opportunities').upsert(growths, { onConflict: 'code,item' })
    if (error) throw error
  }
  if (metrics.length) {
    const { error } = await supabase.from('career_success_metrics').upsert(metrics, { onConflict: 'code,metric' })
    if (error) throw error
  }
}

async function upsertRelationships() {
  const rel = await loadJson('../src/data/type_relationships.json')
  const comp = rel.compatibility || {}
  const rows = []
  for (const [code, obj] of Object.entries(comp)) {
    const desc = obj.descriptions || {}
    for (const m of obj.best_matches || []) rows.push({ code, kind: 'best', match_code: m, description: desc[m] || null })
    for (const m of obj.good_matches || []) rows.push({ code, kind: 'good', match_code: m, description: desc[m] || null })
    for (const m of obj.challenging || []) rows.push({ code, kind: 'challenging', match_code: m, description: desc[m] || null })
  }
  if (rows.length) {
    const { error } = await supabase.from('type_relationships').upsert(rows, { onConflict: 'code,kind,match_code' })
    if (error) throw error
  }
}

async function main() {
  try {
    console.log('Seeding personas...')
    await upsertPersonas()
    console.log('Seeding career...')
    await upsertCareer()
    console.log('Seeding relationships...')
    await upsertRelationships()
    console.log('Done.')
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()


