-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_ms INTEGER,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  locale TEXT,
  device_type TEXT
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('A', 'B')),
  axis TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  version INTEGER DEFAULT 1,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latency_ms INTEGER
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  primary_type TEXT NOT NULL,
  secondary_type TEXT NOT NULL,
  confidence REAL NOT NULL,
  axes_scores JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_axis ON answers(axis);
CREATE INDEX IF NOT EXISTS idx_answers_timestamp ON answers(timestamp);
CREATE INDEX IF NOT EXISTS idx_results_session_id ON results(session_id);
CREATE INDEX IF NOT EXISTS idx_results_primary_type ON results(primary_type);
CREATE INDEX IF NOT EXISTS idx_results_timestamp ON results(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON sessions(utm_source);
CREATE INDEX IF NOT EXISTS idx_sessions_referrer ON sessions(referrer);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for statistics
DROP POLICY IF EXISTS "Allow anonymous read access" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous read access" ON answers;
DROP POLICY IF EXISTS "Allow anonymous read access" ON results;
CREATE POLICY "Allow anonymous read access" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON answers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON results FOR SELECT USING (true);

-- Allow anonymous insert for new sessions
DROP POLICY IF EXISTS "Allow anonymous insert" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous insert" ON answers;
DROP POLICY IF EXISTS "Allow anonymous insert" ON results;
CREATE POLICY "Allow anonymous insert" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON results FOR INSERT WITH CHECK (true);

-- =============================
-- Content: personas and related
-- =============================

CREATE TABLE IF NOT EXISTS personas (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  one_liner TEXT,
  summary_long TEXT,
  color TEXT,
  image TEXT
);

CREATE TABLE IF NOT EXISTS persona_keywords (
  code TEXT REFERENCES personas(code) ON DELETE CASCADE,
  keyword TEXT,
  PRIMARY KEY (code, keyword)
);

CREATE TABLE IF NOT EXISTS persona_strengths (
  code TEXT REFERENCES personas(code) ON DELETE CASCADE,
  strength TEXT,
  PRIMARY KEY (code, strength)
);

CREATE TABLE IF NOT EXISTS persona_growth (
  code TEXT REFERENCES personas(code) ON DELETE CASCADE,
  growth TEXT,
  PRIMARY KEY (code, growth)
);

-- =============================
-- Type relationships (compatibility)
-- =============================

DO $$ BEGIN
  CREATE TYPE relation_kind AS ENUM ('best','good','challenging');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS type_relationships (
  code TEXT REFERENCES personas(code) ON DELETE CASCADE,
  kind relation_kind NOT NULL,
  match_code TEXT REFERENCES personas(code) ON DELETE CASCADE,
  description TEXT,
  PRIMARY KEY (code, kind, match_code)
);

-- =============================
-- Career guidance
-- =============================

CREATE TABLE IF NOT EXISTS career (
  code TEXT PRIMARY KEY REFERENCES personas(code) ON DELETE CASCADE,
  work_env_best TEXT,
  work_env_avoid TEXT,
  work_env_culture TEXT
);

CREATE TABLE IF NOT EXISTS career_ideal_roles (
  code TEXT REFERENCES career(code) ON DELETE CASCADE,
  role TEXT,
  PRIMARY KEY (code, role)
);

CREATE TABLE IF NOT EXISTS career_growth_opportunities (
  code TEXT REFERENCES career(code) ON DELETE CASCADE,
  item TEXT,
  PRIMARY KEY (code, item)
);

CREATE TABLE IF NOT EXISTS career_success_metrics (
  code TEXT REFERENCES career(code) ON DELETE CASCADE,
  metric TEXT,
  PRIMARY KEY (code, metric)
);

-- RLS for content tables (read-only public)
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_strengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE type_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE career ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_ideal_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_growth_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_success_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "personas_read" ON personas;
DROP POLICY IF EXISTS "persona_keywords_read" ON persona_keywords;
DROP POLICY IF EXISTS "persona_strengths_read" ON persona_strengths;
DROP POLICY IF EXISTS "persona_growth_read" ON persona_growth;
DROP POLICY IF EXISTS "type_relationships_read" ON type_relationships;
DROP POLICY IF EXISTS "career_read" ON career;
DROP POLICY IF EXISTS "career_ideal_roles_read" ON career_ideal_roles;
DROP POLICY IF EXISTS "career_growth_opportunities_read" ON career_growth_opportunities;
DROP POLICY IF EXISTS "career_success_metrics_read" ON career_success_metrics;
CREATE POLICY "personas_read" ON personas FOR SELECT USING (true);
CREATE POLICY "persona_keywords_read" ON persona_keywords FOR SELECT USING (true);
CREATE POLICY "persona_strengths_read" ON persona_strengths FOR SELECT USING (true);
CREATE POLICY "persona_growth_read" ON persona_growth FOR SELECT USING (true);
CREATE POLICY "type_relationships_read" ON type_relationships FOR SELECT USING (true);
CREATE POLICY "career_read" ON career FOR SELECT USING (true);
CREATE POLICY "career_ideal_roles_read" ON career_ideal_roles FOR SELECT USING (true);
CREATE POLICY "career_growth_opportunities_read" ON career_growth_opportunities FOR SELECT USING (true);
CREATE POLICY "career_success_metrics_read" ON career_success_metrics FOR SELECT USING (true);

-- =============================
-- Analytics Views
-- =============================

-- Type distribution (all time)
CREATE OR REPLACE VIEW v_type_distribution AS
SELECT primary_type AS type, COUNT(*)::int AS cnt
FROM results
GROUP BY primary_type
ORDER BY cnt DESC;

-- Type distribution (last 7/30/90 days)
CREATE OR REPLACE VIEW v_type_distribution_7d AS
SELECT primary_type AS type, COUNT(*)::int AS cnt
FROM results
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY primary_type
ORDER BY cnt DESC;

CREATE OR REPLACE VIEW v_type_distribution_30d AS
SELECT primary_type AS type, COUNT(*)::int AS cnt
FROM results
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY primary_type
ORDER BY cnt DESC;

CREATE OR REPLACE VIEW v_type_distribution_90d AS
SELECT primary_type AS type, COUNT(*)::int AS cnt
FROM results
WHERE timestamp >= NOW() - INTERVAL '90 days'
GROUP BY primary_type
ORDER BY cnt DESC;

-- Daily completed (count per day)
CREATE OR REPLACE VIEW v_daily_completed AS
SELECT (date_trunc('day', timestamp))::date AS day, COUNT(*)::int AS completed
FROM results
GROUP BY 1
ORDER BY 1 DESC;

-- Completion time stats (p50/p90)
CREATE OR REPLACE VIEW v_completion_time_stats AS
SELECT
  COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY completed_ms), 0)::int AS p50_ms,
  COALESCE(percentile_cont(0.9) WITHIN GROUP (ORDER BY completed_ms), 0)::int AS p90_ms
