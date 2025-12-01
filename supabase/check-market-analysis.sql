-- Check Market Analysis Data in Supabase
-- Run this in Supabase SQL Editor

-- Count ideas with market analysis
SELECT 
  COUNT(*) as total_analyzed,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM marrai_ideas) as percentage
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL;

-- View recent analyses
SELECT 
  id, 
  title,
  ai_market_analysis->>'analyzed_at' as analyzed_at,
  ai_market_analysis->>'confidence_score' as confidence_score,
  ai_market_analysis->'market_size'->>'value' as market_size_value,
  ai_market_analysis->'market_size'->>'unit' as market_size_unit,
  jsonb_array_length(ai_market_analysis->'competitors') as competitor_count,
  jsonb_array_length(ai_market_analysis->'trends') as trend_count,
  jsonb_array_length(ai_market_analysis->'risks') as risk_count,
  jsonb_array_length(ai_market_analysis->'opportunities') as opportunity_count
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL
ORDER BY (ai_market_analysis->>'analyzed_at')::timestamp DESC
LIMIT 10;

-- Check analysis quality
SELECT 
  AVG((ai_market_analysis->>'confidence_score')::numeric) as avg_confidence,
  MIN((ai_market_analysis->>'confidence_score')::numeric) as min_confidence,
  MAX((ai_market_analysis->>'confidence_score')::numeric) as max_confidence,
  COUNT(*) as total_analyzed
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL;

-- Sample full analysis (one idea)
SELECT 
  id,
  title,
  ai_market_analysis
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL
LIMIT 1;

