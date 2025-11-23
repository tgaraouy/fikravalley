/**
 * Micro-Module Generation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { MicroModuleGenerator } from '@/lib/agents/micro-module-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    const generator = new MicroModuleGenerator(process.env.ANTHROPIC_API_KEY);
    const module = await generator.generateModule(topic);

    return NextResponse.json({ success: true, data: module });
  } catch (error: any) {
    console.error('Error generating micro-module:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

