/**
 * API: Analyze Problem Sharpness
 * 
 * POST: Analyzes problem statement sharpness using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeProblemSharpness } from '@/lib/ai/problem-sharpness';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Fetch idea
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('id, title, problem_statement, category')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Analyze problem sharpness
    const analysis = await analyzeProblemSharpness(
      (idea as any).problem_statement || '',
      (idea as any).title || '',
      (idea as any).category || ''
    );

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error analyzing problem sharpness:', error);
    }
    return NextResponse.json(
      { error: 'Failed to analyze problem sharpness', details: error.message },
      { status: 500 }
    );
  }
}

