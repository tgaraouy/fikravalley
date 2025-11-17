/**
 * API: Generate Intilaka PDF
 * 
 * Generates professional PDF application for qualified ideas
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateIntilakaPDF, qualifiesForIntilaka } from '@/lib/idea-bank/intilaka/pdf-generator';

/**
 * POST /api/ideas/[id]/intilaka-pdf
 * Generate Intilaka PDF for an idea
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ideaId = id;

    if (!ideaId) {
      return NextResponse.json(
        { error: 'Idea ID is required' },
        { status: 400 }
      );
    }

    // Check if idea qualifies
    const qualifies = await qualifiesForIntilaka(ideaId);
    if (!qualifies) {
      return NextResponse.json(
        {
          error: 'Idea does not qualify for Intilaka PDF generation',
          message: 'Idea must score ≥25/40 on Stage 2 (Decision)',
        },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfUrl = await generateIntilakaPDF(ideaId);

    return NextResponse.json({
      success: true,
      pdfUrl,
      message: 'PDF généré avec succès',
    });
  } catch (error) {
    console.error('Error generating Intilaka PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ideas/[id]/intilaka-pdf
 * Check if PDF exists and get URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ideaId = id;
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = await createClient();

    const { data: idea } = await supabase
      .from('marrai_ideas')
      .select('intilaka_pdf_url, intilaka_pdf_generated, intilaka_pdf_generated_at')
      .eq('id', ideaId)
      .single();

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    const qualifies = await qualifiesForIntilaka(ideaId);

    return NextResponse.json({
      generated: idea.intilaka_pdf_generated || false,
      pdfUrl: idea.intilaka_pdf_url || null,
      generatedAt: idea.intilaka_pdf_generated_at || null,
      qualifies,
    });
  } catch (error) {
    console.error('Error checking Intilaka PDF:', error);
    return NextResponse.json(
      { error: 'Failed to check PDF status' },
      { status: 500 }
    );
  }
}

