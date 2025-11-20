/**
 * API: WhatsApp Self-Ask Chain Handler
 * 
 * Handles incoming WhatsApp messages for self-ask chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { processSelfAskResponse, startSelfAskChain } from '@/lib/idea-bank/self-ask/chain';
import { createClient } from '@/lib/supabase-server';
import { formatPhoneNumber } from '@/lib/whatsapp';

/**
 * POST /api/whatsapp/self-ask
 * Process incoming WhatsApp message for self-ask chain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, message, ideaId } = body;

    if (!from || !message) {
      return NextResponse.json(
        { error: 'Missing from or message' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(from);
    const supabase = await createClient();

    // Find idea by phone number if ideaId not provided
    let finalIdeaId = ideaId;
    if (!finalIdeaId) {
      const { data: ideas } = await (supabase as any)
        .from('marrai_ideas')
        .select('id')
        .eq('submitter_phone', formattedPhone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (ideas && ideas.length > 0) {
        finalIdeaId = (ideas as any[])[0].id;
      } else {
        return NextResponse.json(
          { error: 'No idea found for this phone number' },
          { status: 404 }
        );
      }
    }

    // Check if self-ask chain is active for this idea
    const { data: activeQuestions } = await (supabase as any)
      .from('marrai_self_ask_questions')
      .select('id')
      .eq('idea_id', finalIdeaId)
      .eq('status', 'asked')
      .limit(1);

    if (!activeQuestions || activeQuestions.length === 0) {
      // Start new chain
      await startSelfAskChain(finalIdeaId, formattedPhone);
      return NextResponse.json({ status: 'started' });
    }

    // Process response
    const result = await processSelfAskResponse(finalIdeaId, message);

    return NextResponse.json({
      status: 'processed',
      nextQuestion: result.nextQuestion?.id || null,
      progress: result.progress,
    });
  } catch (error) {
    console.error('Error processing self-ask response:', error);
    return NextResponse.json(
      { error: 'Failed to process response' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/self-ask?ideaId=xxx
 * Get progress for an idea
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return NextResponse.json(
        { error: 'ideaId is required' },
        { status: 400 }
      );
    }

    const { SelfAskChain } = await import('@/lib/idea-bank/self-ask/chain');
    const chain = new SelfAskChain();
    const progress = await chain.getProgress(ideaId);
    const structuredData = await chain.generateStructuredData(ideaId);

    return NextResponse.json({
      progress,
      structuredData,
    });
  } catch (error) {
    console.error('Error getting self-ask progress:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}

