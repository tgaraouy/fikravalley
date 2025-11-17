# How to Use Cursor Rules

## What is `.cursorrules`?

The `.cursorrules` file (or `cursor_rules.md`) tells Cursor AI how to help you write code for your specific project. It's like giving Cursor a comprehensive handbook about:
- Your project's architecture
- Coding standards to follow
- Common patterns to use
- Mistakes to avoid

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Copy Rules to Your Project

**In your Cursor IDE terminal:**

```bash
# Make sure you're in your project directory
cd marrai-idea-bank

# Copy the rules file
cp /path/to/.cursorrules .cursorrules

# Or create it manually:
# Create file: .cursorrules
# Copy all content from the file
```

### Step 2: Verify It's Working

1. Open any TypeScript file in your project
2. Press **Cmd+L** (or Ctrl+L)
3. Type: `"What are the database naming conventions for this project?"`
4. Cursor should reference the `.cursorrules` and mention `marrai_` prefix

✅ **If Cursor mentions the rules, it's working!**

---

## 📋 What the Rules Cover

### 1. **Database Rules**
- ✅ Always use `marrai_` prefix for tables
- ✅ Avoid PostgreSQL reserved keywords
- ✅ Use proper indexes and foreign keys

### 2. **TypeScript/Next.js Patterns**
- ✅ API route structure with error handling
- ✅ Supabase query patterns
- ✅ Real-time subscription cleanup

### 3. **Claude API Integration**
- ✅ Prompt engineering best practices
- ✅ JSON parsing and cleaning
- ✅ Fallback handling

### 4. **UI/UX Rules**
- ✅ Loading states everywhere
- ✅ Mobile responsiveness
- ✅ French language for Morocco

### 5. **Security & Performance**
- ✅ Environment variable handling
- ✅ Input validation
- ✅ Query optimization

### 6. **Workshop-Specific Rules**
- ✅ Live dashboard requirements
- ✅ Conversation capture guidelines
- ✅ Data privacy considerations

---

## 💡 How to Use Cursor with Rules

### Use Case 1: Writing New Code

**When creating a new API endpoint:**

1. Create file: `app/api/my-endpoint/route.ts`
2. Press **Cmd+K** (inline edit)
3. Type: `"Create a POST endpoint following project patterns"`
4. Cursor will generate code that:
   - Uses correct table names (`marrai_*`)
   - Includes error handling
   - Follows project structure

**Example Prompt:**
```
Create a POST endpoint that:
- Accepts idea data
- Inserts into marrai_ideas table
- Triggers AI analysis
- Returns success with idea ID
Follow project patterns from .cursorrules
```

### Use Case 2: Fixing Errors

**When you hit a database error:**

1. Press **Cmd+L** (chat)
2. Paste the error
3. Ask: `"Fix this error following project rules"`
4. Cursor will suggest fixes that align with your standards

**Example:**
```
Error: relation "ideas" does not exist

Your prompt: "Fix this - I should be using marrai_ideas right?"
Cursor: "Yes! Update query to use marrai_ideas table..."
```

### Use Case 3: Code Review

**Before committing code:**

1. Select your code
2. Press **Cmd+K**
3. Type: `"Review this against project rules"`
4. Cursor will check:
   - Are table names correct?
   - Is error handling present?
   - Are French labels used?
   - Is it following patterns?

### Use Case 4: Learning Project Patterns

**When joining the project:**

1. Press **Cmd+L**
2. Ask: `"How do I query marrai_workshop_sessions?"`
3. Cursor will show the pattern from rules
4. You get consistent code instantly

---

## 🎯 Cursor Shortcuts Cheat Sheet

### Cmd+K (Inline Edit)
**Use when:** You want to modify/generate code at cursor position

**Examples:**
- "Add error handling"
- "Convert to TypeScript"
- "Add loading states"
- "Translate to French"

### Cmd+L (Chat)
**Use when:** You want to ask questions or get explanations

**Examples:**
- "How do I use Supabase realtime?"
- "Debug this error: [paste]"
- "Explain this function"
- "@filename.ts How does this work?"

### Tab (Autocomplete)
**Use when:** Writing code and want AI suggestions

**How:** Just start typing, Cursor suggests completions
- Press **Tab** to accept
- Press **Esc** to reject

### Cmd+I (Composer)
**Use when:** You want to generate entire files or large code blocks

**Example:**
- Open Composer
- Type: "Create a form component for idea submission following project patterns"
- Cursor generates entire component

---

## 🔧 Customizing Rules for Your Needs

### Add Project-Specific Patterns

Edit `.cursorrules` to add your patterns:

```markdown
## My Custom Patterns

### API Response Format
Always return responses in this format:
\`\`\`typescript
{
  success: boolean
  data?: any
  error?: string
  timestamp: string
}
\`\`\`
```

### Add Team Conventions

```markdown
## Team Conventions

### Commit Messages
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
```

### Add Domain Knowledge

