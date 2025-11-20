/**
 * DOC Agent API Route
 * Auto-generate funding documents (Intilaka, business plans, pitch decks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocAgent } from '@/lib/agents/doc-agent';

const docAgent = new DocAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'check_readiness') {
      const { idea } = data;
      
      if (!idea) {
        return NextResponse.json({
          success: false,
          error: 'Idea data is required'
        }, { status: 400 });
      }

      // Calculate completeness score manually
      let completeness = 0;
      if (idea.problem?.description) completeness += 25;
      if (idea.solution?.description) completeness += 25;
      if (idea.operations?.description) completeness += 25;
      if (idea.receipts && idea.receipts.length >= 30) completeness += 25;

      return NextResponse.json({
        success: true,
        data: {
          completenessScore: completeness,
          ready: completeness >= 75,
          message: completeness >= 75 
            ? 'Prêt pour documents!' 
            : `${completeness}% complet - continuez!`,
          availableDocs: completeness >= 75 
            ? ['intilaka_pdf', 'business_plan', 'one_pager']
            : []
        }
      });
    }

    if (action === 'generate_intilaka_pdf') {
      const { idea, user } = data;
      
      const pdfData = await docAgent.generateIntilakaPDF(idea, user);

      return NextResponse.json({
        success: true,
        data: pdfData
      });
    }

    if (action === 'generate_business_plan') {
      const { idea } = data;
      
      const businessPlan = await docAgent.generateBusinessPlan(idea);

      return NextResponse.json({
        success: true,
        data: businessPlan
      });
    }

    if (action === 'generate_pitch_deck') {
      const { idea, audience = 'investor' } = data;
      
      const pitchDeck = await docAgent.generatePitchDeck(idea, audience);

      return NextResponse.json({
        success: true,
        data: pitchDeck
      });
    }

    if (action === 'generate_one_pager') {
      const { idea } = data;
      
      const onePager = await docAgent.generateOnePager(idea);

      return NextResponse.json({
        success: true,
        data: onePager
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use check_readiness, generate_intilaka_pdf, generate_business_plan, generate_pitch_deck, or generate_one_pager'
    }, { status: 400 });

  } catch (error: any) {
    console.error('DOC Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process DOC agent request'
    }, { status: 500 });
  }
}

// GET endpoint for agent status
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'DOC',
    status: 'operational',
    capabilities: [
      'intilaka_pdf',
      'business_plans',
      'pitch_decks',
      'one_pagers',
      'completeness_analysis'
    ]
  });
}

