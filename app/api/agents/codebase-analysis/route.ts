/**
 * Codebase Analysis API
 */

import { NextRequest, NextResponse } from 'next/server';
import { CodebaseAnalyzer } from '@/lib/agents/codebase-analyzer';

export async function GET(request: NextRequest) {
  try {
    const analyzer = new CodebaseAnalyzer();
    const analysis = await analyzer.analyzeCodebase();
    const markdown = analyzer.generateMarkdownReport(analysis);

    return NextResponse.json({
      success: true,
      data: analysis,
      markdown
    });
  } catch (error: any) {
    console.error('Error analyzing codebase:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