```markdown
## Domain Knowledge

### Morocco Healthcare System
- Public hospitals use legacy ERP systems
- Most communication via WhatsApp
- Forms must be bilingual (French/Arabic)
```

---

## 📊 Real Examples from MarrAI Project

### Example 1: Creating an API Endpoint

**Your prompt to Cursor:**
```
Create app/api/validate-idea/route.ts that:
- Accepts idea_id and status (validated/rejected)
- Updates marrai_conversation_ideas table
- Returns success
Follow project patterns
```

**Cursor generates:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { idea_id, status } = await request.json()
    
    if (!idea_id || !status) {
      return NextResponse.json(
        { error: 'idea_id and status required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('marrai_conversation_ideas')
      .update({ 
        status,
        validated_at: new Date().toISOString()
      })
      .eq('id', idea_id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      data 
    })
    
  } catch (error: any) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

**✅ Notice how it follows all the rules:**
- Uses `marrai_` prefix
- Has try-catch
- Validates input
- Uses .single()
- Returns consistent format

### Example 2: Adding French Translations

**Select English text, Cmd+K:**
```
Translate all UI text to French, keep variable names in English
```

**Before:**
```typescript
<label>Problem Title</label>
<button>Submit</button>
<p>Loading...</p>
```

**After:**
```typescript
<label>Titre du Problème</label>
<button>Soumettre</button>
<p>Chargement...</p>
```

### Example 3: Fixing Common Mistakes

**Your code:**
```typescript
const { data } = await supabase.from('ideas').select('*')
setIdeas(data)
```

**Ask Cursor (Cmd+L):** "Is this following project patterns?"

**Cursor responds:**
```
This code has two issues:

1. Should use 'marrai_ideas' not 'ideas'
2. Missing error handling

Here's the corrected version:

const { data, error } = await supabase
  .from('marrai_ideas')
  .select('id, title, status') // Only what you need
  .order('created_at', { ascending: false })

if (error) {
  console.error('Load error:', error)
  return
}

setIdeas(data || [])
```

---

## 🎓 Tips for Maximum Productivity

### 1. Reference Rules in Prompts
```
"Following .cursorrules, create a..."
"According to project patterns, how do I..."
"Review this code against .cursorrules"
```

### 2. Use @ Mentions
```
"@.cursorrules What's the database naming convention?"
"@lib/supabase.ts Show me query patterns"
```

### 3. Build Your Own Shortcuts
Create a text file with common prompts:
```
PROMPT: Create API endpoint
"Create app/api/[name]/route.ts with POST handler that:
- [describe functionality]
- Uses marrai_ tables
- Follows project error handling
- Returns JSON response"

PROMPT: Create form component
"Create a form component with:
- [list fields]
- French labels
- Loading states
- Error handling
- Supabase integration"
```

### 4. Update Rules as You Learn
Add patterns you discover:
```markdown
## Patterns We Discovered

### Real-time Dashboard Pattern
When building dashboards:
1. Subscribe on mount
2. Unsubscribe on unmount
3. Show loading state
4. Play notification sound on new data
```

---

## 🚨 Troubleshooting

### "Cursor isn't following my rules"

**Fix 1:** Make sure file is named exactly `.cursorrules` (with dot)

**Fix 2:** Restart Cursor IDE
```bash
# macOS
Cmd+Q (Quit)
Open Cursor again

# Windows/Linux
Close and reopen
```

**Fix 3:** Explicitly reference rules in prompt
```
"According to .cursorrules, how should I..."
```

### "Rules file too long / not working"

Cursor has a context limit. If your rules are too long:

**Option 1:** Split into focused sections
```
.cursorrules-database.md
.cursorrules-api.md
.cursorrules-ui.md
```

**Option 2:** Prioritize most important rules
Keep core patterns, remove examples

### "Cursor suggests code that doesn't match rules"

AI isn't perfect. Always review suggestions:
1. Does it use `marrai_` prefix? ✅
2. Does it have error handling? ✅
3. Does it use French text? ✅
4. Does it follow patterns? ✅

If not, modify with Cmd+K

---

## 📈 Measuring Success

After 1 week with `.cursorrules`:

- ✅ Fewer bugs from naming mistakes
- ✅ Consistent code patterns across files
- ✅ Faster development (less looking up patterns)
- ✅ Easier onboarding (new devs read rules)
- ✅ Better code reviews (rules are standard)

---

## 🎯 Next Steps

1. **Copy `.cursorrules` to your project root**
2. **Test it:** Ask Cursor about project patterns
3. **Use it:** Reference rules in every Cursor prompt
4. **Update it:** Add patterns as you discover them
5. **Share it:** Commit to git so team uses same rules

---

## 📚 Additional Resources

- Cursor Docs: https://docs.cursor.sh
- .cursorrules Examples: https://github.com/topics/cursorrules
- AI Coding Best Practices: https://docs.anthropic.com/coding

---

**Remember:** `.cursorrules` is your AI co-pilot's instruction manual. The better the manual, the better the co-pilot! ✈️

**Happy coding with Cursor! 🚀**