# Comprehensive Agent 1 Validation Script
# Tests all functionality: extraction, auto-promotion, validation, languages

Write-Host ""
Write-Host "Agent 1: Comprehensive Validation" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

$baseUrl = "http://localhost:3000/api/agents/conversation-extractor"
$results = @()

# Test 1: High Confidence Auto-Promotion
Write-Host "Test 1: High Confidence Auto-Promotion" -ForegroundColor Yellow
$test1 = @{
    speaker_quote = "Morocco receive 20m visitors but they don't return after their first visits. The problem is families struggle with school transportation in Rabat every day"
    speaker_phone = "+212612345678"
} | ConvertTo-Json

try {
    $r1 = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $test1
    $status = if ($r1.success -and $r1.ideaId) { "PASS" } else { "FAIL" }
    Write-Host "  $status" -ForegroundColor $(if ($r1.success -and $r1.ideaId) { "Green" } else { "Red" })
    Write-Host "  Success: $($r1.success), Auto-promoted: $($r1.ideaId -ne $null), Needs Validation: $($r1.needsValidation)" -ForegroundColor Gray
    $results += @{ Test = "High Confidence"; Status = $status; Success = $r1.success }
} catch {
    Write-Host "  FAIL - Error: $_" -ForegroundColor Red
    $results += @{ Test = "High Confidence"; Status = "FAIL"; Success = $false }
}

# Test 2: Low Confidence Needs Validation
Write-Host ""
Write-Host "Test 2: Low Confidence Needs Validation" -ForegroundColor Yellow
$test2 = @{
    speaker_quote = "something for education"
    speaker_phone = "+212612345678"
} | ConvertTo-Json

try {
    $r2 = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $test2
    $status = if ($r2.success -and $r2.needsValidation) { "PASS" } else { "FAIL" }
    Write-Host "  $status" -ForegroundColor $(if ($r2.success -and $r2.needsValidation) { "Green" } else { "Red" })
    Write-Host "  Success: $($r2.success), Needs Validation: $($r2.needsValidation), Has Question: $($r2.validationQuestion -ne $null)" -ForegroundColor Gray
    $results += @{ Test = "Low Confidence"; Status = $status; Success = $r2.success }
} catch {
    Write-Host "  FAIL - Error: $_" -ForegroundColor Red
    $results += @{ Test = "Low Confidence"; Status = "FAIL"; Success = $false }
}

# Test 3: English Input
Write-Host ""
Write-Host "Test 3: English Input" -ForegroundColor Yellow
$test3 = @{
    speaker_quote = "Morocco receive 20m visitors but they don't return after their first visits"
    speaker_phone = "+212612345678"
} | ConvertTo-Json

try {
    $r3 = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $test3
    $status = if ($r3.success) { "PASS" } else { "FAIL" }
    Write-Host "  $status" -ForegroundColor $(if ($r3.success) { "Green" } else { "Red" })
    Write-Host "  Success: $($r3.success), Conversation ID: $($r3.conversationIdeaId)" -ForegroundColor Gray
    $results += @{ Test = "English Input"; Status = $status; Success = $r3.success }
} catch {
    Write-Host "  FAIL - Error: $_" -ForegroundColor Red
    $results += @{ Test = "English Input"; Status = "FAIL"; Success = $false }
}

# Test 4: French Input
Write-Host ""
Write-Host "Test 4: French Input" -ForegroundColor Yellow
$test4 = @{
    speaker_quote = "Je pense qu'on devrait creer une application pour les etudiants de Casablanca"
    speaker_phone = "+212612345678"
} | ConvertTo-Json

try {
    $r4 = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $test4
    $status = if ($r4.success) { "PASS" } else { "FAIL" }
    Write-Host "  $status" -ForegroundColor $(if ($r4.success) { "Green" } else { "Red" })
    Write-Host "  Success: $($r4.success), Conversation ID: $($r4.conversationIdeaId)" -ForegroundColor Gray
    $results += @{ Test = "French Input"; Status = $status; Success = $r4.success }
} catch {
    Write-Host "  FAIL - Error: $_" -ForegroundColor Red
    $results += @{ Test = "French Input"; Status = "FAIL"; Success = $false }
}

# Test 5: Invalid Input (Should Fail)
Write-Host ""
Write-Host "Test 5: Invalid Input (Should Return False)" -ForegroundColor Yellow
$test5 = @{
    speaker_quote = "hello how are you"
    speaker_phone = "+212612345678"
} | ConvertTo-Json

try {
    $r5 = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $test5
    $status = if (-not $r5.success) { "PASS" } else { "FAIL" }
    Write-Host "  $status" -ForegroundColor $(if (-not $r5.success) { "Green" } else { "Red" })
    Write-Host "  Success: $($r5.success) (Expected: false)" -ForegroundColor Gray
    $results += @{ Test = "Invalid Input"; Status = $status; Success = (-not $r5.success) }
} catch {
    Write-Host "  PASS - Correctly rejected invalid input" -ForegroundColor Green
    $results += @{ Test = "Invalid Input"; Status = "PASS"; Success = $true }
}

# Summary
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""
Write-Host "Validation Summary:" -ForegroundColor Cyan
Write-Host ""

$passed = ($results | Where-Object { $_.Success }).Count
$total = $results.Count

foreach ($result in $results) {
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "  $($result.Status) - $($result.Test)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Results: $passed/$total tests passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host ""
    Write-Host "All tests passed! Agent 1 is working correctly." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Some tests failed. Check server logs for details." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check server logs for 'Using service role key'" -ForegroundColor White
Write-Host "  2. Verify database records in Supabase" -ForegroundColor White
Write-Host "  3. Test web UI: http://localhost:3000/test-agent-1" -ForegroundColor White
Write-Host ""
