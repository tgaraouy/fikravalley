/**
 * AI Chat API Endpoint
 * 
 * Handles real-time chat interactions with AI assistant during idea submission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const language = context?.language || 'fr';
    const step = context?.step || 0;
    const stepName = context?.stepName || '';
    const currentData = context?.currentData || {};
    const conversationHistory = context?.conversationHistory || [];

    // Build context-aware prompt
    const systemPrompt = language === 'darija'
      ? `Nta assistant IA dyal Fikra Valley. 3awni l-user bach ykml soubmission dyal idea. 
      
Context:
- Step: ${stepName || step}
- Current data: ${JSON.stringify(currentData, null, 2)}

Jawb b Darija, w 3awni b suggestions m7dda.`
      : `Tu es un assistant IA pour Fikra Valley. Tu aides les utilisateurs à soumettre leurs idées de numérisation.

Contexte:
- Étape actuelle: ${stepName || step}
- Données actuelles: ${JSON.stringify(currentData, null, 2)}

Réponds en français, sois encourageant et fournis des suggestions concrètes.`;

    // Build conversation history
    const messages = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages as any,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract suggestions and action items from response
    const responseText = content.text;
    const suggestions: string[] = [];
    const actionItems: string[] = [];

    // Simple extraction (can be improved with structured output)
    const suggestionMatches = responseText.match(/💡\s*([^\n]+)/g);
    if (suggestionMatches) {
      suggestions.push(...suggestionMatches.map(m => m.replace(/💡\s*/, '').trim()));
    }

    const actionMatches = responseText.match(/•\s*([^\n]+)/g);
    if (actionMatches) {
      actionItems.push(...actionMatches.map(m => m.replace(/•\s*/, '').trim()));
    }

    return NextResponse.json({
      response: responseText,
      suggestions: suggestions.slice(0, 3), // Max 3 suggestions
      actionItems: actionItems.slice(0, 3), // Max 3 action items
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        response: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
      },
      { status: 500 }
    );
  }
}

