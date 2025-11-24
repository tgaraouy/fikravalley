/**
 * Extract structured idea data from voice transcript
 * 
 * Uses AI to analyze voice transcript and extract all necessary fields
 * for AI agents to analyze, score, and generate documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';

interface ExtractedIdeaData {
  title: string;
  problem_statement: string;
  proposed_solution?: string | null;
  current_manual_process?: string | null;
  digitization_opportunity?: string | null;
  category?: string;
  location?: string;
}

/**
 * Clean JSON response by removing markdown code blocks
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
  cleaned = cleaned.trim();
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, language = 'fr' } = body;

    if (!transcript || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: 'Transcript must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Build prompt for Claude API - Focus on ESSENTIAL fields only
    const prompt = `Tu es un expert en analyse d'idées de numérisation pour le secteur public marocain.

Analyse cette transcription vocale et extrais UNIQUEMENT les champs essentiels pour que les agents IA puissent analyser l'idée.

TRANSCRIPTION VOCALE:
${transcript}

INSTRUCTIONS - EXTRAIS SEULEMENT:
1. **Titre** (max 100 caractères) - Un titre concis de l'idée
2. **Problème** - Description détaillée du problème
3. **Catégorie** - UNIQUEMENT si clairement mentionnée: health, education, agriculture, tech, infrastructure, administration, logistics, finance, customer_service, inclusion, ou 'other'
4. **Localisation** - UNIQUEMENT si clairement mentionnée: casablanca, rabat, marrakech, kenitra, tangier, agadir, fes, meknes, oujda, ou 'other'
5. **Solution proposée** - UNIQUEMENT si mentionnée explicitement
6. **Processus manuel actuel** - UNIQUEMENT si décrit dans le texte
7. **Opportunité de numérisation** - UNIQUEMENT si expliquée dans le texte

IMPORTANT:
- Si une information n'est PAS clairement mentionnée, retourne null
- Ne devine pas - sois conservateur
- L'utilisateur pourra compléter les champs manquants après
- Pour catégorie et localisation, utilise 'other' seulement si vraiment impossible à déterminer

Format JSON attendu (CHAMPS ESSENTIELS SEULEMENT):
{
  "title": "<titre concis, max 100 caractères>",
  "problem_statement": "<description détaillée du problème>",
  "proposed_solution": "<solution si mentionnée, sinon null>",
  "current_manual_process": "<processus manuel si mentionné, sinon null>",
  "digitization_opportunity": "<opportunité si mentionnée, sinon null>",
  "category": "<catégorie si identifiable, sinon 'other'>",
  "location": "<localisation si mentionnée, sinon 'other'>"
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire ni markdown.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    const rawText = content.text;
    const cleanedJson = cleanJsonResponse(rawText);
    
    let extractedData: ExtractedIdeaData;
    try {
      extractedData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.error('Raw response:', rawText);
      
      // Fallback: create minimal structure from transcript
      extractedData = {
        title: transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100),
        problem_statement: transcript,
        category: 'other',
        location: 'other',
      };
    }

    // Validate and set defaults
    if (!extractedData.title) {
      extractedData.title = transcript.split('.')[0].substring(0, 100) || transcript.substring(0, 100);
    }
    if (!extractedData.problem_statement) {
      extractedData.problem_statement = transcript;
    }
    if (!extractedData.category) {
      extractedData.category = 'other';
    }
    if (!extractedData.location) {
      extractedData.location = 'other';
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error('Error extracting idea data from voice:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'extraction des données',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

