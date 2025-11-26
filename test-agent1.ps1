# PowerShell script to test Agent 1 Debug endpoint
# Usage: .\test-agent1.ps1

$quote = "Morocco receive 20m visitors but they don't return after their first visits incurring opportunity to soustain and predict economical tourism output compared to France, Spain and Portugal who has 20% retrun rate"

Write-Host "Testing Agent 1 Debug endpoint..." -ForegroundColor Cyan
Write-Host "Input: $quote" -ForegroundColor Gray
Write-Host ""

$body = @{
    speaker_quote = $quote
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor/debug" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Yellow
    }
}

