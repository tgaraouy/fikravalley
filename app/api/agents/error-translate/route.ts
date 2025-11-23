/**
 * Error Translation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ErrorTranslator } from '@/lib/agents/error-translator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error } = body;

    if (!error) {
      return NextResponse.json(
        { success: false, error: 'Error message is required' },
        { status: 400 }
      );
    }

    const translator = new ErrorTranslator();
    const translated = translator.translate(error);
    const formatted = translator.formatForDisplay(error);

    return NextResponse.json({
      success: true,
      data: {
        translated,
        formatted
      }
    });
  } catch (error: any) {
    console.error('Error translating error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

