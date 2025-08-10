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