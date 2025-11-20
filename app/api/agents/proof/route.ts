/**
 * PROOF Agent API Route
 * Receipt validation and collection strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import ProofAgent from '@/lib/agents/proof-agent';

const proofAgent = new ProofAgent();

// Generate receipt collection strategy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'generate_strategy') {
      const { problem, solution, category } = data;
      
      if (!problem || !solution) {
        return NextResponse.json({
          success: false,
          error: 'Problem and solution are required'
        }, { status: 400 });
      }

      const strategy = await proofAgent.generateStrategy({
        problem,
        solution,
        category
      });

      return NextResponse.json({
        success: true,
        data: strategy
      });
    }

    if (action === 'provide_coaching') {
      const { currentCount, target = 50 } = data;
      
      const coaching = await proofAgent.provideCoaching(currentCount, target);

      return NextResponse.json({
        success: true,
        data: coaching
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use generate_strategy or provide_coaching'
    }, { status: 400 });

  } catch (error: any) {
    console.error('PROOF Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process PROOF agent request'
    }, { status: 500 });
  }
}

// GET endpoint for agent status
export async function GET() {
  return NextResponse.json({
    success: true,
    agent: 'PROOF',
    status: 'operational',
    capabilities: [
      'strategy_generation',
      'receipt_validation',
      'progress_coaching',
      'fraud_detection'
    ]
  });
}

