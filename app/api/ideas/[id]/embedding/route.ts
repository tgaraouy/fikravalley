/**
 * API: Generate Embedding for an Idea
 * 
 * POST /api/ideas/[id]/embedding
 * Generates a vector embedding for an idea and stores it in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateIdeaEmbedding } from '@/lib/ai/embeddings';
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
      .select('id, title, problem_statement, proposed_solution, category')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Generate embedding
    const embedding = await generateIdeaEmbedding({
      title: (idea as any).title,
      problem_statement: (idea as any).problem_statement,
      proposed_solution: (idea as any).proposed_solution,
      category: (idea as any).category,
    });

    // Store embedding in database
    // Supabase/PostgreSQL pgvector expects the embedding as an array
    // The Supabase client should handle the conversion automatically
    const { error: updateError } = await (supabase as any)
      .from('marrai_ideas')
      .update({ embedding })
      .eq('id', id);

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating embedding:', updateError);
      }
      return NextResponse.json(
        { error: 'Failed to save embedding', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ideaId: id,
      embeddingDimensions: embedding.length,
    });
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

