/**
 * Al-Ma3qool Protocol v2.0 - Agent Execution Endpoint
 * 
 * This is the ONLY entry point for agent actions.
 * No UI pages, no forms—just intent execution.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlMa3qoolAgent } from '@/lib/agents/orchestrator';
import type { Intent } from '@/lib/api/permissions';

/**
 * POST: Execute an agent intent
 * 
 * Body:
 * {
 *   intent: 'validate-idea' | 'activate-daret' | 'submit-intilaka',
 *   context: {
 *     userId: string,
 *     userPhone: string,
 *     ideaId?: string,
 *     priority?: string,
 *     priorities?: string[]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent, context } = body;

    // Validate intent
    const validIntents: Intent[] = ['validate-idea', 'activate-daret', 'submit-intilaka'];
    if (!validIntents.includes(intent)) {
      return NextResponse.json(
        { error: `Invalid intent. Must be one of: ${validIntents.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate context
    if (!context?.userId || !context?.userPhone) {
      return NextResponse.json(
        { error: 'Missing required context: userId, userPhone' },
        { status: 400 }
      );
    }

    // Create agent and execute
    const agent = new AlMa3qoolAgent(intent, context);
    const result = await agent.execute();

    // Return result (usually a disposable UI spec)
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in agent execution:', error);
    }
    return NextResponse.json(
      { 
        error: 'Agent execution failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

