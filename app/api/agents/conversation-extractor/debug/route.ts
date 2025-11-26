/**
 * Debug endpoint for Agent 1
 * Helps diagnose why extraction might be failing
 */

import { NextRequest, NextResponse } from 'next/server';
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';

function cleanJsonResponse(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
  cleaned = cleaned.trim();
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { speaker_quote } = body;

    if (!speaker_quote) {
      return NextResponse.json(
        { error: 'speaker_quote is required' },
        { status: 400 }
      );
    }

    const prompt = `Tu es un assistant IA pour entrepreneurs marocains. Extrais des données structurées à partir d'un message vocal conversationnel.

MESSAGE VOCAL:
"${speaker_quote}"

INSTRUCTIONS:
1. Identifie si ce message contient une idée de problème ou d'opportunité de numérisation
2. Si oui, extrais:
   - problem_title: Titre concis (MAX 5 mots) dans la langue originale du locuteur (Darija/Tamazight/Français)
   - problem_statement: Description en 1 phrase dans la langue originale
   - proposed_solution: Solution proposée en 1 phrase si mentionnée (sinon null), dans la langue originale
   - category: UNIQUEMENT une de ces valeurs: health, education, agriculture, tech, infrastructure, administration, logistics, finance, customer_service, inclusion, other
   - location: Si mentionnée: casablanca, rabat, marrakech, kenitra, tangier, agadir, fes, meknes, oujda, ou 'other'. Sinon null.
   - confidence_score: Score entre 0.00 et 1.00 (0.70 minimum pour être valide)
   - needs_clarification: true si quelque chose n'est pas clair (terme ambigu, contexte manquant, etc.)
   - validation_question: Si needs_clarification=true, génère une question en Darija pour clarifier. Format: "شنو كتعني ب '{terme_ambigu}'؟" (What do you mean by 'X'?)

3. Si le message ne contient PAS d'idée claire, retourne null (littéralement la chaîne "null")
4. Si confidence_score < 0.70, retourne null (littéralement la chaîne "null")

IMPORTANT:
- Préserve la langue originale (Darija, Tamazight, Français)
- Pour Tamazight, utilise le script Latin pour les champs de schéma
- Sois conservateur: si tu n'es pas sûr, mets needs_clarification=true
- La validation_question doit être en Darija si needs_clarification=true

Format JSON attendu:
{
  "problem_title": "<5 mots max, langue originale>",
  "problem_statement": "<1 phrase, langue originale>",
  "proposed_solution": "<1 phrase si mentionnée, sinon null>",
  "category": "<une des catégories valides>",
  "location": "<location si mentionnée, sinon null>",
  "confidence_score": <0.70-1.00>,
  "needs_clarification": <true/false>,
  "validation_question": "<question en Darija si needs_clarification=true, sinon null>",
  "extraction_reasoning": "<pourquoi tu penses que c'est une idée>"
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire ni markdown. Si aucune idée valide, retourne null.`;

    const debugInfo: any = {
      input: {
        speaker_quote,
        quoteLength: speaker_quote.length,
        hasArabic: /[\u0600-\u06FF]/.test(speaker_quote),
        hasFrench: /[àâäéèêëïîôùûüÿç]/.test(speaker_quote.toLowerCase()),
      },
      claude: {
        model: CLAUDE_MODEL,
        apiKeyPresent: !!process.env.ANTHROPIC_API_KEY,
      },
    };

    try {
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
        return NextResponse.json({
          success: false,
          error: 'Unexpected response type from Claude',
          debug: debugInfo,
        });
      }

      const rawResponse = content.text;
      const cleanedJson = cleanJsonResponse(rawResponse);

      debugInfo.claude.rawResponse = rawResponse;
      debugInfo.claude.cleanedJson = cleanedJson;
      debugInfo.claude.isNull = cleanedJson.trim().toLowerCase() === 'null' || cleanedJson.trim() === '';

      if (debugInfo.claude.isNull) {
        return NextResponse.json({
          success: false,
          reason: 'Claude returned null - no valid idea found',
          debug: debugInfo,
        });
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanedJson);
        debugInfo.parsing = { success: true, parsed };
      } catch (parseError) {
        debugInfo.parsing = {
          success: false,
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        };
        return NextResponse.json({
          success: false,
          reason: 'JSON parsing failed',
          debug: debugInfo,
        });
      }

      // Validation checks
      const validation = {
        hasTitle: !!parsed.problem_title,
        hasStatement: !!parsed.problem_statement,
        hasCategory: !!parsed.category,
        confidenceScore: parsed.confidence_score,
        confidenceValid: parsed.confidence_score >= 0.70,
        categoryValid: ['health', 'education', 'agriculture', 'tech', 'infrastructure', 'administration', 'logistics', 'finance', 'customer_service', 'inclusion', 'other'].includes(parsed.category),
      };

      debugInfo.validation = validation;

      if (!validation.hasTitle || !validation.hasStatement || !validation.hasCategory) {
        return NextResponse.json({
          success: false,
          reason: 'Missing required fields',
          debug: debugInfo,
        });
      }

      if (!validation.confidenceValid) {
        return NextResponse.json({
          success: false,
          reason: `Confidence score too low: ${parsed.confidence_score} (minimum: 0.70)`,
          debug: debugInfo,
        });
      }

      if (!validation.categoryValid) {
        return NextResponse.json({
          success: false,
          reason: `Invalid category: ${parsed.category}`,
          debug: debugInfo,
        });
      }

      return NextResponse.json({
        success: true,
        extracted: parsed,
        debug: debugInfo,
      });
    } catch (claudeError) {
      debugInfo.claude.error = {
        message: claudeError instanceof Error ? claudeError.message : 'Unknown error',
        name: claudeError instanceof Error ? claudeError.name : 'Unknown',
      };
      
      return NextResponse.json({
        success: false,
        reason: 'Claude API error',
        debug: debugInfo,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

