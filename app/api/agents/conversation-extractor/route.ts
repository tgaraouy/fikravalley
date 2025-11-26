/**
 * AGENT 1: Conversation Extractor & Validator API
 * 
 * Following .cursorrules specifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationExtractorAgent, type ExtractionInput } from '@/lib/agents/conversation-extractor-agent';

/**
 * POST /api/agents/conversation-extractor
 * Extract and validate ideas from conversational speech
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.speaker_quote || typeof body.speaker_quote !== 'string') {
      return NextResponse.json(
        { error: 'speaker_quote is required and must be a string' },
        { status: 400 }
      );
    }

    const input: ExtractionInput = {
      speaker_quote: body.speaker_quote,
      speaker_email: body.speaker_email || null,
      speaker_phone: body.speaker_phone || null,
      session_id: body.session_id || null,
      speaker_context: body.speaker_context || null,
    };

    // Extract idea first (to get the extracted data for UI)
    const extracted = await conversationExtractorAgent.extractIdea(input);
    
    if (!extracted) {
      // Provide more helpful error message
      const errorMessage = 
        'No valid idea extracted. This could mean:\n' +
        '- The input does not contain a clear digitization idea\n' +
        '- Confidence score was below 0.70 threshold\n' +
        '- Required fields (problem_title, problem_statement, category) were missing\n' +
        '- Claude API could not parse the input as an idea\n\n' +
        'Try with a more specific input like: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط"';
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          debug: process.env.NODE_ENV === 'development' ? {
            inputLength: input.speaker_quote.length,
            hasPhone: !!input.speaker_phone,
            hasEmail: !!input.speaker_email,
          } : undefined,
        },
        { status: 200 }
      );
    }

    // Process extraction (saves to DB)
    const result = await conversationExtractorAgent.processExtraction(input);

    if (!result.success) {
      // Even if processExtraction fails, return the extracted data for UI
      return NextResponse.json({
        success: false,
        data: {
          problem_title: extracted.problem_title,
          problem_statement: extracted.problem_statement,
          proposed_solution: extracted.proposed_solution,
          category: extracted.category,
          location: extracted.location,
          confidence_score: extracted.confidence_score,
          needs_clarification: extracted.needs_clarification,
          validation_question: extracted.validation_question,
        },
        message: 'Idea extracted but could not be saved. You can still submit manually.',
      });
    }

    // Return result with extracted data for UI
    return NextResponse.json({
      success: true,
      data: {
        problem_title: extracted.problem_title,
        problem_statement: extracted.problem_statement,
        proposed_solution: extracted.proposed_solution,
        category: extracted.category,
        location: extracted.location,
        confidence_score: extracted.confidence_score,
        needs_clarification: extracted.needs_clarification,
        validation_question: extracted.validation_question,
      },
      conversationIdeaId: result.conversationIdeaId,
      ideaId: result.ideaId,
      needsValidation: result.needsValidation,
      validationQuestion: result.validationQuestion,
      message: result.needsValidation
        ? 'Idea extracted. Validation required via WhatsApp.'
        : 'Idea extracted and auto-promoted to main ideas table.',
    });
  } catch (error) {
    console.error('Error in conversation-extractor API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

