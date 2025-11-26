# ✅ Agent Prompts Validation Guide

## 🎯 Quick Validation Checklist

### Step 1: Verify Files Have Prompts

Check that each agent file has the prompt at the top:

```bash
# Check Agent 1
grep -A 5 "AGENT 1:" lib/agents/conversation-extractor-agent.ts

# Check Agent 2A/2B
grep -A 5 "AGENT 2A:" app/api/analyze-idea/route.ts

# Check Agent 2C
grep -A 5 "AGENT 2C:" lib/idea-bank/scoring/two-stage-scorer.ts

# Check Agent 5
grep -A 5 "AGENT 5:" lib/agents/mentor-agent.ts

# Check Agent 6
grep -A 5 "AGENT 6:" lib/agents/notification-agent.ts

# Check Agent 7
grep -A 5 "AGENT 7:" lib/agents/feature-flag-agent.ts
```

### Step 2: Test in Cursor Chat

Open each file and test with Cursor:

1. **Open** `lib/agents/conversation-extractor-agent.ts`
2. **Press** `Cmd+L` (or `Ctrl+L`)
3. **Ask**: "What should this agent do according to the prompt?"
4. **Expected**: Cursor should reference the JSDoc comment at the top

### Step 3: Test Schema Awareness

1. **Open** any agent file
2. **Press** `Cmd+L`
3. **Ask**: "What database table should I use for storing ideas?"
4. **Expected**: Should mention `marrai_ideas` (not `ideas`)

### Step 4: Test Moroccan Context

1. **Open** `app/api/analyze-idea/route.ts`
2. **Press** `Cmd+L`
3. **Ask**: "How should I handle 2G connectivity in Morocco?"
4. **Expected**: Should reference PDPL, 2G constraints, offline capability

### Step 5: Test Human-in-the-Loop

1. **Open** `lib/agents/conversation-extractor-agent.ts`
2. **Press** `Cmd+L`
3. **Ask**: "When should I auto-promote an idea vs requiring validation?"
4. **Expected**: Should mention confidence_score >= 0.85 AND needs_clarification=false

## 🧪 Automated Validation Script

Run this PowerShell script to validate all prompts:

```powershell
# validate-prompts.ps1
Write-Host "🔍 Validating Agent Prompts..." -ForegroundColor Cyan

$files = @(
    @{Path="lib/agents/conversation-extractor-agent.ts"; Agent="Agent 1"},
    @{Path="app/api/analyze-idea/route.ts"; Agent="Agent 2A/2B"},
    @{Path="lib/idea-bank/scoring/two-stage-scorer.ts"; Agent="Agent 2C"},
    @{Path="lib/agents/mentor-agent.ts"; Agent="Agent 5"},
    @{Path="lib/agents/notification-agent.ts"; Agent="Agent 6"},
    @{Path="lib/agents/feature-flag-agent.ts"; Agent="Agent 7"}
)

$allValid = $true

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        $content = Get-Content $file.Path -Raw
        if ($content -match "AGENT \d+:" -or $content -match "ROLE:") {
            Write-Host "✅ $($file.Agent): Prompt found" -ForegroundColor Green
        } else {
            Write-Host "❌ $($file.Agent): Prompt missing" -ForegroundColor Red
            $allValid = $false
        }
    } else {
        Write-Host "⚠️  $($file.Agent): File not found" -ForegroundColor Yellow
        $allValid = $false
    }
}

if ($allValid) {
    Write-Host "`n✅ All prompts validated!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Some prompts are missing. Check above." -ForegroundColor Red
}
```

## 📋 Manual Validation Steps

### 1. Check .cursorrules

```bash
# Should contain "Fikra Valley System Prompt"
grep "Fikra Valley" .cursorrules
```

### 2. Check Each Agent File

Open each file and verify:
- ✅ JSDoc comment at the top starts with `/**`
- ✅ Contains "AGENT X:" or "ROLE:"
- ✅ Mentions schema fields (marrai_ideas, etc.)
- ✅ Mentions Moroccan context (PDPL, 2G, diaspora)
- ✅ Mentions human-in-the-loop rules

### 3. Test Code Generation

1. Create a new file: `test-agent-prompt.ts`
2. Press `Cmd+K` in Cursor
3. Type: "Create a function that extracts ideas from conversation following Agent 1 prompt"
4. **Expected**: Generated code should:
   - Use `marrai_conversation_ideas` table
   - Include confidence_score validation
   - Handle Darija/Tamazight/French/English
   - Include human-in-the-loop logic

## 🎯 Validation Test Cases

### Test Case 1: Schema Awareness

**Prompt to Cursor**: "Create a function to save an idea to the database"

**Expected**:
- Uses `marrai_ideas` (not `ideas`)
- Includes all required fields from schema
- Uses correct field names (ai_feasibility_score, not feasibility_score)

### Test Case 2: Language Support

**Prompt to Cursor**: "How should Agent 1 handle Tamazight input?"

**Expected**:
- Mentions Latin script for Tamazight
- Preserves original language
- Generates validation questions in appropriate language

### Test Case 3: Human-in-the-Loop

**Prompt to Cursor**: "When should an idea be auto-promoted?"

**Expected**:
- Mentions confidence_score >= 0.85
- Mentions needs_clarification=false
- Mentions WhatsApp validation for low confidence

### Test Case 4: Moroccan Context

**Prompt to Cursor**: "How should I handle data privacy in Morocco?"

**Expected**:
- Mentions PDPL (Personal Data Protection Law)
- Mentions data cannot leave Morocco without consent
- Mentions 2G connectivity constraints

## ✅ Success Criteria

All validations pass if:

- [x] `.cursorrules` file exists and contains system prompt
- [x] All 7 agent files have prompts at the top
- [x] Cursor can reference prompts when asked
- [x] Generated code uses correct schema names
- [x] Generated code respects Moroccan context
- [x] Generated code includes human-in-the-loop checks

## 🚨 Common Issues

### Issue 1: Cursor doesn't see the prompt
**Fix**: Restart Cursor after adding prompts

### Issue 2: Wrong schema names
**Fix**: Check `.cursorrules` has correct schema awareness section

### Issue 3: Missing human-in-the-loop
**Fix**: Verify prompt includes "HUMAN-IN-THE-LOOP RULES" section

## 📞 Next Steps

After validation:
1. ✅ All prompts are in place
2. ✅ Cursor recognizes them
3. ✅ Code generation follows rules
4. 🚀 Ready to use!

For detailed prompts, see: `docs/AGENT_PROMPTS_GUIDE.md`

