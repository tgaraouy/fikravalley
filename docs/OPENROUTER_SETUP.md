# 🔑 OpenRouter Setup for Market Analysis

## Overview

OpenRouter provides access to multiple LLM models (Claude, GPT, Gemini, etc.) through a single API key. This is useful for:
- **Cost optimization**: Choose cheaper models for bulk operations
- **Reliability**: Automatic fallback if one model fails
- **Flexibility**: Switch models without changing code

---

## Setup

### 1. Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up / Log in
3. Go to **Keys** section
4. Create a new API key
5. Copy the key

### 2. Add to Environment Variables

Add to `.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

### 3. Verify Setup

The bulk analysis script will automatically detect and use OpenRouter if the key is present.

---

## Available Models via OpenRouter

The script currently uses:
- **`anthropic/claude-3.5-sonnet`** - High quality, good for analysis

You can modify the model in `scripts/bulk-market-analysis.ts`:

```typescript
const response = await openrouter.chat.completions.create({
  model: 'anthropic/claude-3.5-sonnet', // Change this
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 4000,
});
```

### Popular Models:

**Claude (Anthropic):**
- `anthropic/claude-3.5-sonnet` - Best quality
- `anthropic/claude-3-opus` - Highest quality (expensive)
- `anthropic/claude-3-haiku` - Fast & cheap

**GPT (OpenAI):**
- `openai/gpt-4o` - Latest GPT-4
- `openai/gpt-4o-mini` - Cheaper alternative
- `openai/gpt-3.5-turbo` - Very cheap

**Gemini (Google):**
- `google/gemini-pro-1.5` - Google's best
- `google/gemini-flash-1.5` - Faster version

**Other:**
- `meta-llama/llama-3.1-70b-instruct` - Open source
- `mistralai/mixtral-8x7b-instruct` - Fast & cheap

---

## Cost Comparison

For 555 ideas (4000 tokens each):

| Model | Cost per 1K tokens | Total Cost |
|-------|-------------------|------------|
| `anthropic/claude-3.5-sonnet` | $3.00 | ~$6.66 |
| `openai/gpt-4o-mini` | $0.15 | ~$0.33 |
| `anthropic/claude-3-haiku` | $0.25 | ~$0.56 |
| `google/gemini-pro-1.5` | $1.25 | ~$2.78 |

**Recommendation**: Use `openai/gpt-4o-mini` for bulk analysis (cheapest), `claude-3.5-sonnet` for high-quality individual analyses.

---

## Provider Priority

The script tries providers in this order:

1. **Anthropic** (if `ANTHROPIC_API_KEY` set)
2. **OpenAI** (if `OPENAI_API_KEY` set)
3. **OpenRouter** (if `OPENROUTER_API_KEY` set) ⭐ **NEW**
4. **Gemini** (disabled - model name issues)

If one provider fails, it automatically tries the next.

---

## Benefits of OpenRouter

1. **Single API Key**: Access to multiple models
2. **Cost Tracking**: Dashboard shows usage per model
3. **Automatic Fallback**: Can configure multiple models
4. **Rate Limit Management**: Better than individual APIs
5. **Model Switching**: Easy to change models without code changes

---

## Usage

Once `OPENROUTER_API_KEY` is set, the script automatically uses it:

```bash
npm run analyze:market
```

The script will:
1. Try Anthropic first (if available)
2. Try OpenAI second (if available)
3. Try OpenRouter third (if available)
4. Skip Gemini (disabled)

---

## Troubleshooting

### OpenRouter Not Being Used

**Check:**
```bash
# Verify key is set
echo $OPENROUTER_API_KEY

# Or in PowerShell
$env:OPENROUTER_API_KEY
```

**Solution:**
- Ensure key is in `.env.local`
- Restart the script after adding key

### Model Not Found

**Error:**
```
Model 'anthropic/claude-3.5-sonnet' not found
```

**Solution:**
- Check model name is correct
- Visit [OpenRouter Models](https://openrouter.ai/models) for available models
- Update model name in script

### Rate Limits

**Solution:**
- OpenRouter has generous rate limits
- If hit, script will try next provider
- Check OpenRouter dashboard for usage

---

**Status**: ✅ OpenRouter support added. Add `OPENROUTER_API_KEY` to `.env.local` to use it.

