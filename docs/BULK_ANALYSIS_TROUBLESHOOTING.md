# 🔧 Bulk Market Analysis Troubleshooting

## Common Errors & Solutions

### Error: Gemini Model Not Found (404)

**Error Message:**
```
[GoogleGenerativeAI Error]: Error fetching from ... models/gemini-1.5-flash is not found
```

**Solution:**
The script now automatically tries:
1. `gemini-1.5-flash-latest` (first attempt)
2. `gemini-pro` (fallback if first fails)

If both fail, the script will try the next available provider (Anthropic or OpenAI).

**Status:** ✅ Fixed in latest version

---

### Error: All Providers Failed

**Error Message:**
```
❌ Error analyzing [idea-id]: All providers failed. Last error: ...
```

**Possible Causes:**
1. **API Keys Missing/Invalid**
   - Check `.env.local` has valid API keys
   - Verify keys are not expired

2. **Rate Limits**
   - Script will retry on next run
   - Consider increasing delays between requests

3. **Network Issues**
   - Check internet connection
   - Verify API endpoints are accessible

**Solution:**
- Check which providers are available:
  ```bash
  # Check environment variables
  echo $ANTHROPIC_API_KEY
  echo $OPENAI_API_KEY
  echo $GEMINI_API_KEY
  ```
- The script automatically tries all available providers
- Failed ideas are logged in `progress.failed` for retry

---

### Error: JSON Parse Failed

**Error Message:**
```
JSON parse error for idea [id]: Unexpected token...
```

**Solution:**
- The script now shows the first 500 chars of the response for debugging
- LLM responses are cleaned (removes markdown, extracts JSON)
- If parsing fails, the script tries the next provider

**To Debug:**
1. Check the console output for the raw response
2. Verify the LLM is returning valid JSON
3. The script will automatically try the next provider

---

### Progress File Out of Sync

**Symptom:**
- Progress file says X analyzed
- Database has Y analyzed (different number)

**Solution:**
1. **Verify in database:**
   ```bash
   npm run verify:market
   ```

2. **If mismatch:**
   - Progress file might be out of sync
   - Some ideas might have been analyzed manually
   - Re-run script (it will skip already analyzed ideas)

3. **Reset progress (if needed):**
   ```powershell
   # Backup first!
   Copy-Item scripts/market-analysis-progress.json scripts/market-analysis-progress.json.backup
   
   # Reset (keeps analyzed list, clears failed)
   $p = Get-Content scripts/market-analysis-progress.json | ConvertFrom-Json
   $p.failed = @()
   $p | ConvertTo-Json -Depth 10 | Set-Content scripts/market-analysis-progress.json
   ```

---

### Script Stops Unexpectedly

**Possible Causes:**
1. **Process killed** (Ctrl+C, system shutdown)
2. **Out of memory**
3. **Network timeout**

**Solution:**
- Script automatically resumes from progress file
- Run again: `npm run analyze:market`
- It will skip already analyzed ideas

---

### Rate Limit Errors

**Error Message:**
```
Rate limit exceeded
429 Too Many Requests
```

**Solution:**
1. **Increase delays** in script:
   ```typescript
   const delayBetweenBatches = 20000; // 20 seconds (was 10)
   const delayBetweenIdeas = 3000; // 3 seconds (was 2)
   ```

2. **Use multiple API keys** (rotate manually)

3. **Wait and retry:**
   - Script logs rate limit errors
   - Failed ideas are saved for retry
   - Run script again after waiting

---

### Database Connection Errors

**Error Message:**
```
Error fetching ideas: Missing Supabase configuration
Database error: ...
```

**Solution:**
1. **Check environment variables:**
   ```bash
   # Should have at least one:
   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
   ```

2. **Verify Supabase connection:**
   ```bash
   npm run verify:market
   ```

3. **Check Supabase dashboard:**
   - Verify project is active
   - Check database is accessible

---

## Best Practices

### 1. **Run During Off-Peak Hours**
- API rate limits are higher
- Less network congestion

### 2. **Monitor Progress Regularly**
```bash
# Quick check
.\scripts\check-progress.ps1

# Continuous monitoring
.\scripts\monitor-progress.ps1
```

### 3. **Keep Progress File Safe**
- Don't delete `scripts/market-analysis-progress.json`
- It allows script to resume
- Backup before manual edits

### 4. **Use Multiple Providers**
- Distributes load
- Automatic fallback if one fails
- Reduces rate limit issues

---

## Recovery Steps

If script fails completely:

1. **Check what was saved:**
   ```bash
   npm run verify:market
   ```

2. **Review failed ideas:**
   ```powershell
   $p = Get-Content scripts/market-analysis-progress.json | ConvertFrom-Json
   $p.failed | Format-Table
   ```

3. **Clear failed list (to retry):**
   ```powershell
   $p = Get-Content scripts/market-analysis-progress.json | ConvertFrom-Json
   $p.failed = @()
   $p | ConvertTo-Json -Depth 10 | Set-Content scripts/market-analysis-progress.json
   ```

4. **Re-run script:**
   ```bash
   npm run analyze:market
   ```

---

## Getting Help

If issues persist:

1. **Check logs:** Review console output for detailed errors
2. **Verify setup:** Run `npm run verify:market` to check database
3. **Test with small batch:** Modify script to process only 10 ideas first
4. **Check API status:** Verify LLM provider APIs are operational

---

**Status:** ✅ Script is robust with automatic fallbacks and error recovery.

