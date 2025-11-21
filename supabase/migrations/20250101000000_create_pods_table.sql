-- Create marrai_pods table for Journey Pods system
CREATE TABLE IF NOT EXISTS marrai_pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'paused')),
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  done_definition JSONB,
  pre_mortem JSONB,
  sprint_completion_rate NUMERIC(5,2) DEFAULT 0,
  task_ease_score NUMERIC(3,2) DEFAULT 0,
  current_sprint JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for city-based queries
CREATE INDEX IF NOT EXISTS idx_pods_city ON marrai_pods(city);
CREATE INDEX IF NOT EXISTS idx_pods_status ON marrai_pods(status);
CREATE INDEX IF NOT EXISTS idx_pods_creator ON marrai_pods(creator_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pods_updated_at
  BEFORE UPDATE ON marrai_pods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

