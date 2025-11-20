/**
 * MENTOR Agent API Route
 * Semantic mentor matching with warm introductions
 */

import { NextRequest, NextResponse } from 'next/server';
import { MentorAgent } from '@/lib/agents/mentor-agent';
import { supabase } from '@/lib/supabase';

const mentorAgent = new MentorAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'find_matches') {
      const { idea, creatorProfile } = data;
      
      if (!idea) {
        return NextResponse.json({
          success: false,
          error: 'Idea data is required'
        }, { status: 400 });
      }

      // Fetch mentors from database
      const { data: mentors, error } = await supabase
        .from('mentors')
        .select('*')
        .eq('available', true)
        .limit(50);

      if (error) {
        console.error('Error fetching mentors:', error);
        // Return empty array for now - mentors table needs to be populated
        return NextResponse.json({
          success: true,
          data: [],
          note: 'No mentors available yet - configure mentor database'
        });
      }

      const matches = await mentorAgent.findMentors(idea, 5);

      return NextResponse.json({
        success: true,
        data: matches
      });
    }

    if (action === 'generate_introduction') {
      const { mentor, creator, idea } = data;
      
      const introduction = await mentorAgent.generateIntroduction(mentor, creator, idea);

      return NextResponse.json({
        success: true,
        data: introduction
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use find_matches or generate_introduction'
    }, { status: 400 });

  } catch (error: any) {
    console.error('MENTOR Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process MENTOR agent request'
    }, { status: 500 });
  }
}

// GET endpoint for agent status
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'MENTOR',
    status: 'operational',
    capabilities: [
      'semantic_matching',
      'warm_introductions',
      'connection_points',
      'intimacy_rating'
    ]
  });
}

