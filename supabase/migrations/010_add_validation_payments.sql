-- ============================================
-- Validation Payment Tracking
-- ============================================
-- Tracks 3-DH validation payment links and status
-- Assembly over Addition: Simple payment tracking for mobile money

CREATE TABLE IF NOT EXISTS marrai_idea_validation_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Payment details
  amount NUMERIC(5,2) NOT NULL DEFAULT 3.00, -- 3 DH validation
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('m-wallet', 'orange-money', 'cih-bank', 'attijariwafa')),
  payment_reference TEXT NOT NULL, -- Unique reference for tracking
  payment_link TEXT NOT NULL, -- Deep link or URL
  
  -- Customer info (optional)
  customer_name TEXT,
  customer_phone TEXT, -- Hashed if needed
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Link to receipt (if customer uploads proof)
  receipt_id UUID REFERENCES marrai_idea_receipts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_validation_payments_idea_id ON marrai_idea_validation_payments(idea_id);
CREATE INDEX IF NOT EXISTS idx_validation_payments_status ON marrai_idea_validation_payments(status);
CREATE INDEX IF NOT EXISTS idx_validation_payments_reference ON marrai_idea_validation_payments(payment_reference);

COMMENT ON TABLE marrai_idea_validation_payments IS 'Tracks 3-DH validation payment links for mobile money (M-Wallet, Orange Money, etc.)';

