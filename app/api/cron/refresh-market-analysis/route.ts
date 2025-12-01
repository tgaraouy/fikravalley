/**
 * API: Refresh Market Analysis (Cron Job)
 * 
 * Re-analyzes ideas that haven't been analyzed in the last X days
 * or have low confidence scores
 * 
 * This endpoint should be called periodically (e.g., weekly) via cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !apiKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * GET: Refresh market analysis for ideas that need updating
 * 
 * Query params:
 * - days: Number of days since last analysis (default: 90)
 * - minConfidence: Minimum confidence score to trigger refresh (default: 0.6)
 * - limit: Maximum number of ideas to refresh (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (if set)
    const cronSecret = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const daysSinceAnalysis = parseInt(searchParams.get('days') || '90');
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.6');
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = getSupabase();

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceAnalysis);

    // Find ideas that need refresh:
    // 1. No analysis yet
    // 2. Analysis older than X days
    // 3. Low confidence score
    const { data: ideasToRefresh, error: fetchError } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, proposed_solution, category, location, ai_market_analysis')
      .eq('visible', true) // Only refresh public ideas
      .or(`ai_market_analysis.is.null,ai_market_analysis->>analyzed_at.lt.${cutoffDate.toISOString()},ai_market_analysis->>confidence_score.lt.${minConfidence}`)
      .limit(limit);

    if (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching ideas to refresh:', fetchError);
      }
      return NextResponse.json(
        { error: 'Failed to fetch ideas', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!ideasToRefresh || ideasToRefresh.length === 0) {
      return NextResponse.json({
        message: 'No ideas need refreshing',
        refreshed: 0,
        total: 0,
      });
    }

    // Import the market analysis generation function
    // For now, we'll trigger the API endpoint for each idea
    // In production, you might want to import the function directly
    const refreshed: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const idea of (ideasToRefresh || [])) {
      try {
        // Call the market analysis generation endpoint
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000');
        
        const response = await fetch(`${baseUrl}/api/ideas/${(idea as any).id}/market-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Internal call - no auth needed if same service
          },
        });

        if (response.ok) {
          refreshed.push((idea as any).id);
        } else {
          const errorData = await response.json();
          failed.push({ id: (idea as any).id, error: errorData.error || 'Unknown error' });
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        failed.push({ id: (idea as any).id, error: error.message || 'Unknown error' });
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error refreshing idea ${(idea as any).id}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: `Refreshed ${refreshed.length} of ${ideasToRefresh.length} ideas`,
      refreshed: refreshed.length,
      failed: failed.length,
      total: ideasToRefresh.length,
      refreshedIds: refreshed,
      failedIds: failed,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/cron/refresh-market-analysis:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

