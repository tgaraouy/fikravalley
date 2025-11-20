/**
 * FIKRA Agent API Route
 * Real-time idea clarification with Socratic questioning
 */

import { NextRequest, NextResponse } from 'next/server';
import FikraAgent from '@/lib/agents/fikra-agent';

const fikraAgent = new FikraAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draft, previousResponses = [], language = 'fr' } = body;

    if (!draft || !draft.text) {
      return NextResponse.json({
        success: false,
        error: 'Draft text is required'
      }, { status: 400 });
    }

    // Analyze with FIKRA agent
    const response = await fikraAgent.analyze({
      text: draft.text,
      wordCount: draft.wordCount || draft.text.split(/\s+/).length,
      lastUpdated: draft.lastUpdated ? new Date(draft.lastUpdated) : new Date()
    }, previousResponses);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('FIKRA Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze with FIKRA agent'
    }, { status: 500 });
  }
}

// GET endpoint for agent status/health check
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'FIKRA',
    status: 'operational',
    capabilities: [
      'gap_detection',
      'intimacy_scoring',
      'socratic_questioning',
      'multilingual_support'
    ]
  });
}

