-- Life OS Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable RLS
-- Note: Life OS uses localStorage as primary storage for speed.
-- Supabase is used as optional cloud backup / cross-device sync.

-- Users table (single user system)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily snapshots for history/backup
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Workout history (for cross-device access)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  exercises JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WHOOP data history
CREATE TABLE IF NOT EXISTS whoop_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  recovery INTEGER,
  sleep INTEGER,
  strain DECIMAL,
  hrv INTEGER,
  rhr INTEGER,
  skin_temp DECIMAL,
  blood_o2 INTEGER,
  resp_rate DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whoop_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies (single user - allow all for authenticated)
CREATE POLICY "Allow all for authenticated users" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON daily_snapshots FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON workout_logs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON whoop_data FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON goals FOR ALL USING (true);
