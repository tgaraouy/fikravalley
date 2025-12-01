# 📊 How to Monitor Bulk Market Analysis

## Quick Status Check

### PowerShell (Windows)

```powershell
# One-time check
Get-Content scripts/market-analysis-progress.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Continuous monitoring (every 10 seconds)
.\scripts\monitor-progress.ps1
```

### Bash/Linux/Mac

```bash
# One-time check
cat scripts/market-analysis-progress.json | jq .

# Continuous monitoring (every 10 seconds)
watch -n 10 'cat scripts/market-analysis-progress.json | jq .'
```

---

## Manual Monitoring

### Check Progress File

```powershell
# View full progress
cat scripts/market-analysis-progress.json

# Count analyzed
(Get-Content scripts/market-analysis-progress.json | ConvertFrom-Json).totalAnalyzed

# Count failed
(Get-Content scripts/market-analysis-progress.json | ConvertFrom-Json).failed.Count
```

### Check Database Directly

```sql
-- Count analyzed ideas
SELECT COUNT(*) 
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL;

-- View recent analyses
SELECT 
  id, 
  title, 
  ai_market_analysis->>'confidence_score' as confidence,
  ai_market_analysis->>'analyzed_at' as analyzed_at
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL
ORDER BY (ai_market_analysis->>'analyzed_at')::timestamp DESC
LIMIT 10;

-- Check analysis quality
SELECT 
  AVG((ai_market_analysis->>'confidence_score')::numeric) as avg_confidence,
  COUNT(*) as total_analyzed
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL;
```

---

## Monitor Script Output

The script outputs to console. To see live output:

### Option 1: Run in Foreground

Stop the background process and run:
```bash
npm run analyze:market
```

### Option 2: Check Logs

If running in background, check terminal output or redirect to file:
```bash
npm run analyze:market > market-analysis.log 2>&1
tail -f market-analysis.log
```

---

## Progress File Structure

```json
{
  "analyzed": ["idea-id-1", "idea-id-2", ...],
  "failed": [
    { "id": "idea-id-3", "error": "Rate limit exceeded" }
  ],
  "lastRun": "2024-01-15T10:30:00.000Z",
  "totalAnalyzed": 150
}
```

---

## Expected Timeline

For 555 ideas:
- **Batch size**: 5 ideas per batch
- **Delay between ideas**: 2 seconds
- **Delay between batches**: 10 seconds
- **Time per idea**: ~2-5 seconds (LLM call)
- **Total time**: ~2-4 hours

**Progress milestones**:
- 10% (55 ideas): ~15-20 minutes
- 25% (139 ideas): ~40-50 minutes
- 50% (278 ideas): ~1.5 hours
- 75% (416 ideas): ~2.5 hours
- 100% (555 ideas): ~3-4 hours

---

## Troubleshooting

### Script Not Running

Check if process is running:
```powershell
Get-Process | Where-Object { $_.ProcessName -like "*node*" }
```

### No Progress File

If progress file doesn't exist after 30 seconds:
1. Check environment variables (API keys, Supabase)
2. Check console for errors
3. Verify migration was run

### Stalled Progress

If progress stops:
1. Check API rate limits
2. Check network connection
3. Review failed ideas in progress file
4. Restart script (it will resume from where it left off)

---

## Resume After Interruption

The script automatically resumes:
1. It skips already analyzed ideas (from `analyzed` array)
2. Failed ideas can be retried by clearing `failed` array in progress file

To retry failed ideas:
```powershell
$progress = Get-Content scripts/market-analysis-progress.json | ConvertFrom-Json
$progress.failed = @()
$progress | ConvertTo-Json -Depth 10 | Set-Content scripts/market-analysis-progress.json
```

Then run the script again.

