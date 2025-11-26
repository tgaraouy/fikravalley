# 🚀 Quick Setup: Agent Prompts for Cursor

## ✅ What's Already Done

1. **Global Rules**: Updated `.cursorrules` with comprehensive system prompt
2. **Agent 1**: Prompt added to `lib/agents/conversation-extractor-agent.ts`
3. **Agent 2A/2B**: Prompt added to `app/api/analyze-idea/route.ts`
4. **Agent 2C**: Prompt added to `lib/idea-bank/scoring/two-stage-scorer.ts`
5. **Agent 5**: Prompt added to `lib/agents/mentor-agent.ts`
6. **Agent 6**: Created `lib/agents/notification-agent.ts` with prompt
7. **Agent 7**: Created `lib/agents/feature-flag-agent.ts` with prompt

## 📋 Complete Guide

See `docs/AGENT_PROMPTS_GUIDE.md` for:
- Full prompts for each agent
- How to use in Cursor
- Debugging prompts
- Schema awareness

## 🎯 How to Use in Cursor

### Method 1: Reference in Chat
```
@agent-1-prompt How should I handle Tamazight input?
@agent-2a-prompt Improve feasibility scoring for 2G connectivity
```

### Method 2: Edit with Context
When editing a file, Cursor automatically sees the JSDoc prompt at the top and uses it as context.

### Method 3: Global Rules
The `.cursorrules` file provides base context for all agents.

## ✅ Validation

All prompts are now in place. Cursor will:
- ✅ Know the exact schema field names
- ✅ Respect Moroccan context (PDPL, 2G, diaspora)
- ✅ Enforce human-in-the-loop rules
- ✅ Preserve original languages
- ✅ Follow validation workflows

## 🧪 Test It

1. Open any agent file in Cursor
2. Press `Cmd+L` (or `Ctrl+L`)
3. Ask: "What should this agent do according to the prompt?"
4. Cursor should reference the JSDoc comment at the top

