/**
 * AI Suggestion API Endpoint
 * 
 * Provides real-time suggestions for form fields as users type.
 */

import { NextRequest, NextResponse } from 'next/server';
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field, currentValue, context, language } = body;

    if (!field || !currentValue) {
      return NextResponse.json(
        { error: 'Field and currentValue are required' },
        { status: 400 }
      );
    }

    const lang = language || 'fr';

    // Build field-specific prompts
    const fieldPrompts: Record<string, string> = {
      problemStatement: lang === 'darija'
        ? `Analyse had l-problème w 3awni b suggestion bach ykon or7. 
        
Current: ${currentValue}

Jawb b suggestion m7dda, w 3tini reason.`
        : `Analyse ce problème et suggère une amélioration pour le rendre plus clair et impactant.

Texte actuel: ${currentValue}

Fournis une suggestion concrète et une raison.`,
      
      asIsAnalysis: lang === 'darija'
        ? `Analyse had l-processus l-7ali w 3awni b suggestion.
        
Current: ${currentValue}

Jawb b suggestion m7dda.`
        : `Analyse ce processus actuel et suggère une amélioration pour le rendre plus détaillé.

Texte actuel: ${currentValue}

Fournis une suggestion concrète.`,
      
      benefitStatement: lang === 'darija'
        ? `Analyse had l-benefits w 3awni b suggestion bach ykon quantified.
        
Current: ${currentValue}

Jawb b suggestion m7dda.`
        : `Analyse ces bénéfices et suggère une amélioration pour les quantifier.

Texte actuel: ${currentValue}

Fournis une suggestion concrète.`,
    };

    const prompt = fieldPrompts[field] || 
      (lang === 'darija'
        ? `Analyse had l-text w 3awni b suggestion.
        
Current: ${currentValue}

Jawb b suggestion m7dda.`
        : `Analyse ce texte et suggère une amélioration.

Texte actuel: ${currentValue}

Fournis une suggestion concrète.`);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse response to extract suggestion and reason
    const responseText = content.text;
    
    // Try to extract structured data
    let suggestion = responseText;
    let reason = 'Amélioration suggérée par l\'IA';
    let confidence = 0.7;

    // Look for patterns like "Suggestion: ..." or "Reason: ..."
    const suggestionMatch = responseText.match(/(?:Suggestion|Suggestion d'IA|Suggestion):\s*(.+?)(?:\n|$)/i);
    if (suggestionMatch) {
      suggestion = suggestionMatch[1].trim();
    }

    const reasonMatch = responseText.match(/(?:Reason|Raison|Pourquoi):\s*(.+?)(?:\n|$)/i);
    if (reasonMatch) {
      reason = reasonMatch[1].trim();
    }

    // Calculate confidence based on response length and structure
    if (suggestion.length > 50 && suggestion.length < 500) {
      confidence = 0.8;
    }

    return NextResponse.json({
      suggestion,
      reason,
      confidence,
    });
  } catch (error) {
    console.error('Error in AI suggest:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestion' },
      { status: 500 }
    );
  }
}