FROM sessions
WHERE completed_ms IS NOT NULL;

-- Axis A/B ratio
CREATE OR REPLACE VIEW v_axis_ab_ratio AS
SELECT axis,
  SUM(CASE WHEN answer = 'A' THEN 1 ELSE 0 END)::int AS a_cnt,
  SUM(CASE WHEN answer = 'B' THEN 1 ELSE 0 END)::int AS b_cnt,
  CASE WHEN (SUM(CASE WHEN answer='A' THEN 1 ELSE 0 END)+SUM(CASE WHEN answer='B' THEN 1 ELSE 0 END)) > 0
    THEN (SUM(CASE WHEN answer='A' THEN 1 ELSE 0 END)::float) /
         (SUM(CASE WHEN answer='A' THEN 1 ELSE 0 END)+SUM(CASE WHEN answer='B' THEN 1 ELSE 0 END))
    ELSE 0 END AS a_ratio
FROM answers
GROUP BY axis
ORDER BY axis;

-- Latency histogram (5 buckets 0-8000ms)
CREATE OR REPLACE VIEW v_latency_hist AS
SELECT width_bucket(latency_ms, 0, 8000, 5) AS bucket, COUNT(*)::int AS cnt
FROM answers
WHERE latency_ms IS NOT NULL
GROUP BY 1
ORDER BY 1;

-- Referrer / UTM type distribution (last 30 days)
CREATE OR REPLACE VIEW v_type_distribution_by_referrer_30d AS
SELECT s.referrer, r.primary_type AS type, COUNT(*)::int AS cnt
FROM results r
JOIN sessions s ON s.id = r.session_id
WHERE r.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY s.referrer, r.primary_type
ORDER BY 1,3 DESC;

CREATE OR REPLACE VIEW v_type_distribution_by_utm_30d AS
SELECT COALESCE(s.utm_source,'(none)') AS utm_source, r.primary_type AS type, COUNT(*)::int AS cnt
FROM results r
JOIN sessions s ON s.id = r.session_id
WHERE r.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY 1, r.primary_type
ORDER BY 1,3 DESC;

-- Question A/B skew Top5 (absolute difference) last 30 days
CREATE OR REPLACE VIEW v_question_ab_skew_top5_30d AS
WITH agg AS (
  SELECT question_id,
    SUM(CASE WHEN answer='A' THEN 1 ELSE 0 END) AS a_cnt,
    SUM(CASE WHEN answer='B' THEN 1 ELSE 0 END) AS b_cnt
  FROM answers
  WHERE timestamp >= NOW() - INTERVAL '30 days'
  GROUP BY question_id
)
SELECT question_id, a_cnt::int, b_cnt::int,
  CASE WHEN (a_cnt+b_cnt)>0 THEN ABS(a_cnt - b_cnt)::float/(a_cnt+b_cnt) ELSE 0 END AS skew
FROM agg
ORDER BY skew DESC
LIMIT 5;

-- Slowest questions Top5 by avg latency (last 30 days)
CREATE OR REPLACE VIEW v_question_latency_top5_30d AS
SELECT question_id,
  AVG(latency_ms)::int AS avg_latency_ms,
  COUNT(*)::int AS samples
FROM answers
WHERE latency_ms IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY question_id
HAVING COUNT(*) >= 5
ORDER BY avg_latency_ms DESC
LIMIT 5;