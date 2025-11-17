-- Debug script to check why ideas aren't showing
-- Run this to diagnose the issue

-- 1. Check if ideas exist and their visibility status
SELECT 
  id,
  title,
  visible,
  status,
  qualification_tier,
  created_at
FROM marrai_ideas
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if ideas have scores
SELECT 
  i.id,
  i.title,
  i.visible,
  cs.total as clarity_total,
  ds.total as decision_total,
  (COALESCE(cs.total, 0) + COALESCE(ds.total, 0)) as calculated_total_score
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id
ORDER BY i.created_at DESC
LIMIT 10;

-- 3. Check the view directly
SELECT 
  idea_id,
  stage1_total,
  stage2_total,
  total_score
FROM marrai_idea_scores
LIMIT 10;

-- 4. Count ideas by visibility
SELECT 
  COUNT(*) FILTER (WHERE visible = true) as visible_count,
  COUNT(*) FILTER (WHERE visible = false OR visible IS NULL) as hidden_count,
  COUNT(*) as total_count
FROM marrai_ideas;

-- 5. Quick fix: Make all ideas visible (if needed)
-- UPDATE marrai_ideas SET visible = true;

