import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic';
import { updateSessionStats } from '@/lib/db-helpers';
import type { Database } from '@/lib/supabase';

type TranscriptRow = Database['public']['Tables']['marrai_transcripts']['Row'];
type ConversationIdeaInsert = Database['public']['Tables']['marrai_conversation_ideas']['Insert'];

interface ExtractedIdea {
  problem_title: string;
  problem_statement: string;
  speaker_quote: string;
  speaker_context?: string;
  current_manual_process?: string;
  proposed_solution?: string;
  category?: string;
  digitization_opportunity: string;
  confidence_score: number;
  extraction_reasoning: string;
  mentioned_at_timestamp?: string;
  transcript_ids?: string[];
}

/**
 * Clean JSON response by removing markdown code blocks
 */
function cleanJsonResponse(text: string): string {
  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  let cleaned = text.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
  // Trim whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

/**
 * Combine transcripts into conversation format with timestamps and speakers
 */
function formatConversationText(transcripts: TranscriptRow[]): string {
  return transcripts
    .map((transcript) => {
      const timestamp = transcript.timestamp_in_session || '00:00:00';
      const speaker = transcript.speaker_identified || 'Intervenant';
      const text = transcript.text_cleaned || transcript.text;
      return `[${timestamp}] ${speaker}: ${text}`;
    })
    .join('\n\n');
}

/**
 * Calculate total word count from transcripts
 */
function calculateTotalWordCount(transcripts: TranscriptRow[]): number {
  return transcripts.reduce((total, transcript) => {
    return total + (transcript.word_count || 0);
  }, 0);
}

/**
 * POST /api/extract-ideas
 * Extracts ideas from conversation transcripts using Claude API
 */
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json();
    const { session_id, force_reprocess } = body;

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { error: 'session_id is required and must be a string' },
        { status: 400 }
      );
    }

    // Fetch unprocessed transcripts for this session
    const query = supabase
      .from('marrai_transcripts')
      .select('*')
      .eq('session_id', session_id);

    // Only get unprocessed if not forcing reprocess
    if (!force_reprocess) {
      query.eq('processed', false);
    }

    const { data: transcripts, error: transcriptsError } = await query.order('created_at', {
      ascending: true,
    });

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError);
      return NextResponse.json(
        { error: 'Failed to fetch transcripts' },
        { status: 500 }
      );
    }

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No transcripts found or all already processed',
          ideasExtracted: 0,
        },
        { status: 200 }
      );
    }

    // Check word count threshold (unless force_reprocess)
    if (!force_reprocess) {
      const totalWordCount = calculateTotalWordCount(transcripts);
      if (totalWordCount < 500) {
        return NextResponse.json(
          {
            success: true,
            message: 'Insufficient transcript content (less than 500 words)',
            wordCount: totalWordCount,
            ideasExtracted: 0,
          },
          { status: 200 }
        );
      }
    }

    // Combine transcripts into conversation text
    const conversationText = formatConversationText(transcripts);

    // Build prompt for Claude API
    const prompt = `Tu es un expert en analyse de conversations pour identifier des idées de numérisation dans le secteur public marocain.

Analyse cette conversation et extrais toutes les idées de problèmes ou d'opportunités de numérisation mentionnés.

CONVERSATION:
${conversationText}

INSTRUCTIONS:
1. Identifie les phrases qui mentionnent des problèmes ou opportunités de numérisation
2. Cherche des expressions françaises comme: "le problème c'est", "on pourrait", "il faudrait", "ce serait bien si", "je pense qu'on devrait", "un défi c'est", etc.
3. Pour chaque idée identifiée, extrais:
   - La citation exacte du locuteur (speaker_quote)
   - Le contexte du locuteur si disponible (speaker_context)
   - Un titre de problème concis (problem_title)
   - Une description détaillée du problème (problem_statement)
   - Le processus manuel actuel si mentionné (current_manual_process)
   - La solution proposée si mentionnée (proposed_solution)
   - L'opportunité de numérisation (digitization_opportunity)
   - Une catégorie si identifiable (category: health, education, agriculture, tech, infrastructure, administration, logistics, finance, customer_service, inclusion, other)
   - Un score de confiance entre 0.70 et 1.00 (confidence_score) - seulement si tu es sûr que c'est une vraie idée
   - Le raisonnement pour l'extraction (extraction_reasoning)
   - Le timestamp approximatif si identifiable (mentioned_at_timestamp)

4. Retourne UNIQUEMENT les idées avec confidence_score >= 0.70
5. Retourne un tableau JSON d'idées

Format JSON attendu:
[
  {
    "problem_title": "<titre concis>",
    "problem_statement": "<description détaillée>",
    "speaker_quote": "<citation exacte>",
    "speaker_context": "<contexte du locuteur si disponible>",
    "current_manual_process": "<processus manuel si mentionné>",
    "proposed_solution": "<solution proposée si mentionnée>",
    "category": "<catégorie si identifiable>",
    "digitization_opportunity": "<opportunité de numérisation>",
    "confidence_score": <nombre entre 0.70 et 1.00>,
    "extraction_reasoning": "<pourquoi tu penses que c'est une idée>",
    "mentioned_at_timestamp": "<timestamp si identifiable>"
  }
]

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire ni markdown. Si aucune idée valide n'est trouvée, retourne un tableau vide [].`;

    let extractedIdeas: ExtractedIdea[] = [];

    try {
      // Call Claude API
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content
      const content = response.content[0];
      if (content.type === 'text') {
        // Clean and parse JSON response
        const cleanedJson = cleanJsonResponse(content.text);
        const parsed = JSON.parse(cleanedJson);

        // Validate it's an array
        if (Array.isArray(parsed)) {
          extractedIdeas = parsed.filter(
            (idea: ExtractedIdea) =>
              idea &&
              typeof idea === 'object' &&
              idea.confidence_score >= 0.7 &&
              idea.problem_title &&
              idea.problem_statement &&
              idea.speaker_quote &&
              idea.digitization_opportunity
          ) as ExtractedIdea[];
        }
      }
    } catch (claudeError) {
      console.error('Claude API error during idea extraction:', claudeError);
      // Return empty array instead of crashing
      extractedIdeas = [];
    }

    // If no ideas extracted, still mark transcripts as processed and return
    if (extractedIdeas.length === 0) {
      // Mark transcripts as processed
      const transcriptIds = (transcripts as any[])?.map((t: any) => t.id) || [];
      await (supabase as any)
        .from('marrai_transcripts')
        .update({
          processed: true,
          analysis_attempted: true,
          contains_idea: false,
        })
        .in('id', transcriptIds);

      // Update session stats
      try {
        await updateSessionStats(session_id);
      } catch (statsError) {
        console.error('Error updating session stats:', statsError);
        // Don't fail the request if stats update fails
      }

      return NextResponse.json(
        {
          success: true,
          message: 'No ideas extracted (confidence threshold not met or extraction failed)',
          ideasExtracted: 0,
        },
        { status: 200 }
      );
    }

    // Insert each extracted idea into marrai_conversation_ideas
    const insertedIdeas: string[] = [];
    const transcriptIds = (transcripts as any[])?.map((t: any) => t.id) || [];

    for (const idea of extractedIdeas) {
      try {
        const conversationIdea: ConversationIdeaInsert = {
          session_id: session_id,
          transcript_ids: transcriptIds,
          mentioned_at_timestamp: idea.mentioned_at_timestamp || null,
          speaker_quote: idea.speaker_quote,
          speaker_context: idea.speaker_context || null,
          speaker_email: null, // Will be filled during validation
          problem_title: idea.problem_title,
          problem_statement: idea.problem_statement,
          current_manual_process: idea.current_manual_process || null,
          proposed_solution: idea.proposed_solution || null,
          category: idea.category || null,
          digitization_opportunity: idea.digitization_opportunity,
          confidence_score: idea.confidence_score,
          extraction_reasoning: idea.extraction_reasoning || null,
          needs_clarification: idea.confidence_score < 0.85,
          validation_question: idea.confidence_score < 0.85
            ? `Pouvez-vous confirmer que "${idea.problem_title}" est bien une idée que vous souhaitez soumettre?`
            : null,
          status: 'pending_validation',
        };

        const { data: inserted, error: insertError } = await (supabase as any)
          .from('marrai_conversation_ideas')
          .insert(conversationIdea)
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting conversation idea:', insertError);
          // Continue with other ideas even if one fails
        } else if (inserted) {
          insertedIdeas.push(inserted.id);
        }
      } catch (insertError) {
        console.error('Error processing extracted idea:', insertError);
        // Continue with next idea
      }
    }

    // Mark transcripts as processed
    try {
      await (supabase as any)
        .from('marrai_transcripts')
        .update({
          processed: true,
          analysis_attempted: true,
          contains_idea: insertedIdeas.length > 0,
        })
        .in('id', transcriptIds);
    } catch (updateError) {
      console.error('Error marking transcripts as processed:', updateError);
      // Don't fail the request if this fails
    }

    // Update session stats using helper function
    try {
      await updateSessionStats(session_id);
    } catch (statsError) {
      console.error('Error updating session stats:', statsError);
      // Don't fail the request if stats update fails
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Successfully extracted ${insertedIdeas.length} ideas from conversation`,
        ideasExtracted: insertedIdeas.length,
        ideaIds: insertedIdeas,
        transcriptsProcessed: transcripts.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in extract-ideas API route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        ideasExtracted: 0,
      },
      { status: 500 }
    );
  }
}

