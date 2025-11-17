/**
 * API: Admin Settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Return default settings
    return NextResponse.json({
      scoringWeights: {
        problemStatement: 1.0,
        asIsAnalysis: 1.0,
        benefitStatement: 1.0,
        operationalNeeds: 1.0,
        strategicFit: 1.0,
        feasibility: 1.0,
        differentiation: 1.0,
        evidenceOfDemand: 1.0,
      },
      thresholds: {
        clarityMin: 6,
        decisionMin: 25,
        exceptionalMin: 30,
        qualifiedMin: 25,
      },
      sdgs: [1, 3, 4, 8, 9],
      sectors: ['health', 'education', 'agriculture', 'tech', 'infrastructure', 'administration'],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    // In production, save to database
    // For now, just return success

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

