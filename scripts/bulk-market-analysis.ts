/**
 * Bulk Market Analysis Script
 * 
 * Analyzes all existing ideas in marrai_ideas table using LLM
 * to populate ai_market_analysis column
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Progress tracking file
const PROGRESS_FILE = resolve(process.cwd(), 'scripts/market-analysis-progress.json');

interface Progress {
  analyzed: string[]; // Array of idea IDs that have been analyzed
  failed: Array<{ id: string; error: string }>;
  lastRun: string;
  totalAnalyzed: number;
}

interface MarketAnalysis {
  analyzed_at: string;
  market_size?: {
    value?: string;
    unit?: string;
    description?: string;
  };
  competitors?: Array<{
    name?: string;
    description?: string;
    market_share?: string;
  }>;
  trends?: string[];
  potential?: {
    short_term?: string;
    long_term?: string;
    scalability?: string;
  };
  risks?: Array<{
    type?: string;
    description?: string;
    mitigation?: string;
  }>;
  opportunities?: Array<{
    area?: string;
    description?: string;
    impact?: string;
  }>;
  sources?: Array<{
    title?: string;
    url?: string;
    type?: string;
  }>;
  confidence_score?: number;
}

function loadProgress(): Progress {
  if (existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
  return {
    analyzed: [],
    failed: [],
    lastRun: new Date().toISOString(),
    totalAnalyzed: 0,
  };
}

function saveProgress(progress: Progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function generateMarketAnalysis(
  idea: {
    id: string;
    title: string;
    problem_statement: string;
    proposed_solution?: string | null;
    category?: string | null;
    location?: string | null;
  },
  provider: 'anthropic' | 'openai' | 'gemini' = 'anthropic'
): Promise<MarketAnalysis | null> {
  const prompt = `Analyze the market potential for this Moroccan startup idea:

Title: ${idea.title}
Problem: ${idea.problem_statement}
Solution: ${idea.proposed_solution || 'N/A'}
Category: ${idea.category || 'N/A'}
Location: ${idea.location || 'N/A'}

Provide a comprehensive market analysis in JSON format. Focus on:
1. Market size in Morocco (in DH) with context
2. Top 3-5 competitors in Morocco (if any)
3. Current market trends relevant to Morocco
4. Short-term potential (0-6 months) and long-term potential (6+ months)
5. Scalability assessment
6. Key risks (market, technical, regulatory) with mitigation strategies
7. Opportunities specific to Moroccan context
8. Sources/references if available (optional)
9. Confidence score (0-1) based on available information

Return ONLY valid JSON matching this structure:
{
  "analyzed_at": "ISO timestamp",
  "market_size": {
    "value": "e.g., 50M or 1.2B",
    "unit": "DH",
    "description": "Brief context about market size"
  },
  "competitors": [
    {
      "name": "Competitor name",
      "description": "What they do",
      "market_share": "Estimated share if known"
    }
  ],
  "trends": ["Trend 1", "Trend 2"],
  "potential": {
    "short_term": "0-6 months potential",
    "long_term": "6+ months potential",
    "scalability": "Scalability assessment"
  },
  "risks": [
    {
      "type": "market|technical|regulatory",
      "description": "Risk description",
      "mitigation": "How to mitigate"
    }
  ],
  "opportunities": [
    {
      "area": "Opportunity area",
      "description": "Description",
      "impact": "Potential impact"
    }
  ],
  "sources": [
    {
      "title": "Source title",
      "url": "URL if available",
      "type": "article|report|study"
    }
  ],
  "confidence_score": 0.85
}

IMPORTANT:
- Return ONLY the JSON object, no markdown, no code blocks
- Use realistic Moroccan market data
- If market data is unavailable, use "unknown" or reasonable estimates
- Focus on Moroccan context (cities, regulations, market conditions)
- Confidence score should reflect data availability (lower if limited data)`;

  try {
    let responseText = '';

    switch (provider) {
      case 'anthropic': {
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY not found');
        }
        const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const response = await claude.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        });
        responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        break;
      }

      case 'openai': {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY not found');
        }
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        });
        responseText = response.choices[0]?.message?.content || '';
        break;
      }

      case 'gemini': {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY not found');
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break;
      }
    }

    // Clean and parse JSON
    let cleaned = responseText.trim();
    
    // Remove markdown code blocks if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }

    // Try to extract JSON from response
    let jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const analysis = JSON.parse(cleaned) as MarketAnalysis;
    
    // Ensure required fields
    if (!analysis.analyzed_at) {
      analysis.analyzed_at = new Date().toISOString();
    }
    if (analysis.confidence_score === undefined) {
      analysis.confidence_score = 0.7; // Default confidence
    }

    return analysis;
  } catch (error: any) {
    console.error(`Error generating analysis for idea ${idea.id}:`, error.message);
    return null;
  }
}

async function analyzeIdea(idea: any, progress: Progress, provider: 'anthropic' | 'openai' | 'gemini'): Promise<boolean> {
  // Skip if already analyzed
  if (progress.analyzed.includes(idea.id)) {
    console.log(`⏭️  Skipping ${idea.id} - already analyzed`);
    return true;
  }

  console.log(`\n📊 Analyzing: ${idea.title.substring(0, 50)}... (${idea.id.substring(0, 8)})`);

  try {
    const analysis = await generateMarketAnalysis(idea, provider);

    if (!analysis) {
      throw new Error('Failed to generate analysis');
    }

    // Save to database
    const { error } = await supabase
      .from('marrai_ideas')
      .update({ ai_market_analysis: analysis })
      .eq('id', idea.id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Update progress
    progress.analyzed.push(idea.id);
    progress.totalAnalyzed = progress.analyzed.length;
    saveProgress(progress);

    console.log(`✅ Analyzed: ${idea.title.substring(0, 50)}`);
    console.log(`   Confidence: ${(analysis.confidence_score || 0) * 100}%`);
    console.log(`   Progress: ${progress.totalAnalyzed} analyzed`);

    return true;
  } catch (error: any) {
    console.error(`❌ Error analyzing ${idea.id}:`, error.message);
    progress.failed.push({ id: idea.id, error: error.message });
    saveProgress(progress);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Bulk Market Analysis\n');
  console.log('=' .repeat(60));

  const progress = loadProgress();
  console.log(`📈 Progress: ${progress.totalAnalyzed} ideas already analyzed`);
  console.log(`❌ Failed: ${progress.failed.length} ideas failed\n`);

  // Determine provider
  const providers: Array<'anthropic' | 'openai' | 'gemini'> = [];
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.GEMINI_API_KEY) providers.push('gemini');

  if (providers.length === 0) {
    throw new Error('No LLM API keys found. Need at least one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY');
  }

  console.log(`🔑 Available providers: ${providers.join(', ')}\n`);

  // Fetch all ideas
  console.log('📥 Fetching ideas from database...');
  let offset = 0;
  const pageSize = 50;
  let allIdeas: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, proposed_solution, category, location')
      .order('created_at', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`Error fetching ideas: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    allIdeas = [...allIdeas, ...data];
    offset += pageSize;

    console.log(`   Fetched ${allIdeas.length} ideas...`);
  }

  console.log(`\n✅ Total ideas found: ${allIdeas.length}\n`);

  // Filter out already analyzed
  const toAnalyze = allIdeas.filter(idea => !progress.analyzed.includes(idea.id));
  console.log(`📋 Ideas to analyze: ${toAnalyze.length}\n`);

  if (toAnalyze.length === 0) {
    console.log('✅ All ideas already analyzed!');
    return;
  }

  // Analyze in batches
  const batchSize = 5; // Process 5 ideas at a time
  const delayBetweenBatches = 10000; // 10 seconds between batches
  const delayBetweenIdeas = 2000; // 2 seconds between ideas

  let providerIndex = 0;

  for (let i = 0; i < toAnalyze.length; i += batchSize) {
    const batch = toAnalyze.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} ideas)...\n`);

    for (const idea of batch) {
      const provider = providers[providerIndex % providers.length];
      providerIndex++;

      await analyzeIdea(idea, progress, provider);

      // Delay between ideas
      if (i + batch.length < toAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenIdeas));
      }
    }

    // Delay between batches
    if (i + batchSize < toAnalyze.length) {
      console.log(`\n⏳ Waiting ${delayBetweenBatches / 1000}s before next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Bulk Analysis Complete!\n');
  console.log(`📊 Total analyzed: ${progress.totalAnalyzed}`);
  console.log(`❌ Failed: ${progress.failed.length}`);
  console.log(`📈 Success rate: ${((progress.totalAnalyzed / allIdeas.length) * 100).toFixed(1)}%`);

  if (progress.failed.length > 0) {
    console.log('\n❌ Failed ideas:');
    progress.failed.slice(0, 10).forEach(({ id, error }) => {
      console.log(`   ${id.substring(0, 8)}: ${error.substring(0, 50)}`);
    });
    if (progress.failed.length > 10) {
      console.log(`   ... and ${progress.failed.length - 10} more`);
    }
  }

  console.log(`\n💾 Progress saved to: ${PROGRESS_FILE}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateMarketAnalysis, analyzeIdea };

