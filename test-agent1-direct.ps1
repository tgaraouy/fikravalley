# Direct test of extractIdea method
# This will help us see what's actually happening

$body = @{
    speaker_quote = "Morocco receive 20m visitors but they don't return after their first visits incurring opportunity to soustain and predict economical tourism output compared to France, Spain and Portugal who has 20% retrun rate"
} | ConvertTo-Json

Write-Host "Testing with same input that worked in debug..." -ForegroundColor Cyan
Write-Host ""

# Test debug endpoint (we know this works)
Write-Host "1. Testing DEBUG endpoint..." -ForegroundColor Yellow
$debugResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor/debug" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "Debug result: success=$($debugResponse.success)" -ForegroundColor $(if ($debugResponse.success) { "Green" } else { "Red" })
if ($debugResponse.success) {
    Write-Host "  Confidence: $($debugResponse.extracted.confidence_score)" -ForegroundColor Green
    Write-Host "  Title: $($debugResponse.extracted.problem_title)" -ForegroundColor Green
}

Write-Host ""

# Test main endpoint
Write-Host "2. Testing MAIN extraction endpoint..." -ForegroundColor Yellow
$mainResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "Main result: success=$($mainResponse.success)" -ForegroundColor $(if ($mainResponse.success) { "Green" } else { "Red" })
if (-not $mainResponse.success) {
    Write-Host "  Error: $($mainResponse.message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Comparison:" -ForegroundColor Cyan
Write-Host "  Debug endpoint: $($debugResponse.success)" -ForegroundColor $(if ($debugResponse.success) { "Green" } else { "Red" })
Write-Host "  Main endpoint:  $($mainResponse.success)" -ForegroundColor $(if ($mainResponse.success) { "Green" } else { "Red" })

if ($debugResponse.success -and -not $mainResponse.success) {
    Write-Host ""
    Write-Host "⚠️ ISSUE FOUND: Debug works but main doesn't!" -ForegroundColor Yellow
    Write-Host "This suggests a difference in how the two endpoints process the response." -ForegroundColor Yellow
    Write-Host "Check server logs for detailed error messages." -ForegroundColor Yellow
}

