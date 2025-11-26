/**
 * Agent 7: Feature Flag & Priority API
 * 
 * Endpoint to trigger feature flagging when ideas become matched
 */

import { NextRequest, NextResponse } from 'next/server';
import { featureFlagAgent } from '@/lib/agents/feature-flag-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, action } = body;

    if (action === 'process') {
      if (!ideaId) {
        return NextResponse.json(
          { success: false, error: 'ideaId is required for process action' },
          { status: 400 }
        );
      }

      // Process feature flagging for the idea
      const result = await featureFlagAgent.processFeatureFlag(ideaId);

      return NextResponse.json({
        success: result.success,
        ideaId: result.ideaId,
        updates: result.updates,
        reason: result.reason,
        errors: result.errors,
      });
    } else if (action === 'get_review_queue') {
      // Get ideas that need admin review
      const limit = body.limit || 50;
      const ideas = await featureFlagAgent.getIdeasNeedingReview(limit);

      return NextResponse.json({
        success: true,
        ideas,
        count: ideas.length,
      });
    } else if (action === 'analyze') {
      if (!ideaId) {
        return NextResponse.json(
          { success: false, error: 'ideaId is required for analyze action' },
          { status: 400 }
        );
      }

      // Analyze idea without updating (preview)
      const { data: idea, error } = await featureFlagAgent.getIdea(ideaId);

      if (error || !idea) {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        );
      }

      const analysis = featureFlagAgent.analyzeIdea(idea);

      return NextResponse.json({
        success: true,
        analysis,
        current: {
          featured: (idea as any).featured,
          priority: (idea as any).priority,
          visible: (idea as any).visible || false,
          qualification_tier: (idea as any).qualification_tier,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "process", "get_review_queue", or "analyze"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Feature flag agent API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

