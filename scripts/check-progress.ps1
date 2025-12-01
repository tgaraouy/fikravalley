# Quick Progress Check
# Usage: .\scripts\check-progress.ps1

$progressFile = "scripts/market-analysis-progress.json"

if (-not (Test-Path $progressFile)) {
    Write-Host "⏳ Progress file not found. Script may still be initializing..." -ForegroundColor Yellow
    exit
}

$progress = Get-Content $progressFile | ConvertFrom-Json

$analyzed = $progress.totalAnalyzed
$failed = $progress.failed.Count
$total = 555
$percent = [math]::Round(($analyzed / $total) * 100, 1)

Write-Host ""
Write-Host "MARKET ANALYSIS PROGRESS" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Gray
Write-Host ""
Write-Host "Analyzed: $analyzed / $total ideas" -ForegroundColor Green
Write-Host "Progress: $percent%" -ForegroundColor Yellow
Write-Host "Failed: $failed ideas" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "Last Update: $($progress.lastRun)" -ForegroundColor Gray

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "Recent Failures:" -ForegroundColor Yellow
    $progress.failed[-5..-1] | ForEach-Object {
        $errorMsg = if ($_.error.Length -gt 60) { $_.error.Substring(0, 60) + "..." } else { $_.error }
        Write-Host "  - $($_.id.Substring(0, 8)): $errorMsg" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "For continuous monitoring: .\scripts\monitor-progress.ps1" -ForegroundColor Cyan
Write-Host ""

