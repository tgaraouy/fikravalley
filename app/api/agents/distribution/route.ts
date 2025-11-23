/**
 * Distribution Channel Mapping API
 */

import { NextRequest, NextResponse } from 'next/server';
import { DistributionAgent } from '@/lib/agents/distribution-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, generatePosts, postCount } = body;

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea is required' },
        { status: 400 }
      );
    }

    const agent = new DistributionAgent(process.env.ANTHROPIC_API_KEY);
    const channels = await agent.mapChannels(idea);

    let posts: { post: string; platform: 'reddit' | 'linkedin'; best_time: string }[] | null = null;
    if (generatePosts) {
      posts = await agent.generateContentPosts(idea, postCount || 5);
    }

    return NextResponse.json({
      success: true,
      data: {
        channels,
        posts
      }
    });
  } catch (error: any) {
    console.error('Error mapping distribution:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

