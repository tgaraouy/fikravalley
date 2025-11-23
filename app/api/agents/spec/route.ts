/**
 * Spec Generation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { SpecAgent } from '@/lib/agents/spec-agent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea } = body;

    if (!idea) {
      return NextResponse.json(
        { success: false, error: 'Idea is required' },
        { status: 400 }
      );
    }

    const agent = new SpecAgent(process.env.ANTHROPIC_API_KEY);
    const spec = await agent.generateSpec(idea);

    return NextResponse.json({ success: true, data: spec });
  } catch (error: any) {
    console.error('Error generating spec:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

