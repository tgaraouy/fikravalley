# 🔄 Market Analysis Refresh Logic

## Overview

The market analysis refresh system automatically re-analyzes ideas when:
1. They haven't been analyzed yet
2. Their analysis is older than X days (default: 90 days)
3. Their confidence score is below a threshold (default: 0.6)

---

## API Endpoint

### `GET /api/cron/refresh-market-analysis`

**Purpose**: Refresh market analysis for ideas that need updating

**Authentication**: 
- Optional: Set `CRON_SECRET` environment variable
- If set, requires `Authorization: Bearer <CRON_SECRET>` header

**Query Parameters**:
- `days` (optional, default: 90): Number of days since last analysis
- `minConfidence` (optional, default: 0.6): Minimum confidence score threshold
- `limit` (optional, default: 10): Maximum number of ideas to refresh per run

**Example**:
```bash
# Refresh ideas analyzed more than 90 days ago or with confidence < 0.6
curl -X GET "https://your-domain.com/api/cron/refresh-market-analysis?days=90&minConfidence=0.6&limit=10" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Response**:
```json
{
  "message": "Refreshed 8 of 10 ideas",
  "refreshed": 8,
  "failed": 2,
  "total": 10,
  "refreshedIds": ["idea-id-1", "idea-id-2", ...],
  "failedIds": [
    { "id": "idea-id-3", "error": "Rate limit exceeded" }
  ]
}
```

---

## Setup Cron Job

### Option 1: Vercel Cron (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-market-analysis?days=90&minConfidence=0.6&limit=20",
      "schedule": "0 2 * * 0"
    }
  ]
}
```

This runs every Sunday at 2 AM UTC.

### Option 2: External Cron Service

Use services like:
- **Cron-job.org**: Free, simple HTTP cron
- **EasyCron**: More features, paid
- **GitHub Actions**: Free for public repos

**Example (cron-job.org)**:
1. Create account at https://cron-job.org
2. Add new cron job:
   - URL: `https://your-domain.com/api/cron/refresh-market-analysis?days=90&limit=20`
   - Schedule: `0 2 * * 0` (Every Sunday at 2 AM)
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

### Option 3: GitHub Actions

Create `.github/workflows/refresh-market-analysis.yml`:

```yaml
name: Refresh Market Analysis

on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Refresh Market Analysis
        run: |
          curl -X GET "https://your-domain.com/api/cron/refresh-market-analysis?days=90&limit=20" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Optional: Secret for cron endpoint authentication
CRON_SECRET=your-secret-key-here

# Required: App URL for internal API calls
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Or use VERCEL_URL (automatically set on Vercel)
```

---

## Refresh Criteria

Ideas are refreshed if they meet ANY of these conditions:

1. **No Analysis**: `ai_market_analysis IS NULL`
2. **Old Analysis**: `analyzed_at < (today - X days)`
3. **Low Confidence**: `confidence_score < minConfidence`

**Example**:
- Idea analyzed 100 days ago → **Refresh** (if days=90)
- Idea with confidence 0.5 → **Refresh** (if minConfidence=0.6)
- Idea never analyzed → **Refresh**

---

## Rate Limiting

The refresh endpoint:
- Processes ideas sequentially (not in parallel)
- Adds 2-second delay between each idea
- Limits to 10 ideas per run (configurable)

**Recommendation**: 
- Run weekly with `limit=20` for steady updates
- Or run daily with `limit=5` for gradual refresh

---

## Monitoring

### Check Refresh Status

```sql
-- Ideas that need refresh (older than 90 days)
SELECT 
  id,
  title,
  ai_market_analysis->>'analyzed_at' as last_analyzed,
  ai_market_analysis->>'confidence_score' as confidence
FROM marrai_ideas
WHERE visible = true
  AND (
    ai_market_analysis IS NULL
    OR (ai_market_analysis->>'analyzed_at')::timestamp < NOW() - INTERVAL '90 days'
    OR (ai_market_analysis->>'confidence_score')::numeric < 0.6
  )
LIMIT 20;
```

### View Refresh History

The endpoint returns which ideas were refreshed and which failed. You can:
1. Log this to a database table
2. Send to monitoring service (e.g., Sentry)
3. Email summary (if configured)

---

## Cost Estimation

**Per Refresh**:
- 20 ideas × ~4000 tokens = 80,000 tokens
- Using GPT-4o-mini: ~$0.012 per run
- Using Claude Sonnet: ~$0.24 per run

**Monthly** (4 runs):
- GPT-4o-mini: ~$0.05/month
- Claude Sonnet: ~$0.96/month

**Recommendation**: Use GPT-4o-mini for refresh jobs (cheaper), Claude for initial analysis (higher quality).

---

## Troubleshooting

### "Unauthorized" Error

**Solution**: Set `CRON_SECRET` environment variable and include it in the request header.

### "Failed to fetch ideas"

**Solution**: Check Supabase connection and ensure `SUPABASE_SERVICE_ROLE_KEY` is set.

### Rate Limit Errors

**Solution**: 
- Reduce `limit` parameter
- Increase delay between ideas (edit endpoint)
- Use multiple API keys (rotate providers)

### Ideas Not Refreshing

**Check**:
1. Ideas must have `visible = true`
2. Check if ideas meet refresh criteria (SQL query above)
3. Verify cron job is actually running (check logs)

---

## Future Enhancements

1. **Database Logging**: Store refresh history in `marrai_market_analysis_refresh_log`
2. **Email Notifications**: Send summary after each refresh
3. **Smart Scheduling**: Prioritize high-traffic ideas
4. **Batch Processing**: Process multiple ideas in parallel (with rate limiting)
5. **Confidence Thresholds**: Different thresholds for different idea categories

---

**Status**: ✅ Refresh endpoint created. Set up cron job to enable automatic refresh.

