/**
 * API: Generate UI Mock for an Idea
 *
 * Lightweight, on-demand UI mock using Gemini (nano banana style).
 * No database writes – purely disposable.
 * Route: /api/ideas/[id]/ui-mock
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    if (process.env.NODE_ENV === 'development') {
      console.error('Supabase config missing for UI mock', {
        hasUrl: !!supabaseUrl,
        hasKey: !!apiKey,
      });
    }
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface UIMockLayout {
  screen_title: string;
  description?: string;
  sections: Array<{
    id?: string;
    title: string;
    description?: string;
    suggested_components?: string[];
    cta_buttons?: Array<{
      label: string;
      action_hint?: string;
    }>;
  }>;
}

interface UIMockResponse {
  layout: UIMockLayout;
}

// Test GET handler to verify route is accessible
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json({ 
      message: 'UI Mock route is working',
      ideaId: id,
      method: 'GET',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Route error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, proposed_solution, category')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Use GOOGLE_API_KEY or GEMINI_API_KEY (for backward compatibility)
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY or GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini client (using stable @google/generative-ai SDK)
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash (text-only) since gemini-2.5-flash-image has quota limits
    // The model can still generate UI layouts from text descriptions
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const body = await request.json().catch(() => ({}));
    const locale = body?.locale || 'fr';

    const prompt = `
Tu es un product designer marocain qui conçoit des écrans ultra simples pour GenZ (mobile-first, WhatsApp-native).

IDÉE:
- Titre: ${(idea as any).title}
- Problème: ${(idea as any).problem_statement}
- Solution: ${(idea as any).proposed_solution || 'N/A'}
- Catégorie: ${(idea as any).category || 'N/A'}

TA MISSION:
Proposer un seul écran (mobile) pour tester cette idée rapidement. Pas de dashboard, pas de complexité.

Contraintes:
- Interface pensée pour jeunes marocains (18-28 ans)
- Peut vivre dans WhatsApp ou une petite webview
- Maximum 3 sections
- Maximum 3 boutons d'action

FORMAT DE RÉPONSE:
Retourne UNIQUEMENT un JSON valide qui suit exactement cette structure:
{
  "layout": {
    "screen_title": "string",
    "description": "string (optionnel)",
    "sections": [
      {
        "id": "string (optionnel, slug)",
        "title": "string",
        "description": "string (optionnel)",
        "suggested_components": [
          "Hero simple",
          "Liste de cartes",
          "Bottom sheet CTA"
        ],
        "cta_buttons": [
          {
            "label": "Texte du bouton",
            "action_hint": "Ce que le bouton déclenche (ex: ouvrir WhatsApp, lancer paiement 3 DH, etc.)"
          }
        ]
      }
    ]
  }
}

IMPORTANT:
- Le JSON doit être PARSABLE directement (aucun texte autour, pas de markdown, pas de \`\`\`).
- Adapte les textes au contexte marocain (français + quelques touches Darija si utile).
- Mets l'accent sur une seule action principale (CTA).
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Nettoyage éventuel de blocs de code
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }

    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    let parsed: UIMockResponse;
    try {
      parsed = JSON.parse(text) as UIMockResponse;
    } catch (parseError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse UI mock JSON:', parseError, text);
      }
      return NextResponse.json(
        { error: 'Failed to parse UI mock from model' },
        { status: 500 }
      );
    }

    if (!parsed?.layout || !Array.isArray(parsed.layout.sections)) {
      return NextResponse.json(
        { error: 'Invalid UI mock structure from model' },
        { status: 500 }
      );
    }

    // Petite normalisation
    parsed.layout.screen_title =
      parsed.layout.screen_title || (idea as any).title || 'Écran idée';

    return NextResponse.json(
      {
        uiMock: {
          layout: parsed.layout,
          meta: {
            ideaId: (idea as any).id,
            locale,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/ideas/[id]/ui-mock:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
