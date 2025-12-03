/**
 * API: Extract Idea Metadata
 * 
 * Uses AI to extract metadata from idea transcript
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractIdeaMetadata } from '@/lib/ai/extract-idea-metadata';

/**
 * POST /api/ideas/extract-metadata
 * Extract metadata from idea transcript
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: 'Transcript must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Extract metadata using AI
    const metadata = await extractIdeaMetadata(transcript);

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error extracting metadata:', error);
    }
    return NextResponse.json(
      { 
        error: 'Failed to extract metadata',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

