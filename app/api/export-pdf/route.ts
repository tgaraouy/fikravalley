import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@react-pdf/renderer';
import React from 'react';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { IdeaPDFDocument } from '@/components/pdf/IdeaPDFDocument';

type IdeaRow = Database['public']['Tables']['marrai_ideas']['Row'];

/**
 * POST /api/export-pdf
 * Export an idea to PDF format
 */
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json();
    const { ideaId } = body;

    if (!ideaId || typeof ideaId !== 'string') {
      return NextResponse.json(
        { error: 'ideaId is required and must be a string' },
        { status: 400 }
      );
    }

    // Fetch idea from database
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      console.error('Error fetching idea:', ideaError);
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Fetch agent solution (optional)
    const { data: agentSolution } = await supabase
      .from('marrai_agent_solutions')
      .select('*')
      .eq('idea_id', ideaId)
      .single();

    // Get base URL for footer
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    // Generate PDF
    const pdfDoc = React.createElement(IdeaPDFDocument, {
      idea: idea as IdeaRow,
      agentSolution: agentSolution || null,
      baseUrl,
    });

    // Generate PDF buffer (works in Node.js/server environment)
    const pdfBuffer = await pdf(pdfDoc).toBuffer();

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="idee-${idea.id}-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
