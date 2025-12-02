-- Al-Ma3qool Protocol v2.0: Proofs Table
-- Immutable validation proofs (Niya, Tadamoun, Thiqa)

CREATE TABLE IF NOT EXISTS marrai_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES marrai_secure_users(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('niya', 'tadamoun', 'thiqa')),
  payload JSONB NOT NULL, -- Encoded verification data
  eGov_signature TEXT, -- Cryptographic seal from eGov
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ, -- When eGov confirms
  
  -- Ensure one proof type per idea-user combination
  UNIQUE(idea_id, user_id, proof_type)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_proofs_user_id ON marrai_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_proofs_idea_id ON marrai_proofs(idea_id);
CREATE INDEX IF NOT EXISTS idx_proofs_type ON marrai_proofs(proof_type);
CREATE INDEX IF NOT EXISTS idx_proofs_verified ON marrai_proofs(verified_at) WHERE verified_at IS NOT NULL;

-- Add status column to marrai_ideas if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_ideas' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE marrai_ideas 
    ADD COLUMN status TEXT DEFAULT 'draft' 
    CHECK (status IN ('draft', 'validating', 'funded', 'sunset'));
  END IF;
END $$;

-- Add eGov_Meta JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_ideas' 
    AND column_name = 'egov_meta'
  ) THEN
    ALTER TABLE marrai_ideas 
    ADD COLUMN egov_meta JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add indexes for eGov metadata queries
CREATE INDEX IF NOT EXISTS idx_ideas_egov_meta ON marrai_ideas USING GIN (egov_meta);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON marrai_ideas(status);

-- Add capacity_profile to marrai_secure_users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_secure_users' 
    AND column_name = 'capacity_profile'
  ) THEN
    ALTER TABLE marrai_secure_users 
    ADD COLUMN capacity_profile JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add trust_circle to marrai_secure_users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_secure_users' 
    AND column_name = 'trust_circle'
  ) THEN
    ALTER TABLE marrai_secure_users 
    ADD COLUMN trust_circle JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

COMMENT ON TABLE marrai_proofs IS 'Immutable validation proofs for Al-Ma3qool Protocol v2.0';
COMMENT ON COLUMN marrai_proofs.proof_type IS 'Type of proof: niya (intent), tadamoun (solidarity), thiqa (trust)';
COMMENT ON COLUMN marrai_proofs.payload IS 'Encoded verification data (voice note URL, receipt, payment confirmation, etc.)';
COMMENT ON COLUMN marrai_proofs.eGov_signature IS 'Cryptographic seal from eGov system';

