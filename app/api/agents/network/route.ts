/**
 * NETWORK Agent API Route
 * Community building and similar idea detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { NetworkAgent } from '@/lib/agents/network-agent';
import { supabase } from '@/lib/supabase';

const networkAgent = new NetworkAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'find_similar_ideas') {
      const { idea, limit = 5 } = data;
      
      if (!idea) {
        return NextResponse.json({
          success: false,
          error: 'Idea data is required'
        }, { status: 400 });
      }

      // Fetch published ideas from database
      const { data: ideas, error } = await supabase
        .from('marrai_ideas')
        .select('*')
        .eq('status', 'approved')
        .limit(100);

      if (error) {
        console.error('Error fetching ideas:', error);
        return NextResponse.json({
          success: true,
          data: [],
          note: 'No ideas available yet'
        });
      }

      const similarIdeas = await networkAgent.findSimilarIdeas(idea, ideas || [], limit);

      return NextResponse.json({
        success: true,
        data: similarIdeas
      });
    }

    if (action === 'find_community') {
      const { idea } = data;
      
      if (!idea) {
        return NextResponse.json({
          success: false,
          error: 'Idea data is required'
        }, { status: 400 });
      }

      const community = await networkAgent.findCommunity(idea);

      return NextResponse.json({
        success: true,
        data: community
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use find_similar_ideas or find_community'
    }, { status: 400 });

  } catch (error: any) {
    console.error('NETWORK Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process NETWORK agent request'
    }, { status: 500 });
  }
}

// GET endpoint for agent status
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'NETWORK',
    status: 'operational',
    capabilities: [
      'similar_idea_detection',
      'commonality_analysis',
      'connection_suggestions',
      'community_detection',
      'peer_learning'
    ]
  });
}

