# validate-prompts.ps1
# Validates that all agent prompts are correctly placed in files

Write-Host "`n🔍 Validating Agent Prompts...`n" -ForegroundColor Cyan

$files = @(
    @{Path="lib/agents/conversation-extractor-agent.ts"; Agent="Agent 1: Conversation Extractor"; Required="AGENT 1:"},
    @{Path="app/api/analyze-idea/route.ts"; Agent="Agent 2A/2B: Feasibility and ROI"; Required="AGENT 2A:"},
    @{Path="lib/idea-bank/scoring/two-stage-scorer.ts"; Agent="Agent 2C: SDG Alignment"; Required="AGENT 2C:"},
    @{Path="lib/agents/mentor-agent.ts"; Agent="Agent 5: Mentor Matcher"; Required="AGENT 5:"},
    @{Path="lib/agents/notification-agent.ts"; Agent="Agent 6: Notification"; Required="AGENT 6:"},
    @{Path="lib/agents/feature-flag-agent.ts"; Agent="Agent 7: Feature Flag"; Required="AGENT 7:"}
)

$allValid = $true
$results = @()

foreach ($file in $files) {
    $exists = Test-Path $file.Path
    if ($exists) {
        $content = Get-Content $file.Path -Raw -ErrorAction SilentlyContinue
        if ($content -and ($content -match $file.Required -or $content -match "ROLE:")) {
            $results += @{Status="✅"; Agent=$file.Agent; Message="Prompt found"}
            Write-Host "✅ $($file.Agent): Prompt found" -ForegroundColor Green
        } else {
            $results += @{Status="❌"; Agent=$file.Agent; Message="Prompt missing"}
            Write-Host "❌ $($file.Agent): Prompt missing" -ForegroundColor Red
            $allValid = $false
        }
    } else {
        $results += @{Status="⚠️"; Agent=$file.Agent; Message="File not found"}
        Write-Host "⚠️  $($file.Agent): File not found" -ForegroundColor Yellow
        $allValid = $false
    }
}

# Check .cursorrules
Write-Host "`n📋 Checking .cursorrules..." -ForegroundColor Cyan
if (Test-Path ".cursorrules") {
    $cursorRules = Get-Content ".cursorrules" -Raw
    if ($cursorRules -match "Fikra Valley System Prompt") {
        Write-Host "✅ .cursorrules: Global rules found" -ForegroundColor Green
    } else {
        Write-Host "❌ .cursorrules: Global rules missing" -ForegroundColor Red
        $allValid = $false
    }
} else {
    Write-Host "❌ .cursorrules: File not found" -ForegroundColor Red
    $allValid = $false
}

# Summary
Write-Host "`n" + ("="*60) -ForegroundColor Gray
if ($allValid) {
    Write-Host "`n✅ All prompts validated successfully!`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Open any agent file in Cursor" -ForegroundColor White
    Write-Host "  2. Press Cmd+L (or Ctrl+L)" -ForegroundColor White
    Write-Host "  3. Ask: 'What should this agent do?'" -ForegroundColor White
    Write-Host "  4. Cursor should reference the prompt at the top`n" -ForegroundColor White
} else {
    Write-Host "`n❌ Some prompts are missing. Check above.`n" -ForegroundColor Red
    Write-Host "See VALIDATE_AGENT_PROMPTS.md for details.`n" -ForegroundColor Yellow
}

Write-Host ("="*60) + "`n" -ForegroundColor Gray

