# Cron Job Setup: Cleanup Expired User Data

This guide explains how to set up a daily cron job to automatically delete expired user data.

## Overview

The cleanup job runs daily to:
- Find all users whose `data_retention_expiry` date has passed
- Permanently delete their encrypted data
- Keep audit logs (never deleted)
- Log the cleanup operation

## API Endpoint

**URL:** `https://your-domain.com/api/cron/cleanup-expired-data`

**Method:** `GET` or `POST`

**Authentication:** Bearer token via `Authorization` header

**Example:**
```bash
curl -X POST https://your-domain.com/api/cron/cleanup-expired-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Step 1: Generate Cron Secret

Generate a secure random secret for cron authentication:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to your `.env.local`:

```env
CRON_SECRET=<generated_secret_here>
```

## Step 2: Choose Your Cron Service

### Option A: Vercel Cron (Recommended for Vercel Deployments)

If you're deploying on Vercel, use Vercel Cron:

1. **Create `vercel.json` in project root:**

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-data",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Note:** The code automatically trusts Vercel Cron requests (checks for `x-vercel-cron` header which only Vercel can set). No secret needed for Vercel Cron.

2. **Optional: Add CRON_SECRET for external services:**
   - If you also want to use external cron services, add `CRON_SECRET` in Vercel Dashboard
   - Go to Project Settings → Environment Variables
   - Add `CRON_SECRET` with your generated secret
   - Apply to Production, Preview, and Development environments
   - **Note:** Not required if using only Vercel Cron

3. **Deploy:**
   ```bash
   vercel --prod
   ```

**Schedule Format:** `0 2 * * *` = Daily at 2:00 AM UTC

**Security Note:** Vercel automatically adds the `x-vercel-cron: 1` header to cron requests. This header can only be set by Vercel's infrastructure, so it's safe to trust. External cron services will need to provide `CRON_SECRET` via Authorization header or query parameter.

### Option B: GitHub Actions (Free)

Create `.github/workflows/cleanup-expired-data.yml`:

```yaml
name: Cleanup Expired User Data

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cleanup API
        run: |
          curl -X POST ${{ secrets.API_URL }}/api/cron/cleanup-expired-data \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Setup:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `API_URL`: Your production API URL (e.g., `https://your-domain.com`)
   - `CRON_SECRET`: Your generated cron secret

### Option C: External Cron Service

Use services like:
- **Cron-job.org** (Free)
- **EasyCron** (Free tier available)
- **Cronitor** (Free tier available)
- **AWS EventBridge** (if using AWS)

**Configuration:**
- **URL:** `https://your-domain.com/api/cron/cleanup-expired-data`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
- **Schedule:** Daily at 2:00 AM UTC (`0 2 * * *`)

### Option D: Supabase Edge Functions + pg_cron

If using Supabase, you can set up a database cron job:

1. **Create Supabase Edge Function** (optional, or use API route)
2. **Enable pg_cron extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

3. **Schedule the job:**
   ```sql
   SELECT cron.schedule(
     'cleanup-expired-data',
     '0 2 * * *', -- Daily at 2 AM UTC
     $$
     SELECT net.http_post(
       url := 'https://your-domain.com/api/cron/cleanup-expired-data',
       headers := jsonb_build_object(
         'Authorization', 'Bearer YOUR_CRON_SECRET',
         'Content-Type', 'application/json'
       )
     ) AS request_id;
     $$
   );
   ```

## Step 3: Test the Endpoint

Test manually before setting up the cron:

```bash
# Replace with your actual values
export CRON_SECRET="your_secret_here"
export API_URL="https://your-domain.com"

# Test the endpoint
curl -X POST ${API_URL}/api/cron/cleanup-expired-data \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "deletedCount": 0,
  "timestamp": "2025-01-15T02:00:00.000Z"
}
```

## Step 4: Monitor the Job

### Check Logs

- **Vercel:** Dashboard → Logs
- **GitHub Actions:** Repository → Actions tab
- **External Services:** Check service dashboard

### Verify Cleanup

Query the database to verify expired users are deleted:

```sql
-- Check expired users (should return 0 after cleanup)
SELECT COUNT(*) 
FROM secure_users 
WHERE data_retention_expiry <= NOW();

-- Check audit logs for cleanup entries
SELECT * 
FROM audit_logs 
WHERE action = 'cleanup_expired_data' 
ORDER BY timestamp DESC 
LIMIT 10;
```

## Schedule Options

Common schedules:

- **Daily at 2 AM UTC:** `0 2 * * *`
- **Daily at midnight UTC:** `0 0 * * *`
- **Every 12 hours:** `0 */12 * * *`
- **Weekly (Monday 2 AM):** `0 2 * * 1`

## Security Best Practices

1. **Never commit `CRON_SECRET` to version control**
2. **Use different secrets for dev/staging/production**
3. **Rotate secrets periodically**
4. **Monitor for unauthorized access attempts**
5. **Use HTTPS only (never HTTP)**
6. **Limit access to cron endpoint (IP whitelist if possible)**

## Troubleshooting

### "Unauthorized" Error

- Check that `CRON_SECRET` is set in environment variables
- Verify the Authorization header format: `Bearer <secret>`
- Ensure the secret matches exactly (no extra spaces)

### Job Not Running

- Verify cron schedule syntax
- Check service logs for errors
- Ensure API endpoint is publicly accessible
- Test endpoint manually first

### No Users Deleted

- Check if any users have expired:
  ```sql
  SELECT COUNT(*) FROM secure_users 
  WHERE data_retention_expiry <= NOW();
  ```
- Verify data retention expiry dates are set correctly
- Check audit logs for cleanup entries

### Performance Issues

- If deleting many users, consider batching
- Monitor database performance during cleanup
- Consider running during off-peak hours

## Manual Cleanup

You can also trigger cleanup manually:

```bash
# Using curl
curl -X POST https://your-domain.com/api/cron/cleanup-expired-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or visit in browser (GET request)
https://your-domain.com/api/cron/cleanup-expired-data?secret=YOUR_CRON_SECRET
```

**Note:** The GET method also works for manual testing, but POST is recommended for cron services.

## Next Steps

1. ✅ Generate and set `CRON_SECRET`
2. ✅ Choose and configure cron service
3. ✅ Test endpoint manually
4. ✅ Set up scheduled job
5. ✅ Monitor first few runs
6. ✅ Set up alerts for failures

## Resources

- [Vercel Cron Documentation](https://vercel.com/docs/cron-jobs)
- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Cron Expression Generator](https://crontab.guru/)
- [Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)

