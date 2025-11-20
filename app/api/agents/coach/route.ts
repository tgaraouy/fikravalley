/**
 * COACH Agent API Route
 * Long-term journey guidance with 15 milestones
 */

import { NextRequest, NextResponse } from 'next/server';
import { CoachAgent } from '@/lib/agents/coach-agent';

const coachAgent = new CoachAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'track_journey') {
      const { userId, ideaId, mockIdea } = data;
      
      if (!userId || !ideaId) {
        return NextResponse.json({
          success: false,
          error: 'userId and ideaId are required'
        }, { status: 400 });
      }

      const journey = await coachAgent.trackJourney(userId, ideaId, mockIdea);

      return NextResponse.json({
        success: true,
        data: journey
      });
    }

    if (action === 'get_daily_coaching') {
      const { userId, userName, journey } = data;
      
      if (!userId || !journey) {
        return NextResponse.json({
          success: false,
          error: 'userId and journey are required'
        }, { status: 400 });
      }

      const message = await coachAgent.provideDailyCoaching(userId, userName || 'Entrepreneur', journey);

      return NextResponse.json({
        success: true,
        data: message
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use track_journey or get_daily_coaching'
    }, { status: 400 });

  } catch (error: any) {
    console.error('COACH Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process COACH agent request'
    }, { status: 500 });
  }
}

// GET endpoint for agent status
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'COACH',
    status: 'operational',
    capabilities: [
      'journey_tracking',
      'milestone_detection',
      'daily_coaching',
      'weekly_reflections',
      'thinking_depth_assessment',
      'celebration_generation'
    ]
  });
}

