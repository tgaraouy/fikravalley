/**
 * Agent Orchestration API
 */

import { NextRequest, NextResponse } from 'next/server';
// Legacy orchestrator import removed in favor of AlMa3qoolAgent.
// This endpoint is currently not wired to the new agent system and acts as a no-op.

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: false,
      error: 'Legacy orchestrator disabled. Use /api/agent/execute instead.'
    });
  } catch (error: any) {
    console.error('Error orchestrating agents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

