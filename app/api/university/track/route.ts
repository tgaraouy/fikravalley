/**
 * Track University Module Engagement
 * 
 * Track link clicks (not form submissions)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, action } = body;

    // In production, store in database
    console.log(`Module ${moduleId} - Action: ${action}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

