/**
 * Agent 6: Notification & Sharing API
 * 
 * Endpoint to trigger notifications when ideas become visible/featured
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationAgent } from '@/lib/agents/notification-agent';

/**
 * GET: Generate share text for an idea
 * Query params: ideaId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');
    const action = searchParams.get('action') || 'generateShareText';

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: 'ideaId is required' },
        { status: 400 }
      );
    }

    if (action === 'generateShareText') {
      // Generate share text only (no notifications)
      const shareText = await notificationAgent.generateShareText(ideaId);
      
      if (!shareText) {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ...shareText,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "generateShareText"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Notification agent API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, action } = body;

    if (!ideaId) {
      return NextResponse.json(
        { success: false, error: 'ideaId is required' },
        { status: 400 }
      );
    }

    if (action === 'notify') {
      // Trigger full notification process
      const result = await notificationAgent.processNotification(ideaId);
      
      return NextResponse.json({
        success: result.success,
        mentorsNotified: result.mentorsNotified,
        errors: result.errors,
        socialShareText: result.socialShareText,
      });
    } else if (action === 'generate_share_text' || action === 'generateShareText') {
      // Generate share text only (no notifications)
      const shareText = await notificationAgent.generateShareText(ideaId);
      
      if (!shareText) {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        ...shareText,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "notify" or "generate_share_text"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Notification agent API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

