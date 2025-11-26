# Agent 1: UI Validation Guide

## Quick Start

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open browser**:
   ```
   http://localhost:3000/test-agent-1
   ```

## Using the Test Page

### Method 1: Pre-loaded Test Cases

The page has 4 pre-loaded test cases. Click any button to load it:

1. **High Confidence Darija**
   - Tests auto-promotion
   - Should return `success: true` with `ideaId`

2. **Low Confidence (Needs Clarification)**
   - Tests validation workflow
   - Should return `needsValidation: true` with `validationQuestion`

3. **French Input**
   - Tests French language support
   - Should extract and categorize correctly

4. **Tamazight Input**
   - Tests Tamazight language support
   - Should preserve Latin script

### Method 2: Custom Input

1. **Enter Speaker Quote**:
   - Type your idea in any language (Darija/Tamazight/French/English)
   - Example: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس"

2. **Optional Fields**:
   - **Speaker Phone**: `+212612345678` (for WhatsApp validation)
   - **Speaker Email**: `test@example.com`
   - **Speaker Context**: `Workshop participant`

3. **Click "🚀 Test Agent 1"**:
   - Wait for response (usually 5-10 seconds)
   - View results below

### Method 3: Debug Mode

1. **Enter your input** (same as Method 2)

2. **Click "🔍 Debug" button**:
   - Shows detailed extraction process
   - Displays Claude's raw response
   - Shows validation checks
   - Helps diagnose issues

## Understanding Results

### ✅ Success (High Confidence - Auto-Promoted)
```json
{
  "success": true,
  "conversationIdeaId": "uuid-here",
  "ideaId": "uuid-here",  // ← Auto-promoted!
  "needsValidation": false,
  "message": "Idea extracted and auto-promoted to main ideas table."
}
```

**What this means:**
- Idea extracted successfully
- Confidence ≥ 0.85
- Auto-promoted to `marrai_ideas` table
- No validation needed

### ⚠️ Success (Low Confidence - Needs Validation)
```json
{
  "success": true,
  "conversationIdeaId": "uuid-here",
  "needsValidation": true,  // ← Needs validation!
  "validationQuestion": "شنو كتعني ب 'شي'؟",
  "message": "Idea extracted. Validation required via WhatsApp."
}
```

**What this means:**
- Idea extracted successfully
- Confidence < 0.85 OR needs clarification
- Validation question sent via WhatsApp (if phone provided)
- Waiting for speaker confirmation

### ❌ Failure
```json
{
  "success": false,
  "message": "No valid idea extracted..."
}
```

**What this means:**
- Input doesn't contain a clear digitization idea
- Confidence < 0.70
- Missing required fields
- Use "🔍 Debug" button to see why

## Debug Information

When you click "🔍 Debug", you'll see:

### If Successful:
- ✅ **Extraction Successful**
- Raw extracted data (title, statement, category, etc.)
- Confidence score
- Validation status

### If Failed:
- ❌ **Extraction Failed**
- Reason for failure
- **Input Analysis**: Language detection, character count
- **Claude Response**: Raw API response
- **Validation**: Which checks passed/failed

## Visual Indicators

### Green Checkmark ✅
- Extraction successful
- Idea saved to database
- Auto-promoted (if high confidence)

### Yellow Warning ⚠️
- Needs validation
- Check `validationQuestion`
- WhatsApp message sent (if phone provided)

### Red X ❌
- Extraction failed
- Click "Debug" for details
- Check error message

## Tips for Testing

### Test High Confidence:
```
"Morocco receive 20m visitors but they don't return after their first visits. The problem is families struggle with school transportation in Rabat every day"
```

### Test Low Confidence:
```
"something for education"
```

### Test Language Support:
- **Darija**: "فكرة فبالي نخدم تطبيق"
- **French**: "Je pense qu'on devrait créer une application"
- **English**: "I want to create an app for students"
- **Tamazight**: "Adggar d uranday? Ssawal amaynu"

### Test Invalid Input:
```
"hello how are you"
```
(Should return `success: false`)

## Validation Checklist (UI)

After testing, verify:

- [ ] ✅ High confidence ideas auto-promote (see `ideaId`)
- [ ] ⚠️ Low confidence ideas need validation (see `validationQuestion`)
- [ ] ❌ Invalid inputs are rejected (`success: false`)
- [ ] 🌍 Multiple languages work (Darija/French/English/Tamazight)
- [ ] 📱 Phone number stored (check `speaker_context` in database)
- [ ] 🔍 Debug mode shows detailed information

## Troubleshooting

### Page Not Loading?
- Check dev server is running: `npm run dev`
- Check URL: `http://localhost:3000/test-agent-1`
- Check browser console for errors

### Tests Always Fail?
- Check server logs for errors
- Verify `ANTHROPIC_API_KEY` is set
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Use "Debug" button to see detailed errors

### No Response?
- Check network tab in browser DevTools
- Verify API endpoint is accessible
- Check server console for errors

## Next Steps After UI Validation

1. **Check Database**:
   ```sql
   SELECT * FROM marrai_conversation_ideas 
   ORDER BY created_at DESC LIMIT 5;
   ```

2. **Check Server Logs**:
   - Look for "✅ Using service role key"
   - Check for any error messages

3. **Verify Auto-Promotion**:
   ```sql
   SELECT ci.*, i.id as idea_id 
   FROM marrai_conversation_ideas ci
   LEFT JOIN marrai_ideas i ON ci.promoted_to_idea_id = i.id
   WHERE ci.status = 'promoted_to_idea';
   ```

