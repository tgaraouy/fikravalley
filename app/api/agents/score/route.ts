/**
 * SCORE Agent API Route
 * Real-time scoring with clarity + intimacy metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScoreAgent } from '@/lib/agents/score-agent';

const scoreAgent = new ScoreAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea } = body;

    if (!idea) {
      return NextResponse.json({
        success: false,
        error: 'Idea data is required'
      }, { status: 400 });
    }

    // Calculate live score
    const score = await scoreAgent.calculateLiveScore(idea);

    return NextResponse.json({
      success: true,
      data: score
    });

  } catch (error: any) {
    console.error('SCORE Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to calculate score'
    }, { status: 500 });
  }
}

// GET endpoint for agent status
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'SCORE',
    status: 'operational',
    capabilities: [
      'real_time_scoring',
      'gap_identification',
      'qualification_tiers',
      'intimacy_tracking'
    ]
  });
}

