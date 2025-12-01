# Monitor Bulk Market Analysis Progress
# Usage: .\scripts\monitor-progress.ps1

$progressFile = "scripts/market-analysis-progress.json"
$checkInterval = 10 # seconds

Write-Host "Monitoring Market Analysis Progress" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop monitoring`n" -ForegroundColor Yellow

while ($true) {
    if (Test-Path $progressFile) {
        $progress = Get-Content $progressFile | ConvertFrom-Json
        
        $analyzed = $progress.analyzed.Count
        $failed = $progress.failed.Count
        $totalAnalyzed = $progress.totalAnalyzed
        $total = 555
        $percent = [math]::Round(($totalAnalyzed / $total) * 100, 1)
        
        Clear-Host
        Write-Host "Market Analysis Progress Monitor" -ForegroundColor Cyan
        Write-Host ("=" * 60) -ForegroundColor Gray
        Write-Host ""
        Write-Host "Analyzed: $totalAnalyzed / $total ideas ($percent%)" -ForegroundColor Green
        Write-Host "Failed: $failed ideas" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
        Write-Host "Last Run: $($progress.lastRun)" -ForegroundColor Gray
        Write-Host ""
        
        if ($progress.failed.Count -gt 0) {
            Write-Host "Recent Failures:" -ForegroundColor Yellow
            $progress.failed[-5..-1] | ForEach-Object {
                $errorMsg = if ($_.error.Length -gt 50) { $_.error.Substring(0,50) + "..." } else { $_.error }
                Write-Host "  - $($_.id.Substring(0,8)): $errorMsg" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "Refreshing in $checkInterval seconds... (Ctrl+C to stop)" -ForegroundColor Gray
    } else {
        Write-Host "Waiting for progress file to be created..." -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds $checkInterval
}

