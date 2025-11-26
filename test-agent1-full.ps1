# PowerShell script to test Agent 1 full extraction endpoint
# Usage: .\test-agent1-full.ps1

$quote = "Morocco receive 20m visitors but they don't return after their first visits incurring opportunity to soustain and predict economical tourism output compared to France, Spain and Portugal who has 20% retrun rate"

Write-Host "Testing Agent 1 Full Extraction endpoint..." -ForegroundColor Cyan
Write-Host "Input: $quote" -ForegroundColor Gray
Write-Host ""

$body = @{
    speaker_quote = $quote
    speaker_phone = "+212612345678"
    speaker_email = "test@example.com"
    speaker_context = "Tourism entrepreneur"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    if ($response.success) {
        Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
        if ($response.ideaId) {
            Write-Host "✅ Auto-promoted! Idea ID: $($response.ideaId)" -ForegroundColor Green
        } elseif ($response.needsValidation) {
            Write-Host "⚠️ Needs validation. Question: $($response.validationQuestion)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ FAILED: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

