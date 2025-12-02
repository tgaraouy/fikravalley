/**
 * API: Generate Market Analysis for Idea
 * 
 * POST: Generate market analysis using LLM and store in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface MarketAnalysis {
  analyzed_at?: string;
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

async function generateMarketAnalysis(
  idea: {
    id: string;
    title: string;
    problem_statement: string;
    proposed_solution?: string | null;
    category?: string | null;
    location?: string | null;
  },
  provider: 'anthropic' | 'openai' | 'gemini' | 'openrouter' = 'anthropic'
): Promise<MarketAnalysis | null> {
  const prompt = `Analyse le potentiel de marché pour cette idée de startup marocaine:

Titre: ${idea.title}
Problème: ${idea.problem_statement}
Solution: ${idea.proposed_solution || 'N/A'}
Catégorie: ${idea.category || 'N/A'}
Localisation: ${idea.location || 'N/A'}

Fournis une analyse de marché complète en format JSON. Concentre-toi sur:
1. Taille du marché au Maroc (en DH) avec contexte
2. Top 3-5 concurrents au Maroc (si existants)
3. Tendances actuelles du marché pertinentes pour le Maroc
4. Potentiel à court terme (0-6 mois) et à long terme (6+ mois)
5. Évaluation de la scalabilité
6. Risques clés (marché, technique, réglementaire) avec stratégies d'atténuation
7. Opportunités spécifiques au contexte marocain
8. Sources/références si disponibles (optionnel)
9. Score de confiance (0-1) basé sur les informations disponibles

Retourne UNIQUEMENT un JSON valide correspondant à cette structure:
{
  "analyzed_at": "ISO timestamp",
  "market_size": {
    "value": "ex: 50M ou 1.2B",
    "unit": "DH",
    "description": "Contexte bref sur la taille du marché"
  },
  "competitors": [
    {
      "name": "Nom du concurrent",
      "description": "Ce qu'ils font",
      "market_share": "Part de marché estimée si connue"
    }
  ],
  "trends": ["Tendance 1", "Tendance 2"],
  "potential": {
    "short_term": "Potentiel 0-6 mois",
    "long_term": "Potentiel 6+ mois",
    "scalability": "Évaluation de la scalabilité"
  },
  "risks": [
    {
      "type": "marché|technique|réglementaire",
      "description": "Description du risque",
      "mitigation": "Comment atténuer"
    }
  ],
  "opportunities": [
    {
      "area": "Domaine d'opportunité",
      "description": "Description",
      "impact": "Impact potentiel"
    }
  ],
  "sources": [
    {
      "title": "Titre de la source",
      "url": "URL si disponible",
      "type": "article|rapport|étude"
    }
  ],
  "confidence_score": 0.85
}

IMPORTANT:
- Retourne UNIQUEMENT l'objet JSON, pas de markdown, pas de blocs de code
- Utilise des données de marché marocain réalistes
- Si les données de marché ne sont pas disponibles, utilise "inconnu" ou des estimations raisonnables
- Concentre-toi sur le contexte marocain (villes, réglementations, conditions du marché)
- Le score de confiance doit refléter la disponibilité des données (plus bas si données limitées)
- TOUS les textes doivent être en FRANÇAIS`;

  try {
    let responseText = '';

    // Determine provider priority
    const providers: Array<'anthropic' | 'openai' | 'gemini' | 'openrouter'> = [];
    if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
    if (process.env.OPENAI_API_KEY) providers.push('openai');
    if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');
    if (process.env.GEMINI_API_KEY) providers.push('gemini');

    if (providers.length === 0) {
      throw new Error('No LLM API keys found');
    }

    // Use the specified provider or first available
    const selectedProvider = providers.includes(provider) ? provider : providers[0];

    switch (selectedProvider) {
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break;
      }

      case 'openrouter': {
        if (!process.env.OPENROUTER_API_KEY) {
          throw new Error('OPENROUTER_API_KEY not found');
        }
        const openrouter = new OpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
          defaultHeaders: {
            'HTTP-Referer': 'https://fikravalley.com',
            'X-Title': 'Fikra Valley Market Analysis',
          },
        });
        const response = await openrouter.chat.completions.create({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 4000,
        });
        responseText = response.choices[0]?.message?.content || '';
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
      analysis.confidence_score = 0.7;
    }

    return analysis;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error generating market analysis with ${provider}:`, error);
    }
    throw error;
  }
}

/**
 * POST: Generate market analysis for an idea
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Fetch idea
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, proposed_solution, category, location')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Generate market analysis
    const analysis = await generateMarketAnalysis(idea, 'anthropic');

    if (!analysis) {
      return NextResponse.json(
        { error: 'Failed to generate market analysis' },
        { status: 500 }
      );
    }

    // Store in database
    const { error: updateError } = await (supabase as any)
      .from('marrai_ideas')
      .update({ ai_market_analysis: analysis })
      .eq('id', id);

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating market analysis:', updateError);
      }
      return NextResponse.json(
        { error: 'Failed to save market analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/ideas/[id]/market-analysis:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

