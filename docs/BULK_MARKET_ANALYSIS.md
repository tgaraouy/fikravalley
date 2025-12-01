# 📊 Bulk Market Analysis Guide

## Overview

This script analyzes all existing ideas in the `marrai_ideas` table using LLM to populate the `ai_market_analysis` column. It's designed to handle large batches (500+ ideas) with progress tracking, rate limiting, and error recovery.

---

## Prerequisites

1. **Run Migration**: Ensure migration `011_add_ai_market_analysis.sql` has been executed in Supabase
2. **API Keys**: At least one LLM provider API key:
   - `ANTHROPIC_API_KEY` (recommended)
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
3. **Environment Variables**: `.env.local` file with Supabase credentials

---

## Usage

### Basic Command

```bash
npm run analyze:market
```

### What It Does

1. **Fetches All Ideas**: Retrieves all ideas from `marrai_ideas` table
2. **Tracks Progress**: Saves progress to `scripts/market-analysis-progress.json`
3. **Skips Analyzed**: Automatically skips ideas that already have `ai_market_analysis`
4. **Rate Limiting**: 
   - 2 seconds delay between ideas
   - 10 seconds delay between batches (5 ideas per batch)
5. **Provider Rotation**: Rotates between available LLM providers
6. **Error Handling**: Continues on errors, logs failures for retry

---

## Progress Tracking

The script saves progress to `scripts/market-analysis-progress.json`:

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

**Resume Capability**: If the script is interrupted, running it again will:
- Skip already analyzed ideas
- Retry failed ideas (you may want to clear `failed` array first)

---

## Configuration

### Batch Size

Default: 5 ideas per batch

To change, edit `scripts/bulk-market-analysis.ts`:
```typescript
const batchSize = 5; // Adjust as needed
```

### Delays

Default delays:
- Between ideas: 2 seconds
- Between batches: 10 seconds

To change, edit:
```typescript
const delayBetweenBatches = 10000; // 10 seconds
const delayBetweenIdeas = 2000; // 2 seconds
```

### Provider Priority

The script uses providers in this order:
1. Anthropic (Claude)
2. OpenAI (GPT-4o-mini)
3. Gemini (Gemini 1.5 Flash)

To change priority, modify the `providers` array in the script.

---

## Example Output

```
🚀 Starting Bulk Market Analysis
============================================================
📈 Progress: 0 ideas already analyzed
❌ Failed: 0 ideas failed

🔑 Available providers: anthropic, openai

📥 Fetching ideas from database...
   Fetched 50 ideas...
   Fetched 100 ideas...
   ...
   Fetched 555 ideas...

✅ Total ideas found: 555

📋 Ideas to analyze: 555

📦 Processing batch 1 (5 ideas)...

📊 Analyzing: AI-powered telemedicine platform for rural... (abc12345)
✅ Analyzed: AI-powered telemedicine platform for rural...
   Confidence: 85%
   Progress: 1 analyzed

📊 Analyzing: E-learning platform for Moroccan students... (def67890)
✅ Analyzed: E-learning platform for Moroccan students...
   Confidence: 78%
   Progress: 2 analyzed

...

⏳ Waiting 10s before next batch...

============================================================
✅ Bulk Analysis Complete!

📊 Total analyzed: 555
❌ Failed: 3
📈 Success rate: 99.5%

💾 Progress saved to: scripts/market-analysis-progress.json
```

---

## Monitoring Progress

### Check Progress File

```bash
cat scripts/market-analysis-progress.json
```

### Check Database

```sql
-- Count analyzed ideas
SELECT COUNT(*) 
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL;

-- View sample analysis
SELECT 
  id, 
  title, 
  ai_market_analysis->>'confidence_score' as confidence,
  ai_market_analysis->>'analyzed_at' as analyzed_at
FROM marrai_ideas 
WHERE ai_market_analysis IS NOT NULL
LIMIT 10;
```

---

## Troubleshooting

### Rate Limit Errors

If you see rate limit errors:
1. Increase delays in the script
2. Reduce batch size
3. Use multiple API keys (rotate manually)

### JSON Parse Errors

If analysis generation fails:
- The script will log the error and continue
- Failed ideas are saved in `progress.failed`
- You can retry failed ideas by clearing the `failed` array

### Out of Memory

For very large datasets (1000+ ideas):
- Process in smaller chunks
- Filter by date range or category
- Run multiple times with different filters

---

## Filtering Ideas

To analyze only specific ideas, modify the fetch query in the script:

```typescript
// Example: Only analyze ideas from last 30 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const { data, error } = await supabase
  .from('marrai_ideas')
  .select('id, title, problem_statement, proposed_solution, category, location')
  .gte('created_at', thirtyDaysAgo.toISOString())
  .order('created_at', { ascending: true })
  .range(offset, offset + pageSize - 1);
```

---

## Cost Estimation

### Anthropic Claude (Sonnet 4)
- ~4000 tokens per analysis
- ~$0.003 per idea
- 555 ideas ≈ **$1.67**

### OpenAI GPT-4o-mini
- ~4000 tokens per analysis
- ~$0.00015 per idea
- 555 ideas ≈ **$0.08**

### Google Gemini 1.5 Flash
- ~4000 tokens per analysis
- ~$0.0001 per idea
- 555 ideas ≈ **$0.06**

**Recommendation**: Use GPT-4o-mini or Gemini for bulk analysis (cheaper), Claude for high-quality individual analyses.

---

## Next Steps

After bulk analysis completes:

1. **Verify Results**: Check a sample of analyses in the database
2. **Display in UI**: Add market analysis section to idea detail pages
3. **Create API**: Build endpoint for on-demand analysis of new ideas
4. **Refresh Logic**: Set up periodic re-analysis for market changes

---

## Performance Tips

1. **Run Overnight**: Bulk analysis can take 2-4 hours for 555 ideas
2. **Monitor Progress**: Check progress file periodically
3. **Use Multiple Providers**: Distributes load and reduces rate limits
4. **Resume Capability**: Script can be stopped and resumed safely

---

**Status**: ✅ Script ready. Run `npm run analyze:market` to start bulk analysis.

