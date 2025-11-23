/**
 * API: Content Moderation Check
 * 
 * Public endpoint to check content before submission
 */

import { NextRequest, NextResponse } from 'next/server';
import { moderateContent, sanitizeContent } from '@/lib/moderation/content-moderation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type, strict } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const moderation = moderateContent(text, {
      type: type || 'text',
      strict: strict || false
    });

    const sanitized = sanitizeContent(text);

    return NextResponse.json({
      allowed: moderation.allowed,
      reason: moderation.reason,
      severity: moderation.severity,
      flaggedWords: moderation.flaggedWords,
      suggestions: moderation.suggestions,
      sanitized: sanitized !== text ? sanitized : undefined
    });
  } catch (error) {
    console.error('Error in moderation check:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur interne',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

