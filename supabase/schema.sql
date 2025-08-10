-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_ms INTEGER
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

-- RLS (Row Level Security) policies - 現在は全て読み取り可能
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for statistics
CREATE POLICY "Allow anonymous read access" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON answers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON results FOR SELECT USING (true);

-- Allow anonymous insert for new sessions
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

CREATE POLICY "personas_read" ON personas FOR SELECT USING (true);
CREATE POLICY "persona_keywords_read" ON persona_keywords FOR SELECT USING (true);
CREATE POLICY "persona_strengths_read" ON persona_strengths FOR SELECT USING (true);
CREATE POLICY "persona_growth_read" ON persona_growth FOR SELECT USING (true);
CREATE POLICY "type_relationships_read" ON type_relationships FOR SELECT USING (true);
CREATE POLICY "career_read" ON career FOR SELECT USING (true);
CREATE POLICY "career_ideal_roles_read" ON career_ideal_roles FOR SELECT USING (true);
CREATE POLICY "career_growth_opportunities_read" ON career_growth_opportunities FOR SELECT USING (true);
CREATE POLICY "career_success_metrics_read" ON career_success_metrics FOR SELECT USING (true);