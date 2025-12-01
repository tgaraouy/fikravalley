# 📊 AI Market Analysis - LLM Research & Potentiality

## Overview

The `ai_market_analysis` column stores LLM-generated market research and potentiality analysis for ideas. This enables automated market research using AI to assess market size, competitors, trends, opportunities, and risks.

---

## Database Schema

### Column: `ai_market_analysis` (JSONB)

**Table**: `marrai_ideas`

**Type**: JSONB (allows flexible, structured data)

**Migration**: `011_add_ai_market_analysis.sql`

**Indexes**:
- GIN index on entire JSONB column for efficient queries
- Index on `analyzed_at` timestamp for filtering by analysis date

---

## Data Structure

```typescript
interface AIMarketAnalysis {
  analyzed_at?: string; // ISO timestamp when analysis was performed
  market_size?: {
    value?: string; // e.g., "50M", "1.2B"
    unit?: string; // "DH", "EUR", "USD"
    description?: string; // Context about market size
  };
  competitors?: Array<{
    name?: string; // Competitor name
    description?: string; // What they do
    market_share?: string; // Estimated market share
  }>;
  trends?: string[]; // Array of market trends
  potential?: {
    short_term?: string; // 0-6 months potential
    long_term?: string; // 6+ months potential
    scalability?: string; // Scalability assessment
  };
  risks?: Array<{
    type?: string; // Risk category (e.g., "market", "technical", "regulatory")
    description?: string; // Risk description
    mitigation?: string; // How to mitigate
  }>;
  opportunities?: Array<{
    area?: string; // Opportunity area
    description?: string; // Opportunity description
    impact?: string; // Potential impact
  }>;
  sources?: Array<{
    title?: string; // Source title
    url?: string; // Source URL
    type?: string; // "article", "report", "study", etc.
  }>;
  confidence_score?: number; // 0-1 confidence in analysis
}
```

---

## Usage Examples

### 1. **Store Market Analysis**

```typescript
import { createClient } from '@/lib/supabase-server';

const supabase = await createClient();

const marketAnalysis = {
  analyzed_at: new Date().toISOString(),
  market_size: {
    value: "50M",
    unit: "DH",
    description: "Moroccan e-learning market estimated at 50M DH annually"
  },
  competitors: [
    {
      name: "EdTech Platform X",
      description: "Leading e-learning platform in Morocco",
      market_share: "30%"
    }
  ],
  trends: [
    "Growing demand for online education",
    "Mobile-first learning solutions",
    "AI-powered personalized learning"
  ],
  potential: {
    short_term: "High demand in post-COVID era",
    long_term: "Market expected to grow 20% annually",
    scalability: "Can expand to other MENA countries"
  },
  risks: [
    {
      type: "market",
      description: "Saturated market with established players",
      mitigation: "Focus on niche segments (rural areas, specific subjects)"
    }
  ],
  opportunities: [
    {
      area: "Rural education",
      description: "Untapped market in rural Morocco",
      impact: "High - addresses digital divide"
    }
  ],
  sources: [
    {
      title: "Morocco Education Market Report 2024",
      url: "https://example.com/report",
      type: "report"
    }
  ],
  confidence_score: 0.85
};

await supabase
  .from('marrai_ideas')
  .update({ ai_market_analysis: marketAnalysis })
  .eq('id', ideaId);
```

### 2. **Query Ideas with Market Analysis**

```typescript
// Get ideas with market analysis
const { data } = await supabase
  .from('marrai_ideas')
  .select('id, title, ai_market_analysis')
  .not('ai_market_analysis', 'is', null);

// Filter by confidence score
const { data: highConfidence } = await supabase
  .from('marrai_ideas')
  .select('*')
  .gte('ai_market_analysis->>confidence_score', '0.8');
```

### 3. **Update Market Analysis**

```typescript
// Update specific fields
const { data } = await supabase
  .from('marrai_ideas')
  .select('ai_market_analysis')
  .eq('id', ideaId)
  .single();

const updatedAnalysis = {
  ...data.ai_market_analysis,
  trends: [...(data.ai_market_analysis?.trends || []), "New trend identified"],
  analyzed_at: new Date().toISOString()
};

await supabase
  .from('marrai_ideas')
  .update({ ai_market_analysis: updatedAnalysis })
  .eq('id', ideaId);
```

---

## LLM Integration

### Example: Generate Market Analysis

```typescript
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';

async function generateMarketAnalysis(idea: {
  title: string;
  problem_statement: string;
  proposed_solution?: string;
  category?: string;
  location?: string;
}) {
  const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Analyze the market potential for this Moroccan startup idea:

Title: ${idea.title}
Problem: ${idea.problem_statement}
Solution: ${idea.proposed_solution || 'N/A'}
Category: ${idea.category || 'N/A'}
Location: ${idea.location || 'N/A'}

Provide a comprehensive market analysis including:
1. Market size (in DH) with context
2. Top 3-5 competitors in Morocco
3. Current market trends
4. Short-term and long-term potential
5. Key risks and mitigation strategies
6. Opportunities
7. Sources/references (if available)
8. Confidence score (0-1)

Return as JSON matching this structure:
{
  "analyzed_at": "ISO timestamp",
  "market_size": { "value": "...", "unit": "DH", "description": "..." },
  "competitors": [...],
  "trends": [...],
  "potential": { "short_term": "...", "long_term": "...", "scalability": "..." },
  "risks": [...],
  "opportunities": [...],
  "sources": [...],
  "confidence_score": 0.85
}`;

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const analysis = JSON.parse(response.content[0].text);
  
  return analysis;
}
```

---

## API Endpoint Example

```typescript
// app/api/ideas/[id]/market-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateMarketAnalysis } from '@/lib/ai/market-analyzer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Fetch idea
  const supabase = await createClient();
  const { data: idea, error } = await supabase
    .from('marrai_ideas')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  // Generate market analysis
  const analysis = await generateMarketAnalysis({
    title: idea.title,
    problem_statement: idea.problem_statement,
    proposed_solution: idea.proposed_solution,
    category: idea.category,
    location: idea.location,
  });

  // Store in database
  const { error: updateError } = await supabase
    .from('marrai_ideas')
    .update({ ai_market_analysis: analysis })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
  }

  return NextResponse.json({ analysis });
}
```

---

## Benefits

1. **Automated Research**: LLM can research market conditions, competitors, and trends
2. **Structured Data**: JSONB allows flexible, queryable structure
3. **Efficient Queries**: GIN index enables fast searches on analysis data
4. **Versioning**: Can track when analysis was performed via `analyzed_at`
5. **Confidence Tracking**: `confidence_score` helps assess analysis quality

---

## Next Steps

1. **Create Market Analyzer Agent**: Build LLM agent to generate market analysis
2. **Add UI Component**: Display market analysis on idea detail pages
3. **Batch Processing**: Generate analysis for multiple ideas
4. **Refresh Logic**: Re-analyze when market conditions change
5. **Integration**: Connect with external market research APIs

---

**Status**: ✅ Database column added. Ready for LLM integration.

