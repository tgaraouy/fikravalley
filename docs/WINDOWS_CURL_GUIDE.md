# Windows PowerShell cURL Guide

## Issue with cURL on Windows

Windows PowerShell handles quotes and JSON differently than bash. Here are the correct ways to test the API:

## Method 1: PowerShell with Escaped Quotes (Recommended)

```powershell
curl.exe -X POST http://localhost:3000/api/agents/conversation-extractor/debug `
  -H "Content-Type: application/json" `
  -d '{\"speaker_quote\": \"Morocco receive 20m visitors but they don'\''t return after their first visits\"}'
```

## Method 2: Using Invoke-RestMethod (PowerShell Native)

```powershell
$body = @{
    speaker_quote = "Morocco receive 20m visitors but they don't return after their first visits incurring opportunity to soustain and predict economical tourism output compared to France, Spain and Portugal who has 20% retrun rate"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor/debug" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## Method 3: Using a JSON File

1. Create `test-input.json`:
```json
{
  "speaker_quote": "Morocco receive 20m visitors but they don't return after their first visits incurring opportunity to soustain and predict economical tourism output compared to France, Spain and Portugal who has 20% retrun rate"
}
```

2. Run:
```powershell
curl.exe -X POST http://localhost:3000/api/agents/conversation-extractor/debug `
  -H "Content-Type: application/json" `
  -d "@test-input.json"
```

## Method 4: Use the Web UI (Easiest!)

Just go to: `http://localhost:3000/test-agent-1`

Paste your input and click "🔍 Debug" button.

## Method 5: Using Postman or Insomnia

1. Method: POST
2. URL: `http://localhost:3000/api/agents/conversation-extractor/debug`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "speaker_quote": "Morocco receive 20m visitors but they don't return after their first visits incurring opportunity to soustain and predict economical tourism output compared to France, Spain and Portugal who has 20% retrun rate"
}
```

## Quick Test Script

Save as `test-agent1.ps1`:

```powershell
$quote = "Morocco receive 20m visitors but they don't return after their first visits incurring opportunity to soustain and predict economical tourism output compared to France, Spain and Portugal who has 20% retrun rate"

$body = @{
    speaker_quote = $quote
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor/debug" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response | ConvertTo-Json -Depth 10
```

Run: `.\test-agent1.ps1`

